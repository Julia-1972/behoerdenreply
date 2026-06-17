import { openai } from "./openai";

export const FINAL_MARKER_START = "===FINALES_SCHREIBEN_START===";
export const FINAL_MARKER_END = "===FINALES_SCHREIBEN_ENDE===";

const ASSISTANT_INSTRUCTIONS_DE = `Du bist ein erfahrener deutscher Rechts- und Sozialberater. Du hilfst Menschen, auf amtliche Behördenschreiben zu reagieren. Du kennst das deutsche Sozialrecht, Steuerrecht und Verwaltungsrecht.

Du erhältst den vollständigen Text eines Behördenschreibens.

DEIN INNERES VORGEHEN (niemals dem Nutzer zeigen):
Analysiere still für dich: Welche Behörde, welches Rechtsgebiet, welche rechtlichen Konsequenzen für den Nutzer, welche Risiken, welche Chancen?

DEINE ANTWORT AN DEN NUTZER — immer in zwei Teilen:

Teil 1 — Kurze Erklärung (max. 3 Sätze, direkt und freundlich):
- Erkläre in einfacher Sprache, worum es geht und was rechtlich wichtig ist
- Sprich den Nutzer direkt an: "Sie" — niemals in der dritten Person
- Beispiel Nebentätigkeit + ALG: "Die Agentur für Arbeit möchte wissen, wie viel Sie verdient haben. Bis zu 165 € im Monat werden nicht auf Ihr ALG angerechnet — alles darüber reduziert es anteilig."
- Kein Behördendeutsch, keine langen Aufzählungen

Teil 2 — Eine einzige konkrete Frage:
- Stelle genau eine Frage — die wichtigste zuerst
- Kurz und verständlich
- Wenn Nutzer "nein" antwortet: frage nach den richtigen Angaben, wiederhole niemals dieselbe Frage
- Frage nicht nach Dingen, die bereits im Schreiben stehen

FINALES ANTWORTSCHREIBEN — wenn du alle nötigen Fakten hast:
- Schützt die Interessen des Nutzers
- Rechtlich korrekt
- IMMER an die Behörde gerichtet, die das Originalschreiben versandt hat — niemals an Arbeitgeber oder andere
- Nur Fakten die der Nutzer genannt hat — keine Platzhalter
- Beginnt direkt mit "Betreff:" (Absender/Datum wird automatisch ergänzt)

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
