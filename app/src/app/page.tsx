import React from "react";
import Link from "next/link";

const NAV: React.CSSProperties = {
  background: "linear-gradient(90deg, #1E1133 0%, #261245 55%, #1E1133 100%)",
  height: "72px", padding: "0 2.5rem",
  display: "flex", alignItems: "center", justifyContent: "space-between",
  position: "sticky", top: 0, zIndex: 100,
  boxShadow: "0 8px 32px rgba(30,17,51,0.28)",
};

export default function Home() {
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "var(--sand)" }}>

      {/* NAV */}
      <nav style={NAV}>
        <span style={{ fontFamily: "var(--font-sans)", fontWeight: 800, fontSize: "1.3rem", color: "#fff" }}>
          Behörden<span style={{ color: "var(--gold)" }}>Reply</span>
        </span>
        <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
          <Link href="/login" className="btn-outline-white">Anmelden</Link>
          <Link href="/login" className="btn-gold">Kostenlos starten →</Link>
        </div>
      </nav>

      {/* HERO */}
      <section style={{ background: "linear-gradient(90deg, #FFF9F2 0%, #FAF6F0 42%, #F4E9DA 100%)", overflow: "hidden", display: "grid", gridTemplateColumns: "48fr 52fr", minHeight: "calc(100vh - 72px)" }}>
          <div style={{ padding: "40px 16px 40px 42px", display: "flex", alignItems: "center" }}><div style={{ width: "100%" }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "var(--lavender)", border: "1px solid var(--violet-pale)", borderRadius: "6px", padding: "5px 14px", marginBottom: "14px" }}>
              <div style={{ width: "7px", height: "7px", background: "var(--violet-mid)", borderRadius: "50%" }} />
              <span style={{ fontSize: "12px", fontWeight: 700, color: "var(--violet)", letterSpacing: "0.1em", textTransform: "uppercase" }}>KI-gestützte Behördenhilfe</span>
            </div>
            <h1 style={{ fontFamily: "var(--font-serif)", fontSize: "clamp(2.2rem, 4vw, 3rem)", color: "var(--violet)", lineHeight: 1.1, marginBottom: "1rem" }}>
              Du bekommst einen Behördenbrief — und weißt nicht, was tun?
            </h1>
            <p style={{ borderLeft: "3px solid var(--violet-pale)", paddingLeft: "16px", color: "#555", fontSize: "1rem", lineHeight: 1.6, marginBottom: "1.5rem" }}>
              Deutsche Bürokratie muss keine Quelle von Stress sein.<br />
              Lade dein Schreiben hoch — wir erledigen den Rest.
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px", marginBottom: "1.75rem" }}>
              {[["1","PDF hochladen"],["2","Fragen beantworten"],["3","Antwort erhalten"]].map(([n,text]) => (
                <div key={n} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 12px", background: "#F6F1FB", borderRadius: "10px", border: "1px solid rgba(123,94,167,0.15)", fontSize: "13px", color: "#333" }}>
                  <div style={{ width: "24px", height: "24px", minWidth: "24px", background: "var(--violet)", borderRadius: "4px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: 700, color: "#fff" }}>{n}</div>
                  {text}
                </div>
              ))}
            </div>
            <Link href="/login" className="btn-violet" style={{ fontSize: "1.05rem", marginBottom: "10px", display: "inline-flex" }}>
              Jetzt kostenlos starten →
            </Link>
            <p style={{ fontSize: "12px", color: "#999", marginBottom: "16px" }}>1 Dokument kostenlos · Keine Kreditkarte</p>
            <div style={{ display: "flex", gap: "1.25rem", flexWrap: "wrap" }}>
              {["Keine versteckten Kosten","DSGVO-konform","Sofortige Analyse"].map(t => (
                <span key={t} style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", color: "#555", fontWeight: 500 }}>
                  <span style={{ color: "var(--violet-mid)", fontWeight: 700 }}>✓</span> {t}
                </span>
              ))}
            </div>
          </div></div>

          {/* Right — photo */}
          <div style={{ position: "relative", overflow: "hidden", minHeight: "420px" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/hero.png"
              alt="Deutsche Behördenbriefe auf dem Schreibtisch"
              style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "90% 20%", display: "block", filter: "brightness(0.87) saturate(0.78)", position: "absolute", inset: 0 }}
            />
            {/* left fade overlay */}
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to right, #FAF6F0 0%, rgba(250,246,240,0.6) 22%, rgba(250,246,240,0.15) 38%, transparent 55%)", zIndex: 1, pointerEvents: "none" }} />
            {/* warm tint */}
            <div style={{ position: "absolute", inset: 0, background: "rgba(248,238,218,0.12)", zIndex: 1, pointerEvents: "none" }} />
          </div>
      </section>

      {/* HOW IT WORKS */}
      <section style={{ padding: "4rem 2.5rem", background: "var(--sand)" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          <div className="section-label">So funktioniert es</div>
          <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "1.9rem", color: "var(--violet)", marginBottom: "2rem" }}>In 3 Schritten zur fertigen Antwort</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "1.5rem" }}>
            {[
              {n:"1",title:"Dokument hochladen",text:"PDF hochladen — die KI erkennt den Inhalt automatisch, auch bei eingescannten Briefen."},
              {n:"2",title:"Fragen beantworten",text:"Kurze, gezielte Rückfragen Schritt für Schritt. Nur was wirklich fehlt."},
              {n:"3",title:"Antwort herunterladen",text:"Fertige, formelle Antwort auf Deutsch — als PDF und DOCX sofort herunterladbar."},
            ].map(s => (
              <div key={s.n} style={{ background: "#fff", borderRadius: "14px", padding: "1.75rem", border: "1px solid var(--border)", boxShadow: "0 2px 12px rgba(76,29,149,0.06)" }}>
                <div style={{ width: "2.5rem", height: "2.5rem", background: "linear-gradient(135deg,#4C1D95,#6B46C1)", color: "#fff", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: "1rem", marginBottom: "1rem", boxShadow: "0 4px 12px rgba(76,29,149,0.25)" }}>{s.n}</div>
                <div style={{ fontWeight: 700, marginBottom: "0.5rem", color: "var(--plum)" }}>{s.title}</div>
                <div style={{ color: "var(--fg-muted)", fontSize: "0.875rem", lineHeight: 1.65 }}>{s.text}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section style={{ padding: "4rem 2.5rem", background: "#fff" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          <div className="section-label">Preise</div>
          <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "1.9rem", color: "var(--violet)", marginBottom: "2rem" }}>Transparent. Ohne Überraschungen.</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "1.5rem", alignItems: "start" }}>
            {[
              {label:"Kostenlos",price:"0 €",desc:"1 Dokument nach Registrierung",features:["Vollständige KI-Analyse","Fertige Antwort auf Deutsch","Registrierung erforderlich"],hot:false},
              {label:"Pay-per-Use",price:"3,99 €",desc:"Pro Dokument, einmalig",features:["KI-Analyse & Rückfragen","Fertige Antwort auf Deutsch","PDF- und DOCX-Download"],hot:true},
              {label:"Abo",price:"9,99 €",desc:"Pro Monat · bis 30 Dokumente",features:["Bis zu 30 Dokumente/Monat","Fertige Antwort auf Deutsch","PDF- und DOCX-Download"],hot:false},
            ].map(p => (
              <div key={p.label} style={{ background: p.hot ? "linear-gradient(135deg,#4C1D95,#3D2578)" : "#fff", color: p.hot ? "#fff" : "var(--fg)", borderRadius: "16px", padding: "2rem", border: p.hot ? "none" : "1px solid var(--border)", boxShadow: p.hot ? "0 12px 40px rgba(76,29,149,0.28)" : "0 2px 12px rgba(0,0,0,0.05)", position: "relative" }}>
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

      {/* CTA */}
      <section style={{ background: "linear-gradient(135deg,#1E1133 0%,#261245 100%)", padding: "5rem 2.5rem", textAlign: "center" }}>
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
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ background: "#150D30", padding: "1.75rem 2.5rem", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
        <span style={{ fontWeight: 800, color: "#fff", fontSize: "1.1rem" }}>Behörden<span style={{ color: "var(--gold)" }}>Reply</span></span>
        <div style={{ display: "flex", gap: "1.5rem" }}>
          {["Impressum","Datenschutz","AGB"].map(l => (
            <Link key={l} href="/" style={{ color: "rgba(255,255,255,0.45)", textDecoration: "none", fontSize: "0.85rem" }}>{l}</Link>
          ))}
        </div>
        <span style={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.3)" }}>© 2026 BehördenReply</span>
      </footer>
    </div>
  );
}
