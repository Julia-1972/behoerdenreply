export interface BriefkopfData {
  nutzerName: string;
  nutzerAdresse: string;
  behördeName: string;
  behördeAdresse: string;
  aktenzeichen: string;
}

export function parseBriefkopf(analysisSummary: string): BriefkopfData | null {
  const match = analysisSummary.match(/---BRIEFKOPF---([\s\S]*?)---ENDE---/);
  if (!match) return null;

  const block = match[1];
  const get = (key: string) =>
    (block.match(new RegExp(`${key}:\\s*(.+)`)) ?? [])[1]?.trim() ?? "";

  return {
    nutzerName: get("NUTZER_NAME"),
    nutzerAdresse: get("NUTZER_ADRESSE"),
    behördeName: get("BEHOERDE_NAME"),
    behördeAdresse: get("BEHOERDE_ADRESSE"),
    aktenzeichen: get("AKTENZEICHEN"),
  };
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

  return buildDin5008Header(data, date) + body;
}
