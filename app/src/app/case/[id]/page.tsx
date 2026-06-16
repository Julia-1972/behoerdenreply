import { notFound, redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { dictionaries, type Lang } from "@/i18n";
import CaseClient from "./case-client";
import { getResultSignedUrls } from "@/lib/result-files";

export default async function CasePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: caseData } = await supabase
    .from("cases")
    .select("id, user_id, status, error_reason")
    .eq("id", id)
    .single();

  if (!caseData || caseData.user_id !== user.id) {
    notFound();
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("language")
    .eq("id", user.id)
    .single();

  const lang: Lang = profile?.language === "de" ? "de" : "ru";
  const t = dictionaries[lang];

  const { data: messages } = await supabase
    .from("case_messages")
    .select("id, role, content, created_at")
    .eq("case_id", id)
    .order("created_at", { ascending: true });

  const { data: result } = await supabase
    .from("case_results")
    .select("final_text, pdf_path, docx_path")
    .eq("case_id", id)
    .maybeSingle();

  const { pdfUrl, docxUrl } = await getResultSignedUrls(
    supabase,
    result?.pdf_path ?? null,
    result?.docx_path ?? null
  );

  const initialResult = result
    ? { final_text: result.final_text, pdf_url: pdfUrl, docx_url: docxUrl }
    : null;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-6">
      <CaseClient
        caseId={caseData.id}
        initialStatus={caseData.status}
        errorReason={caseData.error_reason}
        initialMessages={messages ?? []}
        initialResult={initialResult}
        lang={lang}
        t={t}
      />
    </div>
  );
}
