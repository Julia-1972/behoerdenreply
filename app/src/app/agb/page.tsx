import Link from "next/link";

export default function AGBPage() {
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "var(--sand)" }}>
      <nav style={{ background: "linear-gradient(90deg, #1E1133 0%, #261245 55%, #1E1133 100%)", height: "64px", padding: "0 2.5rem", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 100, boxShadow: "0 8px 32px rgba(30,17,51,0.28)" }}>
        <Link href="/" style={{ fontWeight: 800, fontSize: "1.5rem", color: "#fff", textDecoration: "none" }}>
          Behörden<span style={{ color: "var(--gold)" }}>Reply</span>
        </Link>
        <Link href="/" className="btn-outline-white" style={{ fontSize: "0.85rem", padding: "0.35rem 0.9rem" }}>← Zurück</Link>
      </nav>
      <main style={{ flex: 1, maxWidth: "760px", margin: "0 auto", padding: "2.5rem 2rem" }}>
        <h1 style={{ fontFamily: "var(--font-serif)", fontSize: "2rem", color: "var(--violet)", marginBottom: "1.5rem" }}>Allgemeine Geschäftsbedingungen (AGB)</h1>
        <div style={{ color: "var(--fg)", fontSize: "0.95rem", lineHeight: 1.8 }}>
          <h2 style={{ fontSize: "1.1rem", fontWeight: 700, marginTop: "1.5rem" }}>1. Geltungsbereich</h2>
          <p>Diese Allgemeinen Geschäftsbedingungen gelten für die Nutzung des Online-Dienstes BehördenReply.</p>

          <h2 style={{ fontSize: "1.1rem", fontWeight: 700, marginTop: "1.5rem" }}>2. Leistungsbeschreibung</h2>
          <p>BehördenReply erstellt KI-gestützt Antwortentwürfe für die Behördenkommunikation.</p>

          <h2 style={{ fontSize: "1.1rem", fontWeight: 700, marginTop: "1.5rem" }}>3. Kein Ersatz für Rechtsberatung</h2>
          <p>BehördenReply stellt keine Rechtsberatung dar.</p>

          <h2 style={{ fontSize: "1.1rem", fontWeight: 700, marginTop: "1.5rem" }}>4. Benutzerkonto</h2>
          <p>Für die Nutzung ist ein Benutzerkonto erforderlich.</p>

          <h2 style={{ fontSize: "1.1rem", fontWeight: 700, marginTop: "1.5rem" }}>5. Preise</h2>
          <ul style={{ paddingLeft: "1.25rem" }}>
            <li>1 Dokument kostenlos</li>
            <li>3,99 € pro Dokument</li>
            <li>9,99 € pro Monat (bis zu 30 Dokumente)</li>
          </ul>
          <p>Im MVP werden Zahlungen lediglich simuliert.</p>

          <h2 style={{ fontSize: "1.1rem", fontWeight: 700, marginTop: "1.5rem" }}>6. Verfügbarkeit</h2>
          <p>Kein Anspruch auf permanente Verfügbarkeit.</p>

          <h2 style={{ fontSize: "1.1rem", fontWeight: 700, marginTop: "1.5rem" }}>7. Haftung</h2>
          <p>Die Nutzung erfolgt auf eigenes Risiko.</p>

          <h2 style={{ fontSize: "1.1rem", fontWeight: 700, marginTop: "1.5rem" }}>8. Urheberrechte</h2>
          <p>Vom Nutzer hochgeladene Inhalte bleiben Eigentum des jeweiligen Nutzers.</p>

          <h2 style={{ fontSize: "1.1rem", fontWeight: 700, marginTop: "1.5rem" }}>9. Änderungen</h2>
          <p>Der Anbieter behält sich Änderungen vor.</p>

          <h2 style={{ fontSize: "1.1rem", fontWeight: 700, marginTop: "1.5rem" }}>10. Schlussbestimmungen</h2>
          <p>Es gilt deutsches Recht.</p>
          <p style={{ marginTop: "1.5rem", color: "var(--fg-muted)", fontSize: "0.85rem" }}>Stand: Juni 2026</p>
        </div>
      </main>
    </div>
  );
}
