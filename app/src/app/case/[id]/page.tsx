import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { dictionaries, type Lang } from "@/i18n";
import CaseClient from "./case-client";
import { getResultSignedUrls } from "@/lib/result-files";
import LangSwitcher from "../../components/lang-switcher";
import BackButton from "../../components/back-button";

export default async function CasePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: caseData } = await supabase
    .from("cases").select("id, user_id, status, error_reason").eq("id", id).single();
  if (!caseData || caseData.user_id !== user.id) notFound();

  const { data: profile } = await supabase.from("profiles").select("language").eq("id", user.id).single();
  const lang: Lang = profile?.language === "de" ? "de" : "ru";
  const t = dictionaries[lang];

  const { data: messages } = await supabase
    .from("case_messages").select("id, role, content, created_at").eq("case_id", id).order("created_at", { ascending: true });

  const { data: result } = await supabase
    .from("case_results").select("final_text, pdf_path, docx_path").eq("case_id", id).maybeSingle();

  const { pdfUrl, docxUrl } = await getResultSignedUrls(supabase, result?.pdf_path ?? null, result?.docx_path ?? null);
  const initialResult = result ? { final_text: result.final_text, pdf_url: pdfUrl, docx_url: docxUrl } : null;

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "var(--bg)" }}>
      <nav style={{ background: "linear-gradient(90deg, #1E1133 0%, #261245 55%, #1E1133 100%)", padding: "0 2.5rem", height: "72px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 100, boxShadow: "0 8px 32px rgba(30,17,51,0.28)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <BackButton label={t.navBack} href="/dashboard" />
          <span style={{ fontWeight: 800, fontSize: "1.1rem", color: "#fff" }}>
            Behörden<span style={{ color: "var(--gold)" }}>Reply</span>
          </span>
        </div>
        <LangSwitcher current={lang} />
      </nav>
      <main style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "2rem" }}>
        <CaseClient
          caseId={caseData.id}
          initialStatus={caseData.status}
          errorReason={caseData.error_reason}
          initialMessages={messages ?? []}
          initialResult={initialResult}
          lang={lang}
          t={t}
        />
      </main>
    </div>
  );
}
