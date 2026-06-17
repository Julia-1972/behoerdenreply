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

  // Aktenzeichen: find "Mein Zeichen" / "Kundennummer" then scan next lines for the code
  let aktenzeichen = "";
  const azIdx = pdfText.search(/(?:Mein Zeichen|Ihr Zeichen|Kundennummer|Geschäftszeichen)/i);
  if (azIdx !== -1) {
    const azContext = pdfText.slice(azIdx, azIdx + 300);
    const azLines = azContext.split(/\r?\n/).map(l => l.trim());
    for (const azLine of azLines) {
      const m = azLine.match(/^([A-Z0-9][A-Z0-9\/\-]{3,})$/);
      if (m) { aktenzeichen = m[1]; break; }
    }
  }

  // Behörde name: find institution name
  const behördePatterns = [
    /Agentur für Arbeit\s+[A-ZÄÖÜa-zäöüß\s\.]+/,
    /Jobcenter\s+[A-ZÄÖÜa-zäöüß\s\.]+/,
    /Finanzamt\s+[A-ZÄÖÜa-zäöüß\s\.]+/,
    /Bundesagentur für Arbeit/,
  ];
  let behördeName = "";
  for (const pat of behördePatterns) {
    const m = pdfText.match(pat);
    if (m) { behördeName = m[0].split(/\n/)[0].replace(/\s+/g, " ").trim(); break; }
  }

  // Behörde address: "Behörde..., PLZ Stadt" or line after behörde name
  const behördeAdresseMatch = pdfText.match(/Agentur für Arbeit[^\n,]+,\s*(\d{5}\s+\w+)/i);
  const behördeAdresse = behördeAdresseMatch?.[1]?.trim() ?? "";

  // Nutzer name + address: name line followed (within 6 lines) by street + PLZ
  let nutzerName = "";
  let nutzerAdresse = "";
  for (let i = 0; i < lines.length - 5; i++) {
    const line = lines[i];
    // Name: 2 words, both starting uppercase, no digits
    if (!/^[A-ZÄÖÜ][a-zäöüß]+ [A-ZÄÖÜ][a-zäöüß]+$/.test(line)) continue;

    // Look for street within next 3 lines, PLZ within next 6 lines
    let street = "";
    let plzLine = "";
    for (let j = i + 1; j <= Math.min(i + 6, lines.length - 1); j++) {
      if (!street && /\d/.test(lines[j]) && /str\.|straße|weg|platz|gasse|allee|ring/i.test(lines[j])) {
        street = lines[j];
      }
      if (!street && /\b\d+[a-z]?\b/.test(lines[j]) && lines[j].length < 30) {
        // Might be street with number but without keyword
        if (j === i + 1) street = lines[j];
      }
      if (!plzLine && /^\d{5}\s+\w/.test(lines[j])) {
        plzLine = lines[j];
      }
    }
    if (street && plzLine) {
      nutzerName = line;
      nutzerAdresse = `${street}, ${plzLine}`;
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
  const parts = data.nutzerAdresse.split(",").map(s => s.trim());
  const street = parts[0] ?? "";
  const cityLine = parts[1] ?? "";
  const ort = cityLine.replace(/^\d{5}\s+/, "") || cityLine;

  const aktenzeichen =
    data.aktenzeichen && data.aktenzeichen.toLowerCase() !== "keines"
      ? `Ihr Zeichen: ${data.aktenzeichen}\n\n`
      : "";

  return [
    data.nutzerName,
    street,
    cityLine,
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
