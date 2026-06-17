import { NextResponse } from "next/server";
import { createSupabaseServerClient, createSupabaseAdminClient } from "@/lib/supabase-server";
import { extractPdfText } from "@/lib/pdf";
import { openai, AI_MODEL } from "@/lib/openai";
import { getNextQaStep } from "@/lib/qa";
import { uploadResultFiles } from "@/lib/result-files";
import { prependBriefkopf } from "@/lib/briefkopf";

export const maxDuration = 60;

const MIN_TEXT_LENGTH = 50;

const ANALYSIS_SYSTEM_PROMPT = `Du bist ein Assistent, der amtliche Schreiben aus Deutschland analysiert.

Lies den folgenden Brief und erstelle eine kurze, strukturierte interne Zusammenfassung (auf Deutsch) mit:
- Absender (Behörde/Institution)
- Thema / Anliegen des Schreibens
- konkrete Forderungen oder Fragen an den Empfänger
- Fristen, falls genannt
- fehlende Informationen, die für eine Antwort benötigt werden

Diese Zusammenfassung ist nur für die interne Weiterverarbeitung und wird dem Nutzer nicht direkt angezeigt.`;

const BRIEFKOPF_EXTRACT_PROMPT = `Du extrahierst Metadaten aus einem deutschen Behördenschreiben. Antworte ausschließlich als JSON-Objekt mit diesen Feldern:
{
  "nutzerName": "Vollständiger Name des Briefempfängers (Person die antwortet)",
  "nutzerAdresse": "Straße Hausnummer, PLZ Ort des Briefempfängers",
  "behördeName": "Vollständiger Name der Behörde/Institution",
  "behördeAdresse": "Postanschrift der Behörde (PLZ Ort)",
  "aktenzeichen": "Mein Zeichen, Ihr Zeichen oder Kundennummer aus dem Schreiben (oder leer lassen)"
}`;

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
  console.log("[analyze debug] openai client ready:", !!openai);
  console.log("[analyze debug] model:", AI_MODEL);
  console.log("[analyze debug] text chars to send:", Math.min(text.length, 12000));

  let analysisSummary: string;
  console.log("[analyze debug] calling openai.chat.completions.create ...");
  try {
    const completion = await openai.chat.completions.create({
      model: AI_MODEL,
      messages: [
        { role: "system", content: ANALYSIS_SYSTEM_PROMPT },
        { role: "user", content: text.slice(0, 12000) },
      ],
    });
    console.log("[analyze debug] openai call returned, choices:", completion.choices?.length);

    analysisSummary = completion.choices[0]?.message?.content ?? "";
    console.log("[analyze debug] analysisSummary length:", analysisSummary.length);
  } catch (err) {
    console.error("[analyze] OpenAI error", err);

    await supabase
      .from("cases")
      .update({ status: "cancelled", error_reason: "ai_error" })
      .eq("id", id);

    return NextResponse.json({ error: "ai_error" }, { status: 502 });
  }

  // Second call: extract Briefkopf metadata as structured JSON
  try {
    const bkCompletion = await openai.chat.completions.create({
      model: AI_MODEL,
      messages: [
        { role: "system", content: BRIEFKOPF_EXTRACT_PROMPT },
        { role: "user", content: text.slice(0, 4000) },
      ],
      response_format: { type: "json_object" },
    });
    const bkJson = bkCompletion.choices[0]?.message?.content ?? "{}";
    analysisSummary = analysisSummary + "\nBRIEFKOPF_JSON:" + bkJson;
    console.log("[analyze debug] briefkopf extracted:", bkJson);
  } catch (err) {
    console.error("[analyze] briefkopf extraction error (non-fatal):", err);
  }

  console.log("[analyze debug] saving analysis_summary to DB ...");
  await supabase
    .from("cases")
    .update({ analysis_summary: analysisSummary })
    .eq("id", id);
  console.log("[analyze debug] analysis_summary saved");

  const { data: profile } = await supabase
    .from("profiles")
    .select("language")
    .eq("id", user.id)
    .single();

  const lang = profile?.language === "de" ? "de" : "ru";
  console.log("[analyze debug] lang:", lang);

  let decision;
  console.log("[analyze debug] calling getNextQaStep ...");
  try {
    decision = await getNextQaStep(analysisSummary, [], lang);
    console.log("[analyze debug] getNextQaStep action:", decision.action);
  } catch (err) {
    console.error("[analyze] QA decision error", err);

    await supabase
      .from("cases")
      .update({ status: "cancelled", error_reason: "ai_error" })
      .eq("id", id);

    return NextResponse.json({ error: "ai_error" }, { status: 502 });
  }

  if (decision.action === "final") {
    console.log("[analyze debug] action=final, uploading result files ...");
    const today = new Date().toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric" });
    const finalText = lang === "de"
      ? prependBriefkopf(decision.content, analysisSummary, today)
      : decision.content;
    const { pdfPath, docxPath } = await uploadResultFiles(
      supabase,
      user.id,
      id,
      finalText
    );
    console.log("[analyze debug] files uploaded:", pdfPath, docxPath);

    await supabase.from("case_results").insert({
      case_id: id,
      final_text: finalText,
      pdf_path: pdfPath,
      docx_path: docxPath,
    });

    await supabase
      .from("cases")
      .update({ status: "done", completed_at: new Date().toISOString() })
      .eq("id", id);

    const admin = createSupabaseAdminClient();
    await admin.from("profiles").update({ free_used: true }).eq("id", user.id);

    const { data: prof } = await admin
      .from("profiles")
      .select("plan, subscription_documents_used, subscription_period_start")
      .eq("id", user.id)
      .single();

    if (prof?.plan === "subscription") {
      const now = new Date();
      const periodStart = prof.subscription_period_start
        ? new Date(prof.subscription_period_start)
        : null;
      const sameMonth =
        periodStart &&
        periodStart.getFullYear() === now.getFullYear() &&
        periodStart.getMonth() === now.getMonth();
      const newCount = sameMonth ? (prof.subscription_documents_used ?? 0) + 1 : 1;
      await admin
        .from("profiles")
        .update({ subscription_documents_used: newCount })
        .eq("id", user.id);
    }

    console.log("[analyze debug] done (final path)");
    return NextResponse.json({ status: "done" });
  }

  console.log("[analyze debug] action=question, inserting ai_question message ...");
  await supabase.from("case_messages").insert({
    case_id: id,
    role: "ai_question",
    content: decision.content,
  });

  await supabase
    .from("cases")
    .update({ status: "questioning" })
    .eq("id", id);

  console.log("[analyze debug] done (questioning path)");
  return NextResponse.json({ status: "questioning", question: decision.content });
}
