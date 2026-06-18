"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Dictionary, Lang } from "@/i18n";

export default function UpgradeScreen({ lang, t }: { lang: Lang; t: Dictionary }) {
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
    <div style={{ width: "100%", maxWidth: "480px", display: "flex", flexDirection: "column", gap: "1.25rem" }}>

      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: "2rem", marginBottom: "0.75rem" }}>✅</div>
        <h2 style={{ fontSize: "1.3rem", fontWeight: 700, marginBottom: "0.5rem" }}>{t.upgradeTitle}</h2>
        <p style={{ color: "var(--fg-muted)", fontSize: "0.9rem", lineHeight: 1.6 }}>{t.upgradeText}</p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
        <button
          onClick={() => upgrade("payperuse")}
          disabled={!!loading}
          style={{
            width: "100%",
            padding: "1rem 1.25rem",
            borderRadius: "12px",
            border: "2px solid var(--border)",
            background: "var(--bg)",
            textAlign: "left",
            cursor: loading ? "not-allowed" : "pointer",
            opacity: loading ? 0.5 : 1,
            transition: "border-color 0.15s",
          }}
          onMouseEnter={(e) => { if (!loading) (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--primary)"; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--border)"; }}
        >
          <div style={{ fontWeight: 700, fontSize: "1rem", marginBottom: "0.2rem" }}>{t.upgradePerDoc}</div>
          <div style={{ color: "var(--fg-muted)", fontSize: "0.875rem" }}>{t.upgradePerDocHint}</div>
        </button>

        <button
          onClick={() => upgrade("subscription")}
          disabled={!!loading}
          style={{
            width: "100%",
            padding: "1rem 1.25rem",
            borderRadius: "12px",
            border: "2px solid var(--primary)",
            background: "var(--primary)",
            textAlign: "left",
            cursor: loading ? "not-allowed" : "pointer",
            opacity: loading ? 0.5 : 1,
            position: "relative",
          }}
        >
          <div style={{ position: "absolute", top: "-11px", right: "1rem", background: "#16a34a", color: "#fff", borderRadius: "100px", padding: "0.15rem 0.7rem", fontSize: "0.72rem", fontWeight: 700 }}>
            Beliebt
          </div>
          <div style={{ fontWeight: 700, fontSize: "1rem", marginBottom: "0.2rem", color: "#fff" }}>{t.upgradeSubscription}</div>
          <div style={{ color: "rgba(255,255,255,0.8)", fontSize: "0.875rem" }}>{t.upgradeSubscriptionHint}</div>
        </button>
      </div>

      <p style={{ textAlign: "center", color: "var(--fg-muted)", fontSize: "0.8rem" }}>
        Nach der Auswahl kannst du sofort das nächste Dokument hochladen.
      </p>

      {loading && (
        <p style={{ textAlign: "center", color: "var(--primary)", fontSize: "0.875rem" }}>{t.upgradeProcessing}</p>
      )}
    </div>
  );
}
