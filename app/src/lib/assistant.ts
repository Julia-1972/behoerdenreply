import { openai } from "./openai";

export const FINAL_MARKER_START = "===FINALES_SCHREIBEN_START===";
export const FINAL_MARKER_END = "===FINALES_SCHREIBEN_ENDE===";

const ASSISTANT_INSTRUCTIONS_DE = `Du hilfst Nutzern dabei, auf Schreiben von deutschen Behörden zu antworten. Du kennst deutsches Sozialrecht, Steuerrecht und Verwaltungsrecht.

GRUNDREGEL: Schreibe das fertige Antwortschreiben SO FRÜH WIE MÖGLICH. Stelle eine Frage NUR wenn eine Information absolut notwendig ist und ohne sie das Schreiben nicht verfasst werden kann. Sobald du genug Informationen hast — schreibe sofort das Schreiben, KEINE weiteren Fragen.

VERBOTEN: Fragen wie "Gibt es Schwierigkeiten bei der Beschaffung?", "Haben Sie noch Fragen?", "Soll ich das Schreiben vorbereiten?", "Möchten Sie...?". Diese Fragen sind absolut unzulässig. Wenn der Nutzer auf eine Frage geantwortet hat — schreibe sofort das Schreiben.

Stelle pro Nachricht höchstens eine Frage. Nach maximal 2 Fragen schreibe das Antwortschreiben SOFORT — egal ob du noch Fragen hättest. Es geht immer an die Behörde, die das Originalschreiben geschickt hat.

Im finalen Antwortschreiben: konkrete Gesetzesparagraphen angeben.

Wenn das Schreiben fertig ist, gib es in genau diesem Format aus, ohne Text davor oder danach:

${FINAL_MARKER_START}
Betreff: <Betreff>

Sehr geehrte Damen und Herren,

<Text>

Mit freundlichen Grüßen

<Name des Nutzers>
${FINAL_MARKER_END}`;

export async function createAssistant(): Promise<string> {
  const assistant = await openai.beta.assistants.create({
    name: "BehördenReply",
    model: "gpt-4o",
    instructions: ASSISTANT_INSTRUCTIONS_DE,
  });
  return assistant.id;
}

export async function preAnalyzeLetter(pdfText: string): Promise<string> {
  const completion = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content: `Du bist Experte für deutsches Verwaltungs-, Sozial- und Steuerrecht. Analysiere das folgende Behördenschreiben und erstelle eine strukturierte Kurzanalyse auf Deutsch mit genau diesen Abschnitten:

SITUATION: [Typ des Schreibens, betroffene Behörde, Kernthema in 1-2 Sätzen]
BEREITS BEKANNT: [Alle relevanten Fakten, die direkt aus dem Schreiben hervorgehen — Name, Datum, Aktenzeichen, Beträge, Fristen, etc.]
RECHTLICHER KONTEXT: [Anwendbare Gesetze, Paragraphen, Freibeträge, Fristen — konkret und vollständig]
FEHLENDE INFORMATIONEN: [Was fehlt für eine vollständige Antwort — nur das, was NICHT im Schreiben steht]
HANDLUNGSEMPFEHLUNG: [Was sollte die Antwort bezwecken — Widerspruch, Bestätigung, Ergänzung, etc.]`,
      },
      {
        role: "user",
        content: pdfText.slice(0, 20000),
      },
    ],
    max_tokens: 800,
  });

  return completion.choices[0]?.message?.content ?? "";
}

export async function createThreadWithPdf(pdfText: string, nutzerName?: string): Promise<string> {
  const nameHint = nutzerName
    ? `\n\n[Hinweis: Der vollständige Name des Nutzers lautet: ${nutzerName}. Bitte diesen Namen im finalen Schreiben verwenden und NICHT erneut danach fragen.]`
    : "";

  const thread = await openai.beta.threads.create({
    messages: [{
      role: "user",
      content: `Hier ist das Behördenschreiben:\n\n${pdfText.slice(0, 20000)}${nameHint}`,
    }],
  });
  return thread.id;
}

export function buildAdditionalInstructions(preAnalysis: string, isFirstRun = false): string {
  const firstRunRule = isFirstRun
    ? `- In dieser ersten Nachricht: Erkläre dem Nutzer kurz den rechtlichen Kontext aus "RECHTLICHER KONTEXT" — konkrete Paragraphen, relevante Rechte oder Konsequenzen.\n`
    : "";
  return `VORANALYSE DES SCHREIBENS (Pflichtlektüre):
${preAnalysis}

Regeln:
${firstRunRule}- Alle unter "BEREITS BEKANNT" genannten Fakten NIEMALS erfragen.
- Frage nur nach Informationen aus "FEHLENDE INFORMATIONEN".`;
}

export async function addUserMessage(threadId: string, content: string): Promise<void> {
  await openai.beta.threads.messages.create(threadId, {
    role: "user",
    content,
  });
}

export async function runAndGetResponse(threadId: string, assistantId: string, additionalInstructions?: string): Promise<string> {
  const run = await openai.beta.threads.runs.createAndPoll(threadId, {
    assistant_id: assistantId,
    ...(additionalInstructions ? { additional_instructions: additionalInstructions } : {}),
  });

  if (run.status !== "completed") {
    throw new Error(`Assistant run failed: ${run.status}`);
  }

  const messages = await openai.beta.threads.messages.list(threadId, {
    order: "desc",
    limit: 1,
  });

  const content = messages.data[0]?.content[0];
  if (!content || content.type !== "text") throw new Error("Unexpected response type");
  return content.text.value;
}

export function extractFinalLetter(response: string): string | null {
  const start = response.indexOf(FINAL_MARKER_START);
  const end = response.indexOf(FINAL_MARKER_END);
  if (start === -1 || end === -1) return null;
  return response.slice(start + FINAL_MARKER_START.length, end).trim();
}
