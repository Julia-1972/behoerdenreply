import { openai, AI_MODEL } from "./openai";

export type QaDecision =
  | { action: "question"; content: string }
  | { action: "final"; content: string };

const SYSTEM_PROMPT = (lang: "ru" | "de") => `Du bist ein Assistent, der Nutzern hilft, auf amtliche Schreiben aus Deutschland zu antworten.

Du erhältst eine interne Zusammenfassung eines amtlichen Schreibens sowie den bisherigen Frage-Antwort-Verlauf mit dem Nutzer.

Deine Aufgabe:
- Falls noch wichtige Informationen fehlen, um eine vollständige, korrekte Antwort an die Behörde zu formulieren, stelle GENAU EINE klare, einfache Frage an den Nutzer (in der Sprache: ${lang === "ru" ? "Russisch" : "Deutsch"}).
- Falls genug Informationen vorhanden sind, formuliere die finale Antwort an die Behörde auf Deutsch (formeller Brief, fertig zum Versenden).

Antworte ausschließlich als JSON: {"action": "question", "content": "..."} oder {"action": "final", "content": "..."}.
Stelle nur EINE Frage zur Zeit. Frage nur nach Informationen, die wirklich fehlen und für die Antwort nötig sind.`;

export async function getNextQaStep(
  analysisSummary: string,
  history: { role: "ai_question" | "user_answer"; content: string }[],
  lang: "ru" | "de"
): Promise<QaDecision> {
  const messages: { role: "system" | "user" | "assistant"; content: string }[] = [
    { role: "system", content: SYSTEM_PROMPT(lang) },
    { role: "user", content: `Zusammenfassung des Schreibens:\n${analysisSummary}` },
  ];

  for (const m of history) {
    messages.push({
      role: m.role === "ai_question" ? "assistant" : "user",
      content: m.content,
    });
  }

  const completion = await openai.chat.completions.create({
    model: AI_MODEL,
    messages,
    response_format: { type: "json_object" },
  });

  const raw = completion.choices[0]?.message?.content ?? "{}";
  const parsed = JSON.parse(raw) as QaDecision;

  if (parsed.action !== "question" && parsed.action !== "final") {
    throw new Error("invalid_qa_decision");
  }

  return parsed;
}
