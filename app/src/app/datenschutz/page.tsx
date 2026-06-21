import Link from "next/link";

export default function DatenschutzPage() {
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "var(--sand)" }}>
      <nav style={{ background: "linear-gradient(90deg, #1E1133 0%, #261245 55%, #1E1133 100%)", height: "64px", padding: "0 2.5rem", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 100, boxShadow: "0 8px 32px rgba(30,17,51,0.28)" }}>
        <Link href="/" style={{ fontWeight: 800, fontSize: "1.5rem", color: "#fff", textDecoration: "none" }}>
          Behörden<span style={{ color: "var(--gold)" }}>Reply</span>
        </Link>
        <Link href="/" className="btn-outline-white" style={{ fontSize: "0.85rem", padding: "0.35rem 0.9rem" }}>← Zurück</Link>
      </nav>
      <main style={{ flex: 1, maxWidth: "760px", margin: "0 auto", padding: "2.5rem 2rem" }}>
        <h1 style={{ fontFamily: "var(--font-serif)", fontSize: "2rem", color: "var(--violet)", marginBottom: "1.5rem" }}>Datenschutzerklärung</h1>
        <div style={{ color: "var(--fg)", fontSize: "0.95rem", lineHeight: 1.8 }}>
          <h2 style={{ fontSize: "1.1rem", fontWeight: 700, marginTop: "1.5rem" }}>1. Verantwortliche Person</h2>
          <p>Julija Sekste<br />Musterstr. 8F<br />63526 Erlensee<br />Deutschland</p>
          <p>E-Mail: julia_sexte@hotmail.com</p>

          <h2 style={{ fontSize: "1.1rem", fontWeight: 700, marginTop: "1.5rem" }}>2. Zweck des Dienstes</h2>
          <p>BehördenReply ist ein KI-gestützter Online-Dienst zur Unterstützung bei der Erstellung von Antwortentwürfen für die Kommunikation mit Behörden in Deutschland.</p>

          <h2 style={{ fontSize: "1.1rem", fontWeight: 700, marginTop: "1.5rem" }}>3. Verarbeitete Daten</h2>
          <ul style={{ paddingLeft: "1.25rem" }}>
            <li>E-Mail-Adresse</li>
            <li>Passwort (über Supabase Auth)</li>
            <li>Hochgeladene PDF-Dokumente</li>
            <li>Antworten auf Rückfragen</li>
            <li>Erzeugte Antwortentwürfe</li>
            <li>Technische Protokolldaten (Logfiles)</li>
          </ul>

          <h2 style={{ fontSize: "1.1rem", fontWeight: 700, marginTop: "1.5rem" }}>4. Registrierung und Benutzerkonto</h2>
          <p>Für die Nutzung des Dienstes ist eine Registrierung erforderlich. Die Authentifizierung erfolgt über Supabase Auth.</p>

          <h2 style={{ fontSize: "1.1rem", fontWeight: 700, marginTop: "1.5rem" }}>5. KI-Verarbeitung</h2>
          <p>Verwendetes Modell: OpenAI GPT-4o</p>

          <h2 style={{ fontSize: "1.1rem", fontWeight: 700, marginTop: "1.5rem" }}>6. Hosting und Datenverarbeitung</h2>
          <ul style={{ paddingLeft: "1.25rem" }}>
            <li>Vercel</li>
            <li>Supabase</li>
            <li>Region: Frankfurt (EU Central)</li>
          </ul>

          <h2 style={{ fontSize: "1.1rem", fontWeight: 700, marginTop: "1.5rem" }}>7. Rechtsgrundlage</h2>
          <p>Art. 6 Abs. 1 lit. b DSGVO und Art. 6 Abs. 1 lit. f DSGVO.</p>

          <h2 style={{ fontSize: "1.1rem", fontWeight: 700, marginTop: "1.5rem" }}>8. Speicherdauer</h2>
          <p>Benutzerdaten und Dokumente werden gespeichert, solange das Benutzerkonto besteht oder gesetzliche Aufbewahrungspflichten entgegenstehen.</p>

          <h2 style={{ fontSize: "1.1rem", fontWeight: 700, marginTop: "1.5rem" }}>9. Betroffenenrechte</h2>
          <ul style={{ paddingLeft: "1.25rem" }}>
            <li>Auskunft</li>
            <li>Berichtigung</li>
            <li>Löschung</li>
            <li>Einschränkung der Verarbeitung</li>
            <li>Datenübertragbarkeit</li>
            <li>Widerspruch</li>
          </ul>

          <h2 style={{ fontSize: "1.1rem", fontWeight: 700, marginTop: "1.5rem" }}>10. Hinweis zum Projektstatus</h2>
          <p>Vor einem produktiven Marktstart ist eine rechtliche Prüfung durch einen Datenschutzexperten vorgesehen.</p>
        </div>
      </main>
    </div>
  );
}
