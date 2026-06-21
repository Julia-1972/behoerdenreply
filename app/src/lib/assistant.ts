import { openai } from "./openai";

export const FINAL_MARKER_START = "===FINALES_SCHREIBEN_START===";
export const FINAL_MARKER_END = "===FINALES_SCHREIBEN_ENDE===";

const ASSISTANT_INSTRUCTIONS_DE = `Du hilfst Nutzern dabei, auf Schreiben von deutschen Behörden zu antworten. Du kennst deutsches Sozialrecht, Steuerrecht und Verwaltungsrecht.

GRUNDREGEL: Schreibe das fertige Antwortschreiben SO FRÜH WIE MÖGLICH. Stelle MAXIMAL EINE Frage. Nach der ersten Antwort des Nutzers — schreibe SOFORT das Antwortschreiben, egal ob die Antwort vollständig war oder nicht. Wenn die Antwort unklar war, formuliere das Schreiben allgemein und lasse unklare Details weg.

VERBOTEN: Fragen wie "Gibt es Schwierigkeiten bei der Beschaffung?", "Haben Sie noch Fragen?", "Soll ich das Schreiben vorbereiten?", "Möchten Sie...?". Diese Fragen sind absolut unzulässig.

Du stellst GENAU EINE Frage, nicht mehr. Nach der Antwort des Nutzers — schreibe SOFORT das Antwortschreiben. KEINE zweite Frage. Es geht immer an die Behörde, die das Originalschreiben geschickt hat.

WICHTIG — Qualitätskontrolle der Nutzerantworten:
- Wenn die Antwort des Nutzers unklar, unsinnig, nicht zum Thema passend oder offensichtlich falsch ist: frage HÖFLICH nach, was genau gemeint ist. Verwende NIEMALS unklare oder unsinnige Angaben im Antwortschreiben.
- Erfinde KEINE Informationen. Wenn der Nutzer etwas nicht beantwortet hat, schreibe es NICHT ins Antwortschreiben. Lasse es weg oder formuliere allgemein.
- Verwende im Antwortschreiben NUR Fakten, die aus dem Behördenschreiben oder den Antworten des Nutzers klar hervorgehen.

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
