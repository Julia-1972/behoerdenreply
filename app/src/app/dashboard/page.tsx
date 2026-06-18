import Link from "next/link";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { dictionaries, type Lang } from "@/i18n";
import LogoutButton from "./logout-button";
import UploadForm from "./upload-form";
import UpgradeScreen from "./upgrade-screen";

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
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "var(--bg-subtle)" }}>

      {/* Nav */}
      <nav style={{ background: "var(--bg)", borderBottom: "1.5px solid var(--border)", padding: "0 2rem", height: "56px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Link href="/" style={{ fontWeight: 700, fontSize: "1.1rem", color: "var(--fg)", textDecoration: "none" }}>
          Behörden<span style={{ color: "var(--primary)" }}>Reply</span>
        </Link>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <span style={{ fontSize: "0.85rem", color: "var(--fg-muted)" }}>{user.email}</span>
          <LogoutButton />
        </div>
      </nav>

      {/* Content */}
      <main style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "3rem 2rem" }}>

        {activeCase ? (
          <div className="card" style={{ maxWidth: "480px", width: "100%", textAlign: "center", padding: "2.5rem 2rem" }}>
            <div style={{ fontSize: "2rem", marginBottom: "1rem" }}>📋</div>
            <h2 style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: "0.5rem" }}>{t.activeCaseTitle}</h2>
            <p style={{ color: "var(--fg-muted)", fontSize: "0.9rem", marginBottom: "1.5rem" }}>Du hast einen offenen Fall. Mache dort weiter.</p>
            <Link href={`/case/${activeCase.id}`} className="btn-primary" style={{ display: "block", textAlign: "center" }}>
              {t.activeCaseGoTo}
            </Link>
          </div>
        ) : profile?.free_used && profile.plan === "free" ? (
          <UpgradeScreen lang={lang} t={t} />
        ) : subscriptionLimitReached ? (
          <div className="card" style={{ maxWidth: "480px", width: "100%", textAlign: "center", padding: "2.5rem 2rem" }}>
            <p style={{ color: "var(--fg-muted)", fontSize: "0.9rem" }}>{t.upgradeSubscriptionLimitReached}</p>
          </div>
        ) : (
          <div style={{ width: "100%", maxWidth: "560px", display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            <div>
              <h1 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "0.35rem" }}>{t.uploadTitle}</h1>
              <p style={{ color: "var(--fg-muted)", fontSize: "0.9rem" }}>{t.uploadHint}</p>
            </div>
            <UploadForm lang={lang} />
          </div>
        )}
      </main>
    </div>
  );
}
