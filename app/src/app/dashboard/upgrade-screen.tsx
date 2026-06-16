"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Dictionary, Lang } from "@/i18n";

export default function UpgradeScreen({
  lang,
  t,
}: {
  lang: Lang;
  t: Dictionary;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState<"payperuse" | "subscription" | null>(null);

  async function upgrade(plan: "payperuse" | "subscription") {
    setLoading(plan);
    await fetch("/api/upgrade", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan }),
    });
    router.refresh();
  }

  return (
    <div className="flex w-full max-w-sm flex-col items-center gap-4 text-center">
      <h2 className="text-lg font-semibold">{t.upgradeTitle}</h2>
      <p className="text-sm text-gray-600">{t.upgradeText}</p>

      <button
        onClick={() => upgrade("payperuse")}
        disabled={!!loading}
        className="w-full rounded border-2 border-black px-4 py-3 text-left disabled:opacity-50"
      >
        <div className="font-semibold">{t.upgradePerDoc}</div>
        <div className="text-sm text-gray-500">{t.upgradePerDocHint}</div>
      </button>

      <button
        onClick={() => upgrade("subscription")}
        disabled={!!loading}
        className="w-full rounded bg-black px-4 py-3 text-left text-white disabled:opacity-50"
      >
        <div className="font-semibold">{t.upgradeSubscription}</div>
        <div className="text-sm text-gray-300">{t.upgradeSubscriptionHint}</div>
      </button>

      {loading && (
        <p className="text-sm text-gray-500">{t.upgradeProcessing}</p>
      )}
    </div>
  );
}
