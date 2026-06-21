import Link from "next/link";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { dictionaries, type Lang } from "@/i18n";
import LogoutButton from "./logout-button";
import UploadForm from "./upload-form";
import UpgradeScreen from "./upgrade-screen";
import LangSwitcher from "../components/lang-switcher";
import BackButton from "../components/back-button";

export default async function DashboardPage() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("language, plan, free_used, subscription_active, subscription_documents_used, subscription_period_start")
    .eq("id", user.id)
    .single();

  const lang: Lang = profile?.language === "de" ? "de" : "ru";
  const t = dictionaries[lang];

  const { data: activeCase } = await supabase
    .from("cases")
    .select("id")
    .eq("user_id", user.id)
    .not("status", "in", "(done,cancelled)")
    .maybeSingle();

  const subscriptionLimitReached = profile?.plan === "subscription" && profile.subscription_active && (() => {
    const periodStart = profile.subscription_period_start ? new Date(profile.subscription_period_start) : null;
    const now = new Date();
    const sameMonth = periodStart && periodStart.getFullYear() === now.getFullYear() && periodStart.getMonth() === now.getMonth();
    return (sameMonth ? (profile.subscription_documents_used ?? 0) : 0) >= 30;
  })();

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "var(--bg)" }}>
      <nav style={{ background: "linear-gradient(90deg, #1E1133 0%, #261245 55%, #1E1133 100%)", padding: "0 2.5rem", height: "72px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 100, boxShadow: "0 8px 32px rgba(30,17,51,0.28)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <BackButton label={t.navBack} href="/" />
          <Link href="/" style={{ fontWeight: 800, fontSize: "1.2rem", color: "#fff", textDecoration: "none" }}>
            Behörden<span style={{ color: "var(--gold)" }}>Reply</span>
          </Link>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <LangSwitcher current={lang} />
          <span style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.6)" }}>{user.email}</span>
          <LogoutButton label={t.navLogout} />
        </div>
      </nav>

      <main style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "2rem", overflowY: "auto" }}>
        {activeCase ? (
          <div style={{ background: "var(--bg-white)", borderRadius: "18px", padding: "2.5rem 2rem", maxWidth: "480px", width: "100%", textAlign: "center", boxShadow: "0 8px 40px rgba(30,18,69,0.08)", border: "1.5px solid var(--border)" }}>
            <div style={{ fontSize: "2rem", marginBottom: "1rem" }}>📋</div>
            <h2 style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: "0.5rem" }}>{t.activeCaseTitle}</h2>
            <p style={{ color: "var(--fg-muted)", fontSize: "0.9rem", marginBottom: "1.5rem" }}>{t.activeCaseSubtitle}</p>
            <Link href={`/case/${activeCase.id}`} className="btn-gold" style={{ display: "block", textAlign: "center" }}>
              {t.activeCaseGoTo}
            </Link>
          </div>
        ) : profile?.free_used && profile.plan === "free" ? (
          <UpgradeScreen lang={lang} t={t} />
        ) : subscriptionLimitReached ? (
          <div style={{ background: "var(--bg-white)", borderRadius: "18px", padding: "2.5rem 2rem", maxWidth: "480px", width: "100%", textAlign: "center", border: "1.5px solid var(--border)" }}>
            <p style={{ color: "var(--fg-muted)", fontSize: "0.9rem" }}>{t.upgradeSubscriptionLimitReached}</p>
          </div>
        ) : (
          <div style={{ width: "100%", maxWidth: "560px" }}>
            <h1 style={{ fontSize: "1.6rem", fontWeight: 800, marginBottom: "0.35rem" }}>{t.uploadTitle}</h1>
            <p style={{ color: "var(--fg-muted)", fontSize: "0.9rem", marginBottom: "1.75rem" }}>{t.uploadHint}</p>
            <UploadForm lang={lang} />
          </div>
        )}
      </main>
    </div>
  );
}
