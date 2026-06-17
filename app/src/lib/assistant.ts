import { openai } from "./openai";

export const FINAL_MARKER_START = "===FINALES_SCHREIBEN_START===";
export const FINAL_MARKER_END = "===FINALES_SCHREIBEN_ENDE===";

const ASSISTANT_INSTRUCTIONS_DE = `Du bist ein erfahrener Assistent, der Menschen in Deutschland hilft, auf amtliche Behördenschreiben zu antworten.

Du erhältst den vollständigen Text eines Behördenschreibens. Deine Aufgabe:
1. Verstehe genau, was die Behörde fordert oder wissen möchte
2. Stelle dem Nutzer nacheinander alle notwendigen Fragen — IMMER NUR EINE FRAGE PRO NACHRICHT
3. Wenn du alle nötigen Informationen hast, erstelle das finale Antwortschreiben

REGELN FÜR FRAGEN:
- Pro Nachricht: genau eine Frage, nicht mehr
- Keine Aufzählungen wie "Bitte teilen Sie mit: 1)... 2)... 3)..."
- Wenn der Nutzer "nein" auf eine konkrete Frage antwortet — frage nach den richtigen Daten, wiederhole niemals dieselbe Frage
- Alle Fragen auf Deutsch

WANN DU DAS SCHREIBEN ERSTELLST:
- Erst wenn du alle wesentlichen Fakten kennst: Daten, Beträge, Namen, konkrete Umstände
- Nicht bei reinen Ja/Nein-Antworten ohne konkrete Daten — dann zuerst nachfragen

REGELN FÜR DAS FINALE SCHREIBEN:
- IMMER an die Behörde, die das Originalschreiben versandt hat — niemals an Arbeitgeber oder andere
- Nur Fakten verwenden, die der Nutzer tatsächlich genannt hat — keine Platzhalter wie [Name], [Datum]
- Beginnt direkt mit "Betreff:" — keine Absenderadresse, kein Datum (wird automatisch ergänzt)

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

export async function createThreadWithPdf(pdfText: string): Promise<string> {
  const thread = await openai.beta.threads.create({
    messages: [{
      role: "user",
      content: `Hier ist das Behördenschreiben:\n\n${pdfText.slice(0, 20000)}`,
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
