import { NextResponse } from "next/server";
import { createSupabaseServerClient, createSupabaseAdminClient } from "@/lib/supabase-server";
import { getNextQaStep } from "@/lib/qa";
import { uploadResultFiles, getResultSignedUrls } from "@/lib/result-files";
import { prependBriefkopf } from "@/lib/briefkopf";

export const maxDuration = 60;

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

  const body = await request.json().catch(() => null);
  const answer = typeof body?.answer === "string" ? body.answer.trim() : "";

  if (!answer) {
    return NextResponse.json({ error: "empty_answer" }, { status: 400 });
  }

  const { data: caseData } = await supabase
    .from("cases")
    .select("id, user_id, status, analysis_summary")
    .eq("id", id)
    .single();

  if (!caseData || caseData.user_id !== user.id) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  if (caseData.status !== "questioning" || !caseData.analysis_summary) {
    return NextResponse.json({ status: caseData.status });
  }

  await supabase.from("case_messages").insert({
    case_id: id,
    role: "user_answer",
    content: answer,
  });

  const { data: messages } = await supabase
    .from("case_messages")
    .select("role, content")
    .eq("case_id", id)
    .order("created_at", { ascending: true });

  const { data: profile } = await supabase
    .from("profiles")
    .select("language")
    .eq("id", user.id)
    .single();

  const lang = profile?.language === "de" ? "de" : "ru";

  let decision;
  try {
    decision = await getNextQaStep(
      caseData.analysis_summary,
      messages ?? [],
      lang
    );
  } catch (err) {
    console.error("[answer] QA decision error", err);

    await supabase
      .from("cases")
      .update({ status: "cancelled", error_reason: "ai_error" })
      .eq("id", id);

    return NextResponse.json({ error: "ai_error" }, { status: 502 });
  }

  if (decision.action === "final") {
    const today = new Date().toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric" });
    const finalText = lang === "de"
      ? prependBriefkopf(decision.content, caseData.analysis_summary, today)
      : decision.content;
    const { pdfPath, docxPath } = await uploadResultFiles(
      supabase,
      user.id,
      id,
      finalText
    );

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

    const { pdfUrl, docxUrl } = await getResultSignedUrls(
      supabase,
      pdfPath,
      docxPath
    );

    return NextResponse.json({
      status: "done",
      final_text: finalText,
      pdf_url: pdfUrl,
      docx_url: docxUrl,
    });
  }

  await supabase.from("case_messages").insert({
    case_id: id,
    role: "ai_question",
    content: decision.content,
  });

  return NextResponse.json({ status: "questioning", question: decision.content });
}
