import { NextResponse } from "next/server";
import { createSupabaseServerClient, createSupabaseAdminClient } from "@/lib/supabase-server";
import { extractPdfText } from "@/lib/pdf";
import { openai, AI_MODEL } from "@/lib/openai";
import { getNextQaStep } from "@/lib/qa";
import { uploadResultFiles } from "@/lib/result-files";

const MIN_TEXT_LENGTH = 50;

const ANALYSIS_SYSTEM_PROMPT = `Du bist ein Assistent, der amtliche Schreiben aus Deutschland analysiert.

Lies den folgenden Brief und erstelle eine kurze, strukturierte interne Zusammenfassung (auf Deutsch) mit:
- Absender (Behörde/Institution)
- Thema / Anliegen des Schreibens
- konkrete Forderungen oder Fragen an den Empfänger
- Fristen, falls genannt
- fehlende Informationen, die für eine Antwort benötigt werden

Diese Zusammenfassung ist nur für die interne Weiterverarbeitung und wird dem Nutzer nicht direkt angezeigt.`;

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { data: caseData } = await supabase
    .from("cases")
    .select("id, user_id, status, original_pdf_path")
    .eq("id", id)
    .single();

  if (!caseData || caseData.user_id !== user.id) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  if (caseData.status !== "uploaded") {
    return NextResponse.json({ status: caseData.status });
  }

  await supabase
    .from("cases")
    .update({ status: "analyzing" })
    .eq("id", id);

  const { data: file, error: downloadError } = await supabase.storage
    .from("uploads")
    .download(caseData.original_pdf_path);

  if (downloadError || !file) {
    await supabase
      .from("cases")
      .update({ status: "cancelled", error_reason: "download_failed" })
      .eq("id", id);

    return NextResponse.json({ error: "download_failed" }, { status: 500 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  let text: string;
  console.log("[analyze] before extract");
  try {
    text = await extractPdfText(buffer);
    console.log("[analyze] text length", text.length);
  } catch (err) {
    console.error("[analyze] extract error", err);
    text = "";
  }

  console.log("[analyze debug] MIN_TEXT_LENGTH:", MIN_TEXT_LENGTH);
  console.log("[analyze debug] text.length:", text.length);
  console.log("[analyze debug] first 500 chars:", text.slice(0, 500));

  if (text.length < MIN_TEXT_LENGTH) {
    console.log("[analyze debug] -> unreadable path taken (text too short)");

    await supabase
      .from("cases")
      .update({ status: "cancelled", error_reason: "unreadable" })
      .eq("id", id);

    return NextResponse.json({ error: "unreadable" }, { status: 422 });
  }

  console.log("[analyze debug] -> proceeding to AI analysis");

  let analysisSummary: string;
  try {
    const completion = await openai.chat.completions.create({
      model: AI_MODEL,
      messages: [
        { role: "system", content: ANALYSIS_SYSTEM_PROMPT },
        { role: "user", content: text.slice(0, 12000) },
      ],
    });

    analysisSummary = completion.choices[0]?.message?.content ?? "";
  } catch (err) {
    console.error("[analyze] OpenAI error", err);

    await supabase
      .from("cases")
      .update({ status: "cancelled", error_reason: "ai_error" })
      .eq("id", id);

    return NextResponse.json({ error: "ai_error" }, { status: 502 });
  }

  await supabase
    .from("cases")
    .update({ analysis_summary: analysisSummary })
    .eq("id", id);

  const { data: profile } = await supabase
    .from("profiles")
    .select("language")
    .eq("id", user.id)
    .single();

  const lang = profile?.language === "de" ? "de" : "ru";

  let decision;
  try {
    decision = await getNextQaStep(analysisSummary, [], lang);
  } catch (err) {
    console.error("[analyze] QA decision error", err);

    await supabase
      .from("cases")
      .update({ status: "cancelled", error_reason: "ai_error" })
      .eq("id", id);

    return NextResponse.json({ error: "ai_error" }, { status: 502 });
  }

  if (decision.action === "final") {
    const { pdfPath, docxPath } = await uploadResultFiles(
      supabase,
      user.id,
      id,
      decision.content
    );

    await supabase.from("case_results").insert({
      case_id: id,
      final_text: decision.content,
      pdf_path: pdfPath,
      docx_path: docxPath,
    });

    await supabase
      .from("cases")
      .update({ status: "done", completed_at: new Date().toISOString() })
      .eq("id", id);

    await createSupabaseAdminClient()
      .from("profiles")
      .update({ free_used: true })
      .eq("id", user.id);

    return NextResponse.json({ status: "done" });
  }

  await supabase.from("case_messages").insert({
    case_id: id,
    role: "ai_question",
    content: decision.content,
  });

  await supabase
    .from("cases")
    .update({ status: "questioning" })
    .eq("id", id);

  return NextResponse.json({ status: "questioning" });
}
