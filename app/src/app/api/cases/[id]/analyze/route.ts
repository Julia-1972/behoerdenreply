import { NextResponse } from "next/server";
import { createSupabaseServerClient, createSupabaseAdminClient } from "@/lib/supabase-server";
import { extractPdfText } from "@/lib/pdf";
import { extractBriefkopfFromText, prependBriefkopf } from "@/lib/briefkopf";
import { createAssistant, createThreadWithPdf, runAndGetResponse, extractFinalLetter } from "@/lib/assistant";
import { uploadResultFiles } from "@/lib/result-files";

export const maxDuration = 60;

const MIN_TEXT_LENGTH = 50;

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

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

  await supabase.from("cases").update({ status: "analyzing" }).eq("id", id);

  const { data: file, error: downloadError } = await supabase.storage
    .from("uploads")
    .download(caseData.original_pdf_path);

  if (downloadError || !file) {
    await supabase.from("cases").update({ status: "cancelled", error_reason: "download_failed" }).eq("id", id);
    return NextResponse.json({ error: "download_failed" }, { status: 500 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  let text = "";
  try {
    text = await extractPdfText(buffer);
  } catch {
    text = "";
  }

  if (text.length < MIN_TEXT_LENGTH) {
    await supabase.from("cases").update({ status: "cancelled", error_reason: "unreadable" }).eq("id", id);
    return NextResponse.json({ error: "unreadable" }, { status: 422 });
  }

  // Extract Briefkopf from PDF text (server-side, no AI needed)
  const bkData = extractBriefkopfFromText(text);
  const analysisSummary = "BRIEFKOPF_JSON:" + JSON.stringify(bkData);

  // Create OpenAI Assistant + Thread
  let assistantId: string;
  let threadId: string;
  let response: string;

  try {
    assistantId = await createAssistant();
    threadId = await createThreadWithPdf(text);
    response = await runAndGetResponse(threadId, assistantId);
  } catch (err) {
    console.error("[analyze] Assistant error", err);
    await supabase.from("cases").update({ status: "cancelled", error_reason: "ai_error" }).eq("id", id);
    return NextResponse.json({ error: "ai_error" }, { status: 502 });
  }

  // Save thread_id and analysis_summary
  await supabase.from("cases").update({
    analysis_summary: analysisSummary,
    thread_id: threadId,
  }).eq("id", id);

  // Check if assistant already has enough info and generated final letter
  const finalLetter = extractFinalLetter(response);

  if (finalLetter) {
    const today = new Date().toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric" });
    const finalText = prependBriefkopf(finalLetter, analysisSummary, today);

    const { pdfPath, docxPath } = await uploadResultFiles(supabase, user.id, id, finalText);

    await supabase.from("case_results").insert({
      case_id: id,
      final_text: finalText,
      pdf_path: pdfPath,
      docx_path: docxPath,
    });

    await supabase.from("cases").update({ status: "done", completed_at: new Date().toISOString() }).eq("id", id);

    const admin = createSupabaseAdminClient();
    await admin.from("profiles").update({ free_used: true }).eq("id", user.id);

    return NextResponse.json({ status: "done" });
  }

  // Assistant asked a question
  await supabase.from("case_messages").insert({
    case_id: id,
    role: "ai_question",
    content: response,
  });

  await supabase.from("cases").update({ status: "questioning" }).eq("id", id);

  return NextResponse.json({ status: "questioning", question: response });
}
