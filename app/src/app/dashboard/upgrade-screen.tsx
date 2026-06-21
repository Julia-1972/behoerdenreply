"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Dictionary, Lang } from "@/i18n";

export default function UpgradeScreen({ lang, t }: { lang: Lang; t: Dictionary }) {
  const router = useRouter();
  const [selectedPlan, setSelectedPlan] = useState<"payperuse" | "subscription" | null>(null);
  const [loading, setLoading] = useState(false);
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [cardHolder, setCardHolder] = useState("");

  async function handlePayment(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedPlan) return;
    setLoading(true);
    await fetch("/api/upgrade", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan: selectedPlan }),
    });
    router.refresh();
  }

  function formatCardNumber(val: string) {
    const digits = val.replace(/\D/g, "").slice(0, 16);
    return digits.replace(/(.{4})/g, "$1 ").trim();
  }

  function formatExpiry(val: string) {
    const digits = val.replace(/\D/g, "").slice(0, 4);
    if (digits.length > 2) return digits.slice(0, 2) + "/" + digits.slice(2);
    return digits;
  }

  if (selectedPlan) {
    const amount = selectedPlan === "payperuse" ? "3,99 €" : "9,99 € / " + t.subscriptionPeriod;
    return (
      <div style={{ width: "100%", maxWidth: "440px", display: "flex", flexDirection: "column", gap: "1rem" }}>
        <div style={{ textAlign: "center", marginBottom: "0.25rem" }}>
          <div style={{ fontSize: "1.5rem", marginBottom: "0.4rem" }}>💳</div>
          <h2 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: "0.25rem" }}>{t.paymentTitle}</h2>
          <p style={{ color: "var(--violet)", fontWeight: 700, fontSize: "1.3rem" }}>{amount}</p>
        </div>

        <form onSubmit={handlePayment} style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          <div>
            <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--fg-muted)", marginBottom: "0.3rem", display: "block" }}>{t.paymentCardHolder}</label>
            <input type="text" required placeholder="Max Mustermann" value={cardHolder} onChange={(e) => setCardHolder(e.target.value)} className="input" style={{ width: "100%" }} />
          </div>
          <div>
            <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--fg-muted)", marginBottom: "0.3rem", display: "block" }}>{t.paymentCardNumber}</label>
            <input type="text" required placeholder="1234 5678 9012 3456" value={cardNumber} onChange={(e) => setCardNumber(formatCardNumber(e.target.value))} className="input" style={{ width: "100%", letterSpacing: "0.1em" }} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
            <div>
              <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--fg-muted)", marginBottom: "0.3rem", display: "block" }}>{t.paymentExpiry}</label>
              <input type="text" required placeholder="MM/YY" value={expiry} onChange={(e) => setExpiry(formatExpiry(e.target.value))} className="input" style={{ width: "100%" }} />
            </div>
            <div>
              <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--fg-muted)", marginBottom: "0.3rem", display: "block" }}>{t.paymentCvv}</label>
              <input type="text" required placeholder="123" value={cvv} onChange={(e) => setCvv(e.target.value.replace(/\D/g, "").slice(0, 3))} className="input" style={{ width: "100%" }} />
            </div>
          </div>

          <button type="submit" disabled={loading} className="btn-gold" style={{ width: "100%", marginTop: "0.25rem", fontSize: "1rem" }}>
            {loading ? t.upgradeProcessing : t.paymentButton}
          </button>
        </form>

        <p style={{ textAlign: "center", color: "var(--fg-muted)", fontSize: "0.75rem", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.4rem" }}>
          🔒 {t.paymentSecure}
        </p>

        <button type="button" onClick={() => setSelectedPlan(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--violet)", fontSize: "0.85rem", textDecoration: "underline", textAlign: "center" }}>
          {t.paymentBack}
        </button>
      </div>
    );
  }

  return (
    <div style={{ width: "100%", maxWidth: "480px", display: "flex", flexDirection: "column", gap: "0.75rem" }}>

      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>✅</div>
        <h2 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: "0.35rem" }}>{t.upgradeTitle}</h2>
        <p style={{ color: "var(--fg-muted)", fontSize: "0.875rem", lineHeight: 1.5 }}>{t.upgradeText}</p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
        <button
          onClick={() => setSelectedPlan("payperuse")}
          style={{
            width: "100%",
            padding: "1rem 1.25rem",
            borderRadius: "12px",
            border: "2px solid var(--border)",
            background: "var(--bg)",
            textAlign: "left",
            cursor: "pointer",
            transition: "border-color 0.15s",
          }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--violet)"; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--border)"; }}
        >
          <div style={{ fontWeight: 700, fontSize: "1rem", marginBottom: "0.2rem" }}>{t.upgradePerDoc}</div>
          <div style={{ color: "var(--fg-muted)", fontSize: "0.875rem" }}>{t.upgradePerDocHint}</div>
        </button>

        <button
          onClick={() => setSelectedPlan("subscription")}
          style={{
            width: "100%",
            padding: "1rem 1.25rem",
            borderRadius: "12px",
            border: "2px solid var(--violet)",
            background: "var(--violet)",
            textAlign: "left",
            cursor: "pointer",
            position: "relative",
          }}
        >
          <div style={{ position: "absolute", top: "-11px", right: "1rem", background: "#16a34a", color: "#fff", borderRadius: "100px", padding: "0.15rem 0.7rem", fontSize: "0.72rem", fontWeight: 700 }}>
            {t.priceSingleBadge}
          </div>
          <div style={{ fontWeight: 700, fontSize: "1rem", marginBottom: "0.2rem", color: "#fff" }}>{t.upgradeSubscription}</div>
          <div style={{ color: "rgba(255,255,255,0.8)", fontSize: "0.875rem" }}>{t.upgradeSubscriptionHint}</div>
        </button>
      </div>

      <p style={{ textAlign: "center", color: "var(--fg-muted)", fontSize: "0.8rem" }}>
        {t.upgradeFooter}
      </p>
    </div>
  );
}
