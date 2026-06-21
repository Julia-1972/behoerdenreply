import Link from "next/link";

export default function ImpressumPage() {
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "var(--sand)" }}>
      <nav style={{ background: "linear-gradient(90deg, #1E1133 0%, #261245 55%, #1E1133 100%)", height: "64px", padding: "0 2.5rem", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 100, boxShadow: "0 8px 32px rgba(30,17,51,0.28)" }}>
        <Link href="/" style={{ fontWeight: 800, fontSize: "1.5rem", color: "#fff", textDecoration: "none" }}>
          Behörden<span style={{ color: "var(--gold)" }}>Reply</span>
        </Link>
        <Link href="/" className="btn-outline-white" style={{ fontSize: "0.85rem", padding: "0.35rem 0.9rem" }}>← Zurück</Link>
      </nav>
      <main style={{ flex: 1, maxWidth: "760px", margin: "0 auto", padding: "2.5rem 2rem" }}>
        <h1 style={{ fontFamily: "var(--font-serif)", fontSize: "2rem", color: "var(--violet)", marginBottom: "1.5rem" }}>Impressum</h1>
        <div style={{ color: "var(--fg)", fontSize: "0.95rem", lineHeight: 1.8 }}>
          <p><strong>Angaben gemäß § 5 TMG</strong></p>
          <p>Julija Sekste<br />Musterstr. 8F<br />63526 Erlensee<br />Deutschland</p>
          <p>E-Mail: julia_sexte@hotmail.com</p>
          <p><strong>Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV:</strong></p>
          <p>Julija Sekste<br />Musterstr. 8F<br />63526 Erlensee<br />Deutschland</p>
          <p><strong>Hinweis:</strong></p>
          <p>BehördenReply ist ein KI-gestützter Online-Dienst zur Unterstützung bei der Erstellung von Antwortentwürfen für die Behördenkommunikation.</p>
          <p>Es erfolgt keine Rechtsberatung im Sinne des Rechtsdienstleistungsgesetzes (RDG). Die bereitgestellten Inhalte dienen ausschließlich der Unterstützung bei der Formulierung von Antwortentwürfen und ersetzen keine individuelle rechtliche Beratung.</p>
        </div>
      </main>
    </div>
  );
}
