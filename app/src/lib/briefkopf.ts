export interface BriefkopfData {
  nutzerName: string;
  nutzerAdresse: string;
  behördeName: string;
  behördeAdresse: string;
  aktenzeichen: string;
}

/** Extract Briefkopf from raw PDF text without AI */
export function extractBriefkopfFromText(pdfText: string): BriefkopfData {
  const lines = pdfText.split(/\r?\n/).map(l => l.trim()).filter(Boolean);

  // Aktenzeichen patterns
  const azMatch = pdfText.match(/(?:Mein Zeichen|Ihr Zeichen|Kundennummer|Geschäftszeichen)[:\s]+([A-Z0-9\/\-\.]+)/i);
  const aktenzeichen = azMatch?.[1]?.trim() ?? "";

  // Behörde: first meaningful institution line (usually top of letter)
  const behördePatterns = [
    /Agentur für Arbeit\s+[\w\s\.]+/i,
    /Jobcenter\s+[\w\s\.]+/i,
    /Finanzamt\s+[\w\s\.]+/i,
    /Bundesagentur für Arbeit/i,
    /(?:Amt|Behörde|Ministerium|Verwaltung)\s+\w+/i,
  ];
  let behördeName = "";
  for (const pat of behördePatterns) {
    const m = pdfText.match(pat);
    if (m) { behördeName = m[0].trim(); break; }
  }

  // Behörde address: look for PLZ + city after behörde name
  const behördeAdresseMatch = pdfText.match(/(\d{5}\s+[\wäöüÄÖÜß\s]+?)(?:\n|Postanschrift|Internet|Bankverbindung)/);
  const behördeAdresse = behördeAdresseMatch?.[1]?.trim() ?? "";

  // Nutzer: find name+address block (name + Straße + PLZ)
  // Pattern: line with "Vorname Nachname" followed by "Straße Nr" and "PLZ Ort"
  let nutzerName = "";
  let nutzerAdresse = "";
  for (let i = 0; i < lines.length - 2; i++) {
    const line = lines[i];
    const next = lines[i + 1];
    const next2 = lines[i + 2];
    // Name line: 2-3 words, no digits, no special chars
    if (/^[A-ZÄÖÜ][a-zäöüß]+ [A-ZÄÖÜ][a-zäöüß]+/.test(line) &&
        /\d/.test(next) && // street has number
        /^\d{5}/.test(next2)) { // PLZ
      nutzerName = line;
      nutzerAdresse = `${next}, ${next2}`;
      break;
    }
  }

  return { nutzerName, nutzerAdresse, behördeName, behördeAdresse, aktenzeichen };
}

export function parseBriefkopf(analysisSummary: string): BriefkopfData | null {
  // Try JSON format: BRIEFKOPF_JSON:{...} (may be multiline)
  const jsonIdx = analysisSummary.indexOf("BRIEFKOPF_JSON:");
  if (jsonIdx !== -1) {
    const jsonStr = analysisSummary.slice(jsonIdx + "BRIEFKOPF_JSON:".length).trim();
    try {
      const parsed = JSON.parse(jsonStr);
      console.log("[briefkopf] JSON parsed:", JSON.stringify(parsed));
      return {
        nutzerName: parsed.nutzerName ?? "",
        nutzerAdresse: parsed.nutzerAdresse ?? "",
        behördeName: parsed.behördeName ?? parsed["behördeName"] ?? "",
        behördeAdresse: parsed.behördeAdresse ?? parsed["behördeAdresse"] ?? "",
        aktenzeichen: parsed.aktenzeichen ?? "",
      };
    } catch {
      // JSON might have trailing text — try to extract just the object
      const objEnd = jsonStr.lastIndexOf("}");
      if (objEnd !== -1) {
        try {
          const parsed = JSON.parse(jsonStr.slice(0, objEnd + 1));
          return {
            nutzerName: parsed.nutzerName ?? "",
            nutzerAdresse: parsed.nutzerAdresse ?? "",
            behördeName: parsed.behördeName ?? parsed["behördeName"] ?? "",
            behördeAdresse: parsed.behördeAdresse ?? parsed["behördeAdresse"] ?? "",
            aktenzeichen: parsed.aktenzeichen ?? "",
          };
        } catch { /* ignore */ }
      }
      console.log("[briefkopf] JSON parse failed, first 200:", jsonStr.slice(0, 200));
    }
  }

  // Fallback: old ---BRIEFKOPF--- block format
  const blockMatch = analysisSummary.match(/---\s*BRIEFKOPF\s*---([\s\S]*?)---\s*ENDE\s*---/i);
  if (blockMatch) {
    const block = blockMatch[1];
    const get = (key: string) =>
      (block.match(new RegExp(`${key}\\s*:\\s*(.+)`)) ?? [])[1]?.trim() ?? "";
    return {
      nutzerName: get("NUTZER_NAME"),
      nutzerAdresse: get("NUTZER_ADRESSE"),
      behördeName: get("BEHOERDE_NAME"),
      behördeAdresse: get("BEHOERDE_ADRESSE"),
      aktenzeichen: get("AKTENZEICHEN"),
    };
  }

  console.log("[briefkopf] no block found. Summary tail:", analysisSummary.slice(-400));
  return null;
}

export function buildDin5008Header(data: BriefkopfData, date: string): string {
  const ort = data.nutzerAdresse.split(",")[1]?.trim() ?? data.nutzerAdresse;
  const aktenzeichen =
    data.aktenzeichen && data.aktenzeichen.toLowerCase() !== "keines"
      ? `Ihr Zeichen: ${data.aktenzeichen}\n\n`
      : "";

  return [
    data.nutzerName,
    data.nutzerAdresse,
    "",
    data.behördeName,
    data.behördeAdresse,
    "",
    `${ort}, ${date}`,
    "",
    aktenzeichen,
  ].join("\n");
}

export function prependBriefkopf(
  letterBody: string,
  analysisSummary: string,
  date: string
): string {
  const data = parseBriefkopf(analysisSummary);
  if (!data || !data.nutzerName) return letterBody;

  // Strip any leading header-like lines the AI might have generated
  // Keep everything from "Betreff:" or "Sehr geehrte" onwards
  const bodyStart = letterBody.search(/Betreff:|Sehr geehrte/i);
  const body = bodyStart !== -1 ? letterBody.slice(bodyStart) : letterBody;

  // Replace any leftover placeholders with real name
  const cleanBody = body.replace(/\[Ihr Name\]|\[Name\]|\[Vor- und Nachname\]/gi, data.nutzerName);

  return buildDin5008Header(data, date) + cleanBody;
}
