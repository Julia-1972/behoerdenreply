import Link from "next/link";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export default async function Home() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (user) redirect("/dashboard");

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "var(--bg)" }}>

      {/* ── NAV ── */}
      <nav style={{
        background: "var(--bg-dark)",
        padding: "0 2.5rem",
        height: "68px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        position: "sticky",
        top: 0,
        zIndex: 100,
      }}>
        <span style={{ fontWeight: 800, fontSize: "1.25rem", color: "#fff", letterSpacing: "-0.01em" }}>
          Behörden<span style={{ color: "var(--gold)" }}>Reply</span>
        </span>
        <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
          <Link href="/login" className="btn-outline-white" style={{ padding: "0.45rem 1.1rem", fontSize: "0.875rem" }}>Anmelden</Link>
          <Link href="/login" className="btn-gold" style={{ padding: "0.45rem 1.2rem", fontSize: "0.875rem" }}>Kostenlos starten</Link>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section style={{ background: "var(--bg)", padding: "5rem 2.5rem 4rem", maxWidth: "1100px", margin: "0 auto", width: "100%", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4rem", alignItems: "center" }}>
        <div>
          <div className="section-label">KI-gestützte Behördenhilfe</div>
          <h1 style={{ fontSize: "clamp(2rem, 4vw, 2.8rem)", fontWeight: 800, lineHeight: 1.15, color: "var(--fg)", marginBottom: "1rem" }}>
            Du bekommst einen<br />Behördenbrief — und<br />weißt nicht, was tun?
          </h1>
          <p style={{ color: "var(--fg-muted)", fontSize: "1.05rem", lineHeight: 1.7, marginBottom: "0.75rem" }}>
            Deutsche Bürokratie muss keine Quelle von Stress und Angst sein.
          </p>
          <p style={{ color: "var(--fg)", fontSize: "1rem", lineHeight: 1.7, marginBottom: "2rem" }}>
            Lade dein Schreiben hoch — die KI analysiert den Inhalt, stellt gezielte Rückfragen und erstellt eine fertige Antwort auf Deutsch.
          </p>
          <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
            <Link href="/login" className="btn-gold" style={{ fontSize: "1rem", padding: "0.8rem 1.8rem" }}>
              ✉ Jetzt kostenlos starten
            </Link>
            <a href="#how-it-works" className="btn-outline" style={{ fontSize: "1rem", padding: "0.8rem 1.8rem" }}>
              ▷ Wie es funktioniert
            </a>
          </div>
          <div style={{ display: "flex", gap: "1.5rem", marginTop: "1.75rem", flexWrap: "wrap" }}>
            {["Keine versteckten Kosten", "DSGVO-konform", "1 Dokument kostenlos"].map(t => (
              <span key={t} style={{ display: "flex", alignItems: "center", gap: "0.35rem", fontSize: "0.82rem", color: "var(--fg-muted)" }}>
                <span style={{ color: "var(--gold)" }}>✓</span> {t}
              </span>
            ))}
          </div>
        </div>

        {/* Hero card */}
        <div style={{ background: "var(--bg-white)", borderRadius: "18px", padding: "2rem", boxShadow: "0 8px 40px rgba(30,18,69,0.12)", border: "1.5px solid var(--border)" }}>
          <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--fg-muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "1rem" }}>Analyse des Schreibens</div>
          {["Organisation", "Frist der Antwort", "Risiken", "Anforderungen", "Gesetze"].map(item => (
            <div key={item} style={{ display: "flex", alignItems: "center", gap: "0.6rem", padding: "0.5rem 0", borderBottom: "1px solid var(--border)" }}>
              <span style={{ color: "#16a34a", fontSize: "1rem" }}>✓</span>
              <span style={{ fontSize: "0.9rem", color: "var(--fg)" }}>{item}</span>
            </div>
          ))}
          <div style={{ marginTop: "1.25rem", background: "var(--bg)", borderRadius: "10px", padding: "1rem" }}>
            <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--fg-muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "0.5rem" }}>Ergebnis</div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.9rem", color: "var(--fg)", fontWeight: 600 }}>
              <span>📄</span> Fertige Antwort auf Deutsch
            </div>
          </div>
        </div>
      </section>

      {/* ── PAIN POINTS ── */}
      <section style={{ background: "var(--bg-white)", padding: "4rem 2.5rem" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          <div className="section-label">Kennen Sie das?</div>
          <h2 style={{ fontSize: "1.8rem", fontWeight: 800, marginBottom: "2.5rem" }}>Kommt Ihnen das bekannt vor?</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1.5rem" }}>
            {[
              { icon: "📋", title: "Brief liegt auf dem Tisch", text: "Was jetzt? Wie antwortet man richtig auf ein Behördenschreiben?" },
              { icon: "❓", title: "Was wollen die von mir?", text: "Deutsches Amtsdeutsch ist schwer. Was sind die Fristen? Was passiert, wenn ich nicht antworte?" },
              { icon: "😰", title: "Angst, etwas Falsches zu schreiben", text: "Ein falscher Satz kann die Situation verschlechtern. Jedes Wort zählt." },
              { icon: "🔍", title: "Freunde raten, Internet verwirrt", text: "Allgemeine Ratschläge helfen nicht. Google Translate übersetzt Wörter, nicht Gesetze." },
            ].map(p => (
              <div key={p.title} style={{ background: "var(--bg)", borderRadius: "14px", padding: "1.5rem", border: "1.5px solid var(--border)" }}>
                <div style={{ fontSize: "1.8rem", marginBottom: "0.75rem" }}>{p.icon}</div>
                <div style={{ fontWeight: 700, marginBottom: "0.5rem", fontSize: "0.95rem" }}>{p.title}</div>
                <div style={{ color: "var(--fg-muted)", fontSize: "0.875rem", lineHeight: 1.6 }}>{p.text}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how-it-works" style={{ padding: "4rem 2.5rem" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          <div className="section-label">So funktioniert es</div>
          <h2 style={{ fontSize: "1.8rem", fontWeight: 800, marginBottom: "2.5rem" }}>In 3 Schritten zur fertigen Antwort</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "1.5rem" }}>
            {[
              { n: "1", title: "Dokument hochladen", text: "PDF hochladen — die KI erkennt den Inhalt automatisch, auch bei eingescannten Briefen." },
              { n: "2", title: "Fragen beantworten", text: "Kurze, gezielte Rückfragen Schritt für Schritt beantworten. Nur was wirklich fehlt." },
              { n: "3", title: "Antwort herunterladen", text: "Fertige, formelle Antwort auf Deutsch — als PDF und DOCX sofort herunterladbar." },
            ].map(s => (
              <div key={s.n} style={{ background: "var(--bg-white)", borderRadius: "14px", padding: "1.75rem", border: "1.5px solid var(--border)", position: "relative" }}>
                <div style={{ width: "2.5rem", height: "2.5rem", background: "var(--bg-dark)", color: "#fff", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: "1rem", marginBottom: "1rem" }}>{s.n}</div>
                <div style={{ fontWeight: 700, marginBottom: "0.5rem" }}>{s.title}</div>
                <div style={{ color: "var(--fg-muted)", fontSize: "0.875rem", lineHeight: 1.6 }}>{s.text}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── EXAMPLES ── */}
      <section style={{ background: "var(--bg-white)", padding: "4rem 2.5rem" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          <div className="section-label">Echte Beispiele</div>
          <h2 style={{ fontSize: "1.8rem", fontWeight: 800, marginBottom: "2.5rem" }}>Womit wir bereits helfen</h2>
          <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", marginBottom: "2rem" }}>
            {["Ausländerbehörde", "Jobcenter", "Finanzamt", "Krankenversicherung", "Wohngeld", "Rentenversicherung"].map(t => (
              <span key={t} style={{ background: "var(--bg)", border: "1.5px solid var(--border)", borderRadius: "100px", padding: "0.35rem 0.9rem", fontSize: "0.82rem", fontWeight: 500 }}>{t}</span>
            ))}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1.25rem" }}>
            {[
              { title: "Ausländerbehörde", sub: "Daueraufenthaltsrecht", text: "Anforderung von Dokumenten zur Überprüfung der Freizügigkeit." },
              { title: "Jobcenter", sub: "Leistungsbescheid", text: "Widerspruch gegen Kürzung oder Ablehnung von Sozialleistungen." },
              { title: "Finanzamt", sub: "Steuerbescheid", text: "Antwort auf Rückfragen oder Widerspruch gegen Bescheide." },
              { title: "Familienkasse", sub: "Kindergeld", text: "Nachweis über Anspruch auf Kindergeld, Rückforderungen beantworten." },
            ].map(e => (
              <div key={e.title} style={{ background: "var(--bg)", borderRadius: "12px", padding: "1.25rem", border: "1.5px solid var(--border)" }}>
                <div style={{ fontWeight: 700, fontSize: "0.95rem", marginBottom: "0.2rem" }}>{e.title}</div>
                <div style={{ fontSize: "0.78rem", color: "var(--gold)", fontWeight: 600, marginBottom: "0.6rem" }}>{e.sub}</div>
                <div style={{ fontSize: "0.85rem", color: "var(--fg-muted)", lineHeight: 1.5 }}>{e.text}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section style={{ padding: "4rem 2.5rem" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          <div className="section-label">Preise</div>
          <h2 style={{ fontSize: "1.8rem", fontWeight: 800, marginBottom: "2.5rem" }}>Transparent. Ohne Überraschungen.</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "1.5rem", alignItems: "start" }}>
            {[
              { label: "Kostenlos", price: "0 €", desc: "1 Dokument nach Registrierung", features: ["Vollständige KI-Analyse", "Fertige Antwort auf Deutsch", "Registrierung erforderlich"], highlight: false },
              { label: "Pay-per-Use", price: "3,99 €", desc: "Pro Dokument, einmalig", features: ["KI-Analyse & Rückfragen", "Fertige Antwort auf Deutsch", "PDF- und DOCX-Download"], highlight: true },
              { label: "Abo", price: "9,99 €", desc: "Pro Monat · bis 30 Dokumente", features: ["Bis zu 30 Dokumente/Monat", "Fertige Antwort auf Deutsch", "PDF- und DOCX-Download"], highlight: false },
            ].map(p => (
              <div key={p.label} style={{
                background: p.highlight ? "var(--bg-dark)" : "var(--bg-white)",
                color: p.highlight ? "#fff" : "var(--fg)",
                borderRadius: "16px",
                padding: "2rem",
                border: p.highlight ? "none" : "1.5px solid var(--border)",
                position: "relative",
              }}>
                {p.highlight && <div style={{ position: "absolute", top: "-12px", left: "50%", transform: "translateX(-50%)", background: "var(--gold)", color: "#fff", borderRadius: "100px", padding: "0.2rem 1rem", fontSize: "0.75rem", fontWeight: 700, whiteSpace: "nowrap" }}>Beliebt</div>}
                <div style={{ fontWeight: 700, fontSize: "0.85rem", opacity: 0.7, marginBottom: "0.25rem" }}>{p.label}</div>
                <div style={{ fontSize: "2.2rem", fontWeight: 800, marginBottom: "0.25rem" }}>{p.price}</div>
                <div style={{ fontSize: "0.85rem", opacity: 0.6, marginBottom: "1.25rem" }}>{p.desc}</div>
                <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "0.6rem" }}>
                  {p.features.map(f => (
                    <li key={f} style={{ display: "flex", gap: "0.5rem", fontSize: "0.9rem", opacity: 0.85 }}>
                      <span style={{ color: p.highlight ? "var(--gold)" : "var(--primary)", fontWeight: 700 }}>✓</span> {f}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA FINAL ── */}
      <section style={{ background: "var(--bg-dark)", padding: "5rem 2.5rem", textAlign: "center" }}>
        <div style={{ maxWidth: "640px", margin: "0 auto" }}>
          <h2 style={{ color: "#fff", fontSize: "2rem", fontWeight: 800, lineHeight: 1.2, marginBottom: "1rem" }}>
            Deutsche Bürokratie ist schwierig. Aber Sie sind nicht allein.
          </h2>
          <p style={{ color: "rgba(255,255,255,0.65)", marginBottom: "2rem", lineHeight: 1.7 }}>
            Laden Sie Ihr Dokument hoch — und in wenigen Minuten wissen Sie, was zu tun ist.
          </p>
          <Link href="/login" className="btn-gold" style={{ fontSize: "1.05rem", padding: "0.85rem 2.2rem" }}>
            ✉ Jetzt kostenlos starten
          </Link>
          <div style={{ display: "flex", justifyContent: "center", gap: "2rem", marginTop: "1.75rem", flexWrap: "wrap" }}>
            {["Keine versteckten Kosten", "DSGVO-konform", "1 Dokument kostenlos"].map(t => (
              <span key={t} style={{ display: "flex", alignItems: "center", gap: "0.35rem", fontSize: "0.82rem", color: "rgba(255,255,255,0.55)" }}>
                <span style={{ color: "var(--gold)" }}>✓</span> {t}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ background: "#150D35", padding: "2rem 2.5rem", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
        <span style={{ fontWeight: 800, color: "#fff" }}>Behörden<span style={{ color: "var(--gold)" }}>Reply</span></span>
        <div style={{ display: "flex", gap: "1.5rem", fontSize: "0.85rem" }}>
          {["Impressum", "Datenschutz", "AGB"].map(l => (
            <Link key={l} href={`/${l.toLowerCase()}`} style={{ color: "rgba(255,255,255,0.5)", textDecoration: "none" }}>{l}</Link>
          ))}
        </div>
        <span style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.4)" }}>© 2026 BehördenReply</span>
      </footer>
    </div>
  );
}
