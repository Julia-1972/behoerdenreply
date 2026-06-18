import Link from "next/link";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export default async function Home() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (user) redirect("/dashboard");

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "var(--bg)" }}>

      {/* Nav */}
      <nav style={{ borderBottom: "1.5px solid var(--border)", padding: "0 2rem", height: "64px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, background: "var(--bg)", zIndex: 100 }}>
        <span style={{ fontWeight: 700, fontSize: "1.2rem", color: "var(--fg)" }}>
          Behörden<span style={{ color: "var(--primary)" }}>Reply</span>
        </span>
        <div style={{ display: "flex", gap: "0.75rem" }}>
          <Link href="/login" className="btn-outline" style={{ padding: "0.45rem 1.1rem", fontSize: "0.9rem" }}>Anmelden</Link>
          <Link href="/login" className="btn-primary" style={{ padding: "0.45rem 1.1rem", fontSize: "0.9rem" }}>Kostenlos starten</Link>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ maxWidth: "760px", margin: "0 auto", padding: "5rem 2rem 3rem", textAlign: "center" }}>
        <div style={{ display: "inline-block", background: "#eff6ff", color: "var(--primary)", borderRadius: "100px", padding: "0.3rem 1rem", fontSize: "0.85rem", fontWeight: 600, marginBottom: "1.5rem" }}>
          1 Dokument kostenlos · Kein Vorwissen nötig
        </div>
        <h1 style={{ fontSize: "clamp(2rem, 5vw, 3rem)", fontWeight: 800, lineHeight: 1.15, color: "var(--fg)", marginBottom: "1.25rem" }}>
          Du bekommst einen Behördenbrief — und weißt nicht, wie du antworten sollst?
        </h1>
        <p style={{ fontSize: "1.125rem", color: "var(--fg-muted)", lineHeight: 1.7, marginBottom: "2rem", maxWidth: "580px", margin: "0 auto 2rem" }}>
          Lade dein offizielles Schreiben hoch. Die KI analysiert den Inhalt, stellt gezielte Rückfragen und erstellt eine fertige Antwort auf Deutsch.
        </p>
        <Link href="/login" className="btn-primary" style={{ fontSize: "1.05rem", padding: "0.75rem 2rem" }}>
          Jetzt kostenlos starten
        </Link>
      </section>

      {/* How it works */}
      <section style={{ background: "var(--bg-subtle)", padding: "4rem 2rem", marginTop: "3rem" }}>
        <div style={{ maxWidth: "900px", margin: "0 auto" }}>
          <h2 style={{ textAlign: "center", fontSize: "1.6rem", fontWeight: 700, marginBottom: "0.5rem" }}>So funktioniert es</h2>
          <p style={{ textAlign: "center", color: "var(--fg-muted)", marginBottom: "3rem" }}>In drei Schritten zur fertigen Antwort</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1.5rem" }}>
            {[
              { n: "1", title: "Dokument hochladen", text: "PDF hochladen — die KI erkennt den Inhalt automatisch, auch bei eingescannten Briefen." },
              { n: "2", title: "Fragen beantworten", text: "Kurze, gezielte Rückfragen Schritt für Schritt beantworten." },
              { n: "3", title: "Antwort erhalten", text: "Fertige, formelle Antwort auf Deutsch — als PDF und DOCX sofort herunterladbar." },
            ].map((s) => (
              <div key={s.n} className="card" style={{ textAlign: "center" }}>
                <div style={{ width: "2.5rem", height: "2.5rem", background: "var(--primary)", color: "#fff", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: "1.1rem", margin: "0 auto 1rem" }}>{s.n}</div>
                <h3 style={{ fontWeight: 700, marginBottom: "0.5rem" }}>{s.title}</h3>
                <p style={{ color: "var(--fg-muted)", fontSize: "0.9rem", lineHeight: 1.6 }}>{s.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section style={{ padding: "4rem 2rem" }}>
        <div style={{ maxWidth: "900px", margin: "0 auto" }}>
          <h2 style={{ textAlign: "center", fontSize: "1.6rem", fontWeight: 700, marginBottom: "0.5rem" }}>Preise</h2>
          <p style={{ textAlign: "center", color: "var(--fg-muted)", marginBottom: "3rem" }}>Transparent und ohne Überraschungen</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1.5rem", alignItems: "start" }}>
            {[
              { label: "Kostenlos", price: "0 €", desc: "1 Dokument kostenlos nach Registrierung", features: ["Vollständige Analyse", "Fertige Antwort auf Deutsch", "Registrierung erforderlich"], highlight: false },
              { label: "Pay-per-Use", price: "3,99 €", desc: "Pro Dokument, einmalig", features: ["Analyse & Rückfragen", "Fertige Antwort auf Deutsch", "PDF- und DOCX-Download"], highlight: true },
              { label: "Abo", price: "9,99 €", desc: "Pro Monat, bis 30 Dokumente", features: ["Bis zu 30 Dokumente/Monat", "Fertige Antwort auf Deutsch", "PDF- und DOCX-Download"], highlight: false },
            ].map((p) => (
              <div key={p.label} className="card" style={{ border: p.highlight ? "2px solid var(--primary)" : undefined, position: "relative" }}>
                {p.highlight && <div style={{ position: "absolute", top: "-13px", left: "50%", transform: "translateX(-50%)", background: "var(--primary)", color: "#fff", borderRadius: "100px", padding: "0.2rem 0.9rem", fontSize: "0.75rem", fontWeight: 700, whiteSpace: "nowrap" }}>Beliebt</div>}
                <div style={{ fontWeight: 700, marginBottom: "0.25rem" }}>{p.label}</div>
                <div style={{ fontSize: "2rem", fontWeight: 800, marginBottom: "0.25rem" }}>{p.price}</div>
                <div style={{ color: "var(--fg-muted)", fontSize: "0.85rem", marginBottom: "1rem" }}>{p.desc}</div>
                <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  {p.features.map((f) => (
                    <li key={f} style={{ display: "flex", gap: "0.5rem", fontSize: "0.9rem", color: "var(--fg-muted)" }}>
                      <span style={{ color: "var(--primary)", fontWeight: 700 }}>✓</span> {f}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ background: "var(--fg)", padding: "4rem 2rem", textAlign: "center", marginTop: "1rem" }}>
        <h2 style={{ color: "#fff", fontSize: "1.8rem", fontWeight: 800, marginBottom: "1rem" }}>
          Jetzt Behördenbriefe sicher beantworten
        </h2>
        <p style={{ color: "#94a3b8", marginBottom: "2rem" }}>
          Lade dein Dokument hoch und erhalte in wenigen Minuten eine fertige Antwort auf Deutsch.
        </p>
        <Link href="/login" className="btn-primary" style={{ fontSize: "1.05rem", padding: "0.75rem 2rem" }}>
          Kostenlos starten
        </Link>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: "1.5px solid var(--border)", padding: "1.5rem 2rem", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.5rem" }}>
        <span style={{ fontWeight: 700, color: "var(--fg)" }}>Behörden<span style={{ color: "var(--primary)" }}>Reply</span></span>
        <div style={{ display: "flex", gap: "1.5rem", fontSize: "0.875rem", color: "var(--fg-muted)" }}>
          <Link href="/impressum" style={{ color: "var(--fg-muted)", textDecoration: "none" }}>Impressum</Link>
          <Link href="/datenschutz" style={{ color: "var(--fg-muted)", textDecoration: "none" }}>Datenschutz</Link>
          <Link href="/agb" style={{ color: "var(--fg-muted)", textDecoration: "none" }}>AGB</Link>
        </div>
        <span style={{ fontSize: "0.8rem", color: "var(--fg-muted)" }}>© 2026 BehördenReply</span>
      </footer>
    </div>
  );
}
