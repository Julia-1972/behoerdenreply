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
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "var(--bg-subtle)" }}>

      {/* Nav */}
      <nav style={{ background: "var(--bg)", borderBottom: "1.5px solid var(--border)", padding: "0 2rem", height: "56px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 100 }}>
        <Link href="/" style={{ fontWeight: 700, fontSize: "1.1rem", color: "var(--fg)", textDecoration: "none" }}>
          Behörden<span style={{ color: "var(--primary)" }}>Reply</span>
        </Link>
        <div style={{ display: "flex", gap: "0.4rem" }}>
          {(["ru", "de"] as Lang[]).map((l) => (
            <button
              key={l}
              type="button"
              onClick={() => setLang(l)}
              style={{
                padding: "0.25rem 0.7rem",
                borderRadius: "6px",
                fontSize: "0.8rem",
                fontWeight: 600,
                border: "1.5px solid",
                cursor: "pointer",
                background: lang === l ? "var(--primary)" : "transparent",
                color: lang === l ? "#fff" : "var(--fg-muted)",
                borderColor: lang === l ? "var(--primary)" : "var(--border)",
              }}
            >
              {l.toUpperCase()}
            </button>
          ))}
        </div>
      </nav>

      {/* Form */}
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem" }}>
        <div className="card" style={{ width: "100%", maxWidth: "400px", padding: "2rem" }}>
          <h1 style={{ fontSize: "1.4rem", fontWeight: 700, marginBottom: "0.25rem" }}>
            {mode === "login" ? t.login : t.register}
          </h1>
          <p style={{ color: "var(--fg-muted)", fontSize: "0.9rem", marginBottom: "1.75rem" }}>
            {mode === "login"
              ? "Melde dich an, um deine Fälle zu öffnen."
              : "Erstelle ein Konto - das erste Dokument ist kostenlos."}
          </p>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <input
              type="email"
              required
              placeholder={t.email}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input"
            />
            <input
              type="password"
              required
              placeholder={t.password}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input"
            />

            {error && (
              <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: "8px", padding: "0.625rem 0.875rem", fontSize: "0.875rem", color: "#dc2626" }}>
                {error}
              </div>
            )}

            <button type="submit" disabled={loading} className="btn-primary" style={{ width: "100%", marginTop: "0.25rem" }}>
              {loading ? "..." : mode === "login" ? t.loginButton : t.registerButton}
            </button>
          </form>

          <div style={{ textAlign: "center", marginTop: "1.25rem" }}>
            <button
              type="button"
              onClick={() => { setMode(mode === "login" ? "register" : "login"); setError(null); }}
              style={{ background: "none", border: "none", cursor: "pointer", color: "var(--primary)", fontSize: "0.875rem", textDecoration: "underline" }}
            >
              {mode === "login" ? t.switchToRegister : t.switchToLogin}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
