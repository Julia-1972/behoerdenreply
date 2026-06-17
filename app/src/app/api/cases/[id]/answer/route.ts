import { NextResponse } from "next/server";
import { createSupabaseServerClient, createSupabaseAdminClient } from "@/lib/supabase-server";
import { uploadResultFiles, getResultSignedUrls } from "@/lib/result-files";
import { prependBriefkopf } from "@/lib/briefkopf";
import { createAssistant, addUserMessage, runAndGetResponse, extractFinalLetter } from "@/lib/assistant";

export const maxDuration = 60;

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => null);
  const answer = typeof body?.answer === "string" ? body.answer.trim() : "";
  if (!answer) return NextResponse.json({ error: "empty_answer" }, { status: 400 });

  const { data: caseData } = await supabase
    .from("cases")
    .select("id, user_id, status, analysis_summary, thread_id")
    .eq("id", id)
    .single();

  if (!caseData || caseData.user_id !== user.id) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  if (caseData.status !== "questioning" || !caseData.thread_id) {
    return NextResponse.json({ status: caseData.status });
  }

  // Save user answer to DB
  await supabase.from("case_messages").insert({
    case_id: id,
    role: "user_answer",
    content: answer,
  });

  // Add answer to thread and get AI response
  let response: string;
  try {
    const assistantId = await createAssistant();
    await addUserMessage(caseData.thread_id, answer);
    response = await runAndGetResponse(caseData.thread_id, assistantId);
  } catch (err) {
    console.error("[answer] Assistant error", err);
    await supabase.from("cases").update({ status: "cancelled", error_reason: "ai_error" }).eq("id", id);
    return NextResponse.json({ error: "ai_error" }, { status: 502 });
  }

  // Check for final letter
  const finalLetter = extractFinalLetter(response);

  if (finalLetter) {
    const today = new Date().toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric" });
    const finalText = prependBriefkopf(finalLetter, caseData.analysis_summary, today);

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

    const { data: prof } = await admin
      .from("profiles")
      .select("plan, subscription_documents_used, subscription_period_start")
      .eq("id", user.id)
      .single();

    if (prof?.plan === "subscription") {
      const now = new Date();
      const periodStart = prof.subscription_period_start ? new Date(prof.subscription_period_start) : null;
      const sameMonth = periodStart &&
        periodStart.getFullYear() === now.getFullYear() &&
        periodStart.getMonth() === now.getMonth();
      const newCount = sameMonth ? (prof.subscription_documents_used ?? 0) + 1 : 1;
      await admin.from("profiles").update({ subscription_documents_used: newCount }).eq("id", user.id);
    }

    const { pdfUrl, docxUrl } = await getResultSignedUrls(supabase, pdfPath, docxPath);

    return NextResponse.json({
      status: "done",
      final_text: finalText,
      pdf_url: pdfUrl,
      docx_url: docxUrl,
    });
  }

  // Still asking questions
  await supabase.from("case_messages").insert({
    case_id: id,
    role: "ai_question",
    content: response,
  });

  return NextResponse.json({ status: "questioning", question: response });
}
