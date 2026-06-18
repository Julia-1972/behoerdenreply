"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";
import { dictionaries, type Lang } from "@/i18n";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();

  const [lang, setLang] = useState<Lang>("ru");
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const t = dictionaries[lang];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (mode === "login") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) { setError(error.message); setLoading(false); return; }
      await fetch("/api/profile/language", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lang }),
      });
    } else {
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) { setError(error.message); setLoading(false); return; }
      if (data.user) {
        await supabase.from("profiles").insert({ id: data.user.id, language: lang });
      }
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "var(--bg)" }}>

      <nav style={{ background: "linear-gradient(90deg, #1E1133 0%, #261245 55%, #1E1133 100%)", padding: "0 2.5rem", height: "72px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 100, boxShadow: "0 8px 32px rgba(30,17,51,0.28)" }}>
        <Link href="/" style={{ fontWeight: 800, fontSize: "1.2rem", color: "#fff", textDecoration: "none" }}>
          Behörden<span style={{ color: "var(--gold)" }}>Reply</span>
        </Link>
        <div style={{ display: "flex", gap: "0.4rem" }}>
          {(["ru", "de"] as Lang[]).map((l) => (
            <button key={l} type="button" onClick={() => setLang(l)} style={{
              padding: "0.3rem 0.8rem", borderRadius: "6px", fontSize: "0.8rem", fontWeight: 600,
              border: "1.5px solid", cursor: "pointer",
              background: lang === l ? "var(--gold)" : "transparent",
              color: lang === l ? "#fff" : "rgba(255,255,255,0.6)",
              borderColor: lang === l ? "var(--gold)" : "rgba(255,255,255,0.3)",
            }}>{l.toUpperCase()}</button>
          ))}
        </div>
      </nav>

      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem" }}>
        <div style={{ background: "var(--bg-white)", borderRadius: "18px", padding: "2.5rem", width: "100%", maxWidth: "420px", boxShadow: "0 8px 40px rgba(30,18,69,0.10)", border: "1.5px solid var(--border)" }}>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 800, marginBottom: "0.3rem", color: "var(--fg)" }}>
            {mode === "login" ? t.login : t.register}
          </h1>
          <p style={{ color: "var(--fg-muted)", fontSize: "0.875rem", marginBottom: "1.75rem" }}>
            {mode === "login" ? t.loginSubtitle : t.registerSubtitle}
          </p>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <input type="email" required placeholder={t.email} value={email} onChange={(e) => setEmail(e.target.value)} className="input" />
            <input type="password" required placeholder={t.password} value={password} onChange={(e) => setPassword(e.target.value)} className="input" />

            {error && (
              <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: "8px", padding: "0.625rem 0.875rem", fontSize: "0.875rem", color: "#dc2626" }}>
                {error}
              </div>
            )}

            <button type="submit" disabled={loading} className="btn-gold" style={{ width: "100%", marginTop: "0.25rem" }}>
              {loading ? "..." : mode === "login" ? t.loginButton : t.registerButton}
            </button>
          </form>

          <div style={{ textAlign: "center", marginTop: "1.25rem" }}>
            <button type="button" onClick={() => { setMode(mode === "login" ? "register" : "login"); setError(null); }}
              style={{ background: "none", border: "none", cursor: "pointer", color: "var(--primary)", fontSize: "0.875rem", textDecoration: "underline" }}>
              {mode === "login" ? t.switchToRegister : t.switchToLogin}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
