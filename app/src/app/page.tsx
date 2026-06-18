import React from "react";
import Link from "next/link";

const NAV: React.CSSProperties = {
  background: "linear-gradient(90deg, #1E1133 0%, #261245 55%, #1E1133 100%)",
  height: "72px", padding: "0 2.5rem",
  display: "flex", alignItems: "center", justifyContent: "space-between",
  position: "sticky", top: 0, zIndex: 100,
  boxShadow: "0 8px 32px rgba(30,17,51,0.28)",
};

function NavLogo() {
  return (
    <span style={{ fontFamily: "var(--font-sans)", fontWeight: 800, fontSize: "1.3rem", color: "#fff", letterSpacing: "-0.01em" }}>
      Behörden<span style={{ color: "var(--gold)" }}>Reply</span>
    </span>
  );
}

export default function Home() {
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "var(--sand)" }}>

      {/* ── NAV ── */}
      <nav style={NAV}>
        <NavLogo />
        <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
          <Link href="/login" className="btn-outline-white">Anmelden</Link>
          <Link href="/login" className="btn-gold">Kostenlos starten →</Link>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section style={{ background: "linear-gradient(90deg, #FFF9F2 0%, #FAF6F0 42%, #F4E9DA 100%)", padding: "4rem 2.5rem 3.5rem" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "3rem", alignItems: "center" }}>

          {/* Left */}
          <div>
            {/* Badge */}
            <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "var(--lavender)", border: "1px solid var(--violet-pale)", borderRadius: "6px", padding: "5px 14px", marginBottom: "14px" }}>
              <div style={{ width: "7px", height: "7px", background: "var(--violet-mid)", borderRadius: "50%" }} />
              <span style={{ fontSize: "12px", fontWeight: 700, color: "var(--violet)", letterSpacing: "0.1em", textTransform: "uppercase" }}>KI-gestützte Behördenhilfe</span>
            </div>

            {/* Headline */}
            <h1 style={{ fontFamily: "var(--font-serif)", fontSize: "clamp(2.4rem, 4vw, 3.2rem)", color: "var(--violet)", lineHeight: 1.05, marginBottom: "1rem", letterSpacing: "-0.5px" }}>
              Du bekommst einen Behördenbrief — und weißt nicht, was tun?
            </h1>

            {/* Subheading with left border */}
            <p style={{ borderLeft: "3px solid var(--violet-pale)", paddingLeft: "16px", color: "#555", fontSize: "1rem", lineHeight: 1.6, marginBottom: "1.5rem" }}>
              Deutsche Bürokratie muss keine Quelle von Stress sein.<br />
              Lade dein Schreiben hoch — wir erledigen den Rest.
            </p>

            {/* Steps */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px", marginBottom: "1.75rem" }}>
              {[
                { n: "1", text: "PDF hochladen" },
                { n: "2", text: "Fragen beantworten" },
                { n: "3", text: "Fertige Antwort erhalten" },
              ].map(s => (
                <div key={s.n} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 12px", background: "#F6F1FB", borderRadius: "10px", border: "1px solid rgba(123,94,167,0.15)", boxShadow: "0 2px 8px rgba(61,37,120,0.05)", fontSize: "13px", color: "#333", lineHeight: 1.3 }}>
                  <div style={{ width: "24px", height: "24px", minWidth: "24px", background: "var(--violet)", borderRadius: "4px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: 700, color: "#fff" }}>{s.n}</div>
                  {s.text}
                </div>
              ))}
            </div>

            {/* CTA */}
            <Link href="/login" className="btn-violet" style={{ fontSize: "1.05rem", marginBottom: "10px", display: "inline-flex" }}>
              Jetzt kostenlos starten →
            </Link>
            <p style={{ fontSize: "12px", color: "#999", marginBottom: "16px" }}>1 Dokument kostenlos · Keine Kreditkarte</p>

            {/* Trust */}
            <div style={{ display: "flex", gap: "1.25rem", flexWrap: "wrap" }}>
              {["Keine versteckten Kosten", "DSGVO-konform", "Sofortige Analyse"].map(t => (
                <span key={t} style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", color: "#555", fontWeight: 500 }}>
                  <span style={{ color: "var(--violet-mid)", fontWeight: 700 }}>✓</span> {t}
                </span>
              ))}
            </div>
          </div>

          {/* Right — analysis card */}
          <div style={{ background: "var(--bg-white)", borderRadius: "18px", padding: "1.75rem", boxShadow: "0 8px 40px rgba(76,29,149,0.12)", border: "1px solid var(--border)" }}>
            <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--fg-muted)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "0.875rem" }}>Analyse des Schreibens</div>
            {["Organisation", "Frist der Antwort", "Risiken", "Anforderungen", "Gesetze"].map(item => (
              <div key={item} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "0.5rem 0", borderBottom: "1px solid var(--border)" }}>
                <div style={{ width: "20px", height: "20px", background: "#dcfce7", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", color: "#16a34a", fontWeight: 700, flexShrink: 0 }}>✓</div>
                <span style={{ fontSize: "0.9rem", color: "var(--fg)" }}>{item}</span>
              </div>
            ))}
            <div style={{ marginTop: "1.25rem", background: "var(--lavender)", borderRadius: "10px", padding: "1rem" }}>
              <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--violet)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "0.5rem" }}>Ergebnis</div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.9rem", color: "var(--violet)", fontWeight: 600 }}>
                <span>📄</span> Fertige Antwort auf Deutsch
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── PAIN POINTS ── */}
      <section style={{ background: "var(--bg-white)", padding: "4rem 2.5rem" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          <div className="section-label">Kennen Sie das?</div>
          <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "1.9rem", color: "var(--violet)", marginBottom: "2rem" }}>Kommt Ihnen das bekannt vor?</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1.25rem" }}>
            {[
              { icon: "📋", title: "Brief liegt auf dem Tisch", text: "Was jetzt? Wie antwortet man richtig auf ein Behördenschreiben?" },
              { icon: "❓", title: "Was wollen die von mir?", text: "Amtsdeutsch ist schwer. Was sind die Fristen? Was passiert, wenn ich nicht antworte?" },
              { icon: "😰", title: "Angst, Fehler zu machen", text: "Ein falscher Satz kann die Situation verschlechtern. Jedes Wort zählt." },
              { icon: "🔍", title: "Freunde raten, Internet verwirrt", text: "Google Translate übersetzt Wörter, aber nicht Gesetze. Anwalt kostet €150–300/h." },
            ].map(p => (
              <div key={p.title} style={{ background: "var(--violet-frost)", borderRadius: "14px", padding: "1.4rem", border: "1px solid var(--lavender)" }}>
                <div style={{ fontSize: "1.6rem", marginBottom: "0.6rem" }}>{p.icon}</div>
                <div style={{ fontWeight: 700, marginBottom: "0.4rem", fontSize: "0.925rem", color: "var(--plum)" }}>{p.title}</div>
                <div style={{ color: "var(--fg-muted)", fontSize: "0.86rem", lineHeight: 1.6 }}>{p.text}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section style={{ padding: "4rem 2.5rem", background: "var(--sand)" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          <div className="section-label">So funktioniert es</div>
          <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "1.9rem", color: "var(--violet)", marginBottom: "2rem" }}>In 3 Schritten zur fertigen Antwort</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "1.5rem" }}>
            {[
              { n: "1", title: "Dokument hochladen", text: "PDF hochladen — die KI erkennt den Inhalt automatisch, auch bei eingescannten Briefen." },
              { n: "2", title: "Fragen beantworten", text: "Kurze, gezielte Rückfragen Schritt für Schritt. Nur was wirklich fehlt." },
              { n: "3", title: "Antwort herunterladen", text: "Fertige, formelle Antwort auf Deutsch — als PDF und DOCX sofort herunterladbar." },
            ].map(s => (
              <div key={s.n} style={{ background: "var(--bg-white)", borderRadius: "14px", padding: "1.75rem", border: "1px solid var(--border)", boxShadow: "0 2px 12px rgba(76,29,149,0.06)" }}>
                <div style={{ width: "2.5rem", height: "2.5rem", background: "linear-gradient(135deg, #4C1D95, #6B46C1)", color: "#fff", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: "1rem", marginBottom: "1rem", boxShadow: "0 4px 12px rgba(76,29,149,0.25)" }}>{s.n}</div>
                <div style={{ fontWeight: 700, marginBottom: "0.5rem", color: "var(--plum)" }}>{s.title}</div>
                <div style={{ color: "var(--fg-muted)", fontSize: "0.875rem", lineHeight: 1.65 }}>{s.text}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── EXAMPLES ── */}
      <section style={{ background: "var(--bg-white)", padding: "4rem 2.5rem" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          <div className="section-label">Echte Beispiele</div>
          <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "1.9rem", color: "var(--violet)", marginBottom: "1.5rem" }}>Womit wir bereits helfen</h2>
          <div style={{ display: "flex", gap: "0.6rem", flexWrap: "wrap", marginBottom: "2rem" }}>
            {["Ausländerbehörde", "Jobcenter", "Finanzamt", "Krankenversicherung", "Wohngeld", "Rentenversicherung"].map(t => (
              <span key={t} style={{ background: "var(--lavender)", border: "1px solid var(--violet-pale)", borderRadius: "100px", padding: "0.3rem 0.9rem", fontSize: "0.82rem", fontWeight: 500, color: "var(--violet)" }}>{t}</span>
            ))}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1.25rem" }}>
            {[
              { title: "Ausländerbehörde", sub: "Daueraufenthaltsrecht", text: "Anforderung von Dokumenten zur Überprüfung der Freizügigkeit nach FreizügG/EU." },
              { title: "Jobcenter", sub: "Leistungsbescheid", text: "Widerspruch gegen Kürzung oder Ablehnung von Sozialleistungen." },
              { title: "Finanzamt", sub: "Steuerbescheid", text: "Antwort auf Rückfragen oder Widerspruch gegen Steuerbescheide." },
              { title: "Familienkasse", sub: "Kindergeld", text: "Nachweis über Anspruch auf Kindergeld, Rückforderungen beantworten." },
            ].map(e => (
              <div key={e.title} style={{ background: "var(--sand)", borderRadius: "12px", padding: "1.25rem", border: "1px solid var(--border)" }}>
                <div style={{ fontWeight: 700, fontSize: "0.95rem", marginBottom: "0.2rem", color: "var(--plum)" }}>{e.title}</div>
                <div style={{ fontSize: "0.75rem", color: "var(--gold)", fontWeight: 700, marginBottom: "0.6rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>{e.sub}</div>
                <div style={{ fontSize: "0.85rem", color: "var(--fg-muted)", lineHeight: 1.55 }}>{e.text}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section style={{ padding: "4rem 2.5rem", background: "var(--sand)" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          <div className="section-label">Preise</div>
          <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "1.9rem", color: "var(--violet)", marginBottom: "2rem" }}>Transparent. Ohne Überraschungen.</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "1.5rem", alignItems: "start" }}>
            {[
              { label: "Kostenlos", price: "0 €", desc: "1 Dokument nach Registrierung", features: ["Vollständige KI-Analyse", "Fertige Antwort auf Deutsch", "Registrierung erforderlich"], hot: false },
              { label: "Pay-per-Use", price: "3,99 €", desc: "Pro Dokument, einmalig", features: ["KI-Analyse & Rückfragen", "Fertige Antwort auf Deutsch", "PDF- und DOCX-Download"], hot: true },
              { label: "Abo", price: "9,99 €", desc: "Pro Monat · bis 30 Dokumente", features: ["Bis zu 30 Dokumente/Monat", "Fertige Antwort auf Deutsch", "PDF- und DOCX-Download"], hot: false },
            ].map(p => (
              <div key={p.label} style={{
                background: p.hot ? "linear-gradient(135deg, #4C1D95, #3D2578)" : "var(--bg-white)",
                color: p.hot ? "#fff" : "var(--fg)",
                borderRadius: "16px", padding: "2rem",
                border: p.hot ? "none" : "1px solid var(--border)",
                boxShadow: p.hot ? "0 12px 40px rgba(76,29,149,0.28)" : "0 2px 12px rgba(0,0,0,0.05)",
                position: "relative",
              }}>
                {p.hot && <div style={{ position: "absolute", top: "-12px", left: "50%", transform: "translateX(-50%)", background: "var(--gold)", color: "#fff", borderRadius: "100px", padding: "0.2rem 1rem", fontSize: "0.75rem", fontWeight: 700, whiteSpace: "nowrap" }}>Beliebt</div>}
                <div style={{ fontWeight: 700, fontSize: "0.8rem", opacity: 0.65, marginBottom: "0.25rem", textTransform: "uppercase", letterSpacing: "0.08em" }}>{p.label}</div>
                <div style={{ fontSize: "2.2rem", fontWeight: 800, marginBottom: "0.2rem", fontFamily: "var(--font-serif)" }}>{p.price}</div>
                <div style={{ fontSize: "0.85rem", opacity: 0.6, marginBottom: "1.25rem" }}>{p.desc}</div>
                <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "0.55rem" }}>
                  {p.features.map(f => (
                    <li key={f} style={{ display: "flex", gap: "8px", fontSize: "0.875rem", opacity: 0.85 }}>
                      <span style={{ color: p.hot ? "var(--gold)" : "var(--violet-mid)", fontWeight: 700 }}>✓</span>{f}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section style={{ background: "linear-gradient(135deg, #1E1133 0%, #261245 100%)", padding: "5rem 2.5rem", textAlign: "center" }}>
        <div style={{ maxWidth: "620px", margin: "0 auto" }}>
          <h2 style={{ fontFamily: "var(--font-serif)", color: "#fff", fontSize: "2.1rem", lineHeight: 1.2, marginBottom: "1rem" }}>
            Deutsche Bürokratie ist schwierig.<br />Aber Sie sind nicht allein.
          </h2>
          <p style={{ color: "rgba(255,255,255,0.6)", marginBottom: "2rem", lineHeight: 1.7 }}>
            Laden Sie Ihr Dokument hoch — und in wenigen Minuten wissen Sie, was zu tun ist.
          </p>
          <Link href="/login" className="btn-gold" style={{ fontSize: "1.05rem", padding: "0.9rem 2.4rem" }}>
            ✉ Jetzt kostenlos starten
          </Link>
          <div style={{ display: "flex", justifyContent: "center", gap: "2rem", marginTop: "1.75rem", flexWrap: "wrap" }}>
            {["Keine versteckten Kosten", "DSGVO-konform", "1 Dokument kostenlos"].map(t => (
              <span key={t} style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.8rem", color: "rgba(255,255,255,0.5)" }}>
                <span style={{ color: "var(--gold)" }}>✓</span>{t}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ background: "#150D30", padding: "1.75rem 2.5rem", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
        <span style={{ fontWeight: 800, color: "#fff", fontSize: "1.1rem" }}>Behörden<span style={{ color: "var(--gold)" }}>Reply</span></span>
        <div style={{ display: "flex", gap: "1.5rem" }}>
          {["Impressum", "Datenschutz", "AGB"].map(l => (
            <Link key={l} href={`/${l.toLowerCase()}`} style={{ color: "rgba(255,255,255,0.45)", textDecoration: "none", fontSize: "0.85rem" }}>{l}</Link>
          ))}
        </div>
        <span style={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.3)" }}>© 2026 BehördenReply</span>
      </footer>
    </div>
  );
}
