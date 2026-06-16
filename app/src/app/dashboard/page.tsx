import Link from "next/link";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { dictionaries, type Lang } from "@/i18n";
import LogoutButton from "./logout-button";
import UploadForm from "./upload-form";
import UpgradeScreen from "./upgrade-screen";

export default async function DashboardPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

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

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 p-6">
      <p className="text-sm text-gray-600">{user.email}</p>

      {activeCase ? (
        <div className="flex flex-col items-center gap-3 text-center">
          <h2 className="text-lg font-semibold">{t.activeCaseTitle}</h2>
          <Link
            href={`/case/${activeCase.id}`}
            className="rounded bg-black px-4 py-2 text-white"
          >
            {t.activeCaseGoTo}
          </Link>
        </div>
      ) : profile?.free_used && profile.plan === "free" ? (
        <UpgradeScreen lang={lang} t={t} />
      ) : profile?.plan === "subscription" && profile.subscription_active && (() => {
        const periodStart = profile.subscription_period_start
          ? new Date(profile.subscription_period_start)
          : null;
        const now = new Date();
        const sameMonth =
          periodStart &&
          periodStart.getFullYear() === now.getFullYear() &&
          periodStart.getMonth() === now.getMonth();
        const docsUsed = sameMonth ? (profile.subscription_documents_used ?? 0) : 0;
        return docsUsed >= 30;
      })() ? (
        <div className="flex w-full max-w-sm flex-col items-center gap-4 text-center">
          <p className="text-sm text-gray-600">{t.upgradeSubscriptionLimitReached}</p>
        </div>
      ) : (
        <UploadForm lang={lang} />
      )}

      <LogoutButton />
    </div>
  );
}
