@AGENTS.md

# BehördenReply - Projektregeln für Claude Code

## Projekt

BehördenReply - Micro-SaaS für russischsprachige Menschen in Deutschland. Hilft bei Behördenbriefen: PDF hochladen, KI analysiert, stellt Rückfragen, generiert ein Antwortschreiben. Diplomarbeit von Julia.

## Steck

- Next.js 16 + React 19 + Tailwind CSS 4
- Supabase (Auth + PostgreSQL)
- OpenAI Assistants API (GPT-4o) für Briefanalyse und Antwortgenerierung
- pdf-parse + OpenAI Files API (OCR-Fallback)
- Vercel (Deployment)

## Architektur (QA-Flow)

```
PDF -> extractPdfText -> (< 50 Zeichen? -> OCR via OpenAI Files API)
    -> extractBriefkopfFromText (regex)
    -> preAnalyzeLetter (Chat Completions, strukturelle Voranalyse)
    -> createAssistant + createThreadWithPdf
    -> runAndGetResponse (max 3 Fragen, dann Schreiben)
    -> extractFinalLetter (Marker: ===FINALES_SCHREIBEN_START/ENDE===)
```

## Schlüsseldateien

- `src/lib/assistant.ts` - KI-Logik: Assistent, Thread, PreAnalyse, Run, Extraktion
- `src/lib/pdf.ts` - PDF-Text + OCR-Fallback
- `src/lib/briefkopf.ts` - Briefkopf-Erkennung (Regex)
- `src/app/api/cases/[id]/analyze/route.ts` - Erstanalyse-Endpunkt
- `src/app/api/cases/[id]/answer/route.ts` - Nutzerantwort-Endpunkt
- `src/app/page.tsx` - Landing Page
- `src/app/login/page.tsx` - Login
- `src/app/globals.css` - Globale Styles + Design-Tokens

## Design-System (Referenz: OtvetGOtov.de)

- Navbar: dunkel violett-blau (#2D1B69 / #1a1040)
- Hintergrund: creme-beige (#FAF7F2 / #F5F0E8)
- Akzent/Überschriften: violett (#6B3FA0 / #5B2D8E)
- CTA-Buttons: gold-amber (#C9862A / #D4922E)
- Text: dunkelblau (#1a1040)
- Fotos OHNE border-radius
- Section-Labels: einheitlicher .section-label Klasse aus globals.css
- Section-Padding: padding-top 24px, label margin-bottom 10px

## Regeln

### Code
- Vor Code schreiben: Plan zeigen, Bestätigung abwarten
- Kleine, gezielte Änderungen - keine großflächigen Refactorings ohne Absprache
- Keine neuen Abhängigkeiten ohne Absprache
- `dynamic = "force-dynamic"` in layout.tsx Dateien beibehalten
- Proxy-Middleware ist deaktiviert (proxy.ts gibt NextResponse.next() zurück) - nicht anfassen

### Deployment
- Env-Variablen NUR über Bash `printf '%s' 'value' | npx vercel env add` setzen
- NIEMALS PowerShell zum Pipen von Env-Werten verwenden (BOM-Problem)
- 4 Env-Vars: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY, OPENAI_API_KEY

### Supabase
- SQL-Queries nicht über MCP ausführen - Query an Julia geben, sie führt es selbst aus

### Kommunikation
- Sprache mit Julia: Russisch
- Nicht erklären was du tust - einfach machen und Ergebnis melden
- Kurz und präzise - keine langen Einleitungen oder Zusammenfassungen
- Wenn unsicher: fragen, nicht raten
- Wenn aktuelle Daten nötig: direkt sagen

### Design
- Bei hässlichem Layout: 2-3 Varianten mit visuellem Vergleich vorschlagen
- Texte: kurzer Bindestrich "-", NICHT langer Gedankenstrich "—"
- Alle Änderungen am Design gegen OtvetGOtov.de-Referenz prüfen

### Modellhinweise
- Wenn eine Aufgabe eine andere Claude-Modellstufe braucht: vorwarnen
- Sonnet für Routine, Opus für komplexe Architekturentscheidungen

## Bekannte Einschränkungen

- § in erster KI-Nachricht erscheint nicht konsistent (GPT-4o umformuliert statt zitiert)
- OCR über Files API noch nicht vollständig getestet

## Offener Roadmap

- Required-Fields-Architektur
- Interessenanalyse-Schritt
- Antworten bearbeiten
- Mehrere aktive Cases
- End-to-End-Test des QA-Flows
