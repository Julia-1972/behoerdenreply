import { NextResponse } from "next/server";
import { createSupabaseServerClient, createSupabaseAdminClient } from "@/lib/supabase-server";
import { getNextQaStep } from "@/lib/qa";
import { uploadResultFiles, getResultSignedUrls } from "@/lib/result-files";

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

    const { pdfUrl, docxUrl } = await getResultSignedUrls(
      supabase,
      pdfPath,
      docxPath
    );

    return NextResponse.json({
      status: "done",
      final_text: decision.content,
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
