export interface BriefkopfData {
  nutzerName: string;
  nutzerAdresse: string;
  behördeName: string;
  behördeAdresse: string;
  aktenzeichen: string;
}

export function parseBriefkopf(analysisSummary: string): BriefkopfData | null {
  // Try new JSON format: BRIEFKOPF_JSON:{...}
  const jsonMatch = analysisSummary.match(/BRIEFKOPF_JSON:\s*(\{[^\n]+\})/);
  if (jsonMatch) {
    try {
      const parsed = JSON.parse(jsonMatch[1]);
      console.log("[briefkopf] JSON parsed:", JSON.stringify(parsed));
      return {
        nutzerName: parsed.nutzerName ?? "",
        nutzerAdresse: parsed.nutzerAdresse ?? "",
        behördeName: parsed.behördeName ?? "",
        behördeAdresse: parsed.behördeAdresse ?? "",
        aktenzeichen: parsed.aktenzeichen ?? "",
      };
    } catch {
      console.log("[briefkopf] JSON parse failed:", jsonMatch[1]);
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
