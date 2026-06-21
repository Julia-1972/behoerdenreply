# BehördenReply - Pitch Deck

---

## Folie 1: Titel

**BehördenReply**
Antwortgenerator für Behördenkommunikation

Julija Sekste
Abschlussprojekt KI-Manager - Juni 2026

---

## Folie 2: Elevator Pitch

Für russischsprachige Erwachsene in Deutschland, die behördliche Schreiben verstehen, aber nicht wissen, wie sie korrekt darauf antworten sollen, ist BehördenReply ein KI-gestützter Antwortgenerator, der eine fertige, fristgerechte Antwort auf Deutsch erstellt. Anders als ChatGPT führt BehördenReply den Nutzer durch einen strukturierten Prozess mit gezielten Rückfragen und liefert ein sofort versandfertiges Schreiben.

---

## Folie 3: Das Problem

- 3 Mio. russischsprachige Erwachsene in Deutschland
- Behördenbriefe werden verstanden - aber die korrekte Antwort ist das Problem
- Fristen, Paragraphen, Formulierungen - Unsicherheit führt zu Fehlern oder Untätigkeit
- Bestehende Alternativen: Google Translate (keine Antwort), Anwalt (teuer), ChatGPT (kein Workflow)

**Key Insight: Problem = Antwort, nicht Sprache**

---

## Folie 4: Persona

**Eugen, 59 Jahre**
- Lebt seit 20+ Jahren in Deutschland
- Versteht Behördenbriefe grundsätzlich
- Weiß nicht, wie er korrekt antworten soll
- Sucht eine schnelle, günstige Lösung

---

## Folie 5: Live-Demo

**https://app-tau-liard.vercel.app**

1. Brief hochladen (PDF)
2. KI analysiert den Inhalt und stellt eine gezielte Rückfrage
3. Nutzer antwortet
4. Fertiges Antwortschreiben mit Briefkopf - als PDF und DOCX

---

## Folie 6: Geschäftsmodell

| Tarif | Preis | Inhalt |
|---|---|---|
| Kostenlos | 0 € | 1 Dokument zum Kennenlernen |
| Einzelabruf | 3,99 € | Pro Dokument |
| Monatsabo | 9,99 € | Bis zu 30 Dokumente |

---

## Folie 7: Wirtschaftlichkeit

**KI-Kosten pro Dokument: ca. 0,01 €**

| Szenario | Nutzer | Umsatz/Monat | KI-Kosten | Gewinn |
|---|---|---|---|---|
| Klein | 100 | 25,95 € | 1,05 € | 4,90 € |
| Mittel | 1.000 | 259,50 € | 10,50 € | 229,00 € |
| Groß | 10.000 | 2.595 € | 105 € | 2.470 € |

- Conversion-Rate: 5 % (80 % Pay-per-Use, 20 % Abo)
- Profitabel ab ca. 3 zahlenden Abo-Nutzern
- Kosten eines Free-Nutzers: 0,01 €

---

## Folie 8: Marketing

**Primärer Kanal: Facebook Ads**

Begründung:
- Russischsprachige Communities bereits aktiv auf Facebook
- Persona Eugen (59) ist dort erreichbar
- Ergänzend: Telegram-Communities, Empfehlungen

**5 Anzeigenvarianten erstellt** (Schmerz, Szenario, Neugier, Preis, Sozialer Beweis)

---

## Folie 9: Recht & Compliance

- Impressum, Datenschutzerklärung, AGB: produktspezifisch erstellt und im Footer verlinkt
- DSGVO: Personenbezogene Daten werden verarbeitet (E-Mail, Dokumente)
- Hosting: Supabase Frankfurt (EU Central) + Vercel
- KI-Anbieter: OpenAI GPT-4o - AVV vor Marktstart erforderlich
- EU AI Act: Limited Risk - keine automatisierten Entscheidungen
- Rechtstexte KI-generiert, anwaltliche Prüfung vor Go-live eingeplant

---

## Folie 10: Tech-Stack

- **Frontend:** Next.js 16 (TypeScript, App Router)
- **Backend:** Supabase (Auth, PostgreSQL, Storage)
- **KI:** OpenAI GPT-4o (Assistants API)
- **Deploy:** Vercel
- **Entwicklung:** Claude Code

---

## Folie 11: Ausblick

- Interessenanalyse vor der Antwort (was will der Nutzer erreichen?)
- Editierbare Antworten
- Mehrere aktive Fälle gleichzeitig
- Erweiterung auf weitere Zielgruppen (nicht nur russischsprachig)
- Echte Zahlungsintegration (Stripe)

---

## Folie 12: Zusammenfassung

**BehördenReply** - Aus einem Behördenbrief wird in Minuten eine fertige Antwort.

- Echtes Problem echter Menschen
- Funktionierendes MVP mit Login, KI-Kern und Free/Paid-Logik
- Wirtschaftlich tragfähig ab 3 zahlenden Nutzern
- Klare Zielgruppe, erreichbar über Facebook

**https://app-tau-liard.vercel.app**
