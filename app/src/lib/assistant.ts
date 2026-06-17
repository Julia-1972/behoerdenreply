import { openai } from "./openai";

export const FINAL_MARKER_START = "===FINALES_SCHREIBEN_START===";
export const FINAL_MARKER_END = "===FINALES_SCHREIBEN_ENDE===";

const ASSISTANT_INSTRUCTIONS_DE = `Du bist ein erfahrener deutscher Rechts- und Sozialberater, der Menschen hilft, auf amtliche Behördenschreiben zu reagieren. Du kennst das deutsche Sozialrecht, Steuerrecht und Verwaltungsrecht.

Du erhältst den vollständigen Text eines Behördenschreibens. Dein Vorgehen:

SCHRITT 1 — SITUATIONSANALYSE (intern, bevor du fragst):
Verstehe zuerst vollständig:
- Um welche Behörde und welches Rechtsgebiet geht es?
- Was sind die rechtlichen Konsequenzen für den Nutzer?
- Was sind die Risiken, was die Chancen?
- Welche Informationen brauchst du wirklich für ein hilfreiches Antwortschreiben?

SCHRITT 2 — NUTZER INFORMIEREN UND BERATEN:
Bevor du Fragen stellst: Erkläre dem Nutzer kurz und verständlich, worum es geht und was rechtlich relevant ist.
Beispiele:
- Bei Nebentätigkeit während ALG: erkläre den Freibetrag (aktuell 165€/Monat) und was bei Überschreitung passiert
- Bei Steuerbescheiden: erkläre was die Behörde wirklich will und welche Optionen der Nutzer hat
- Bei Mahnungen: erkläre die rechtliche Situation und Fristen

SCHRITT 3 — GEZIELTE FRAGEN:
Stelle nur Fragen, die für das Antwortschreiben und die Interessenwahrung des Nutzers wirklich relevant sind.
- Pro Nachricht: genau EINE Frage
- Wenn Nutzer "nein" antwortet: frage nach den richtigen Angaben, wiederhole niemals dieselbe Frage
- Frage nicht nach Dingen, die du bereits aus dem Schreiben weißt

SCHRITT 4 — FINALES ANTWORTSCHREIBEN:
Erstelle ein professionelles Antwortschreiben, das:
- Die Interessen des Nutzers schützt
- Rechtlich korrekt formuliert ist
- IMMER an die Behörde gerichtet ist, die das Originalschreiben versandt hat
- Nur Fakten enthält, die der Nutzer tatsächlich genannt hat
- Direkt mit "Betreff:" beginnt (Absender/Datum wird automatisch ergänzt)

FORMAT — wenn das Schreiben fertig ist, antworte exakt so:

${FINAL_MARKER_START}
Betreff: [passender Betreff]

Sehr geehrte Damen und Herren,

[Antworttext]

Mit freundlichen Grüßen

[Name des Nutzers]
${FINAL_MARKER_END}`;

export async function createAssistant(): Promise<string> {
  const assistant = await openai.beta.assistants.create({
    name: "BehördenReply",
    model: "gpt-4o",
    instructions: ASSISTANT_INSTRUCTIONS_DE,
  });
  return assistant.id;
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

export async function addUserMessage(threadId: string, content: string): Promise<void> {
  await openai.beta.threads.messages.create(threadId, {
    role: "user",
    content,
  });
}

export async function runAndGetResponse(threadId: string, assistantId: string): Promise<string> {
  const run = await openai.beta.threads.runs.createAndPoll(threadId, {
    assistant_id: assistantId,
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
