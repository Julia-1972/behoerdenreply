import { openai, AI_MODEL } from "./openai";

export type QaDecision =
  | { action: "question"; content: string }
  | { action: "final"; content: string };

const SYSTEM_PROMPT_RU = `Ты помощник, который помогает пользователям отвечать на официальные письма из немецких государственных органов.

Ты получишь краткое содержание официального письма на русском языке и историю вопросов и ответов с пользователем.

Твоя задача:
- Если для составления полного и корректного ответа в ведомство ещё не хватает важной информации — задай пользователю РОВНО ОДИН чёткий и простой вопрос.
- Если информации достаточно — составь финальный ответ в ведомство на немецком языке (официальное письмо, готовое к отправке).

ВАЖНО: вопросы пользователю пиши ТОЛЬКО НА РУССКОМ ЯЗЫКЕ. Никакого немецкого в вопросах. Финальное письмо — только на немецком.

Отвечай исключительно в формате JSON: {"action": "question", "content": "..."} или {"action": "final", "content": "..."}.
Задавай только ОДИН вопрос за раз. Спрашивай только о том, что действительно необходимо для ответа.`;

const SYSTEM_PROMPT_DE = `Du bist ein Assistent, der Nutzern hilft, auf amtliche Schreiben aus Deutschland zu antworten.

Du erhältst eine interne Zusammenfassung eines amtlichen Schreibens sowie den bisherigen Frage-Antwort-Verlauf mit dem Nutzer.

Deine Aufgabe:
- Falls noch wichtige Informationen fehlen, um eine vollständige, korrekte Antwort an die Behörde zu formulieren, stelle GENAU EINE klare, einfache Frage an den Nutzer.
- Falls genug Informationen vorhanden sind, formuliere die finale Antwort an die Behörde auf Deutsch (formeller Brief, fertig zum Versenden).

WICHTIG: Fragen an den Nutzer NUR AUF DEUTSCH. Kein Russisch in den Fragen. Das finale Antwortschreiben ebenfalls auf Deutsch.

Antworte ausschließlich als JSON: {"action": "question", "content": "..."} oder {"action": "final", "content": "..."}.
Stelle nur EINE Frage zur Zeit. Frage nur nach Informationen, die wirklich fehlen und für die Antwort nötig sind.`;

async function translateSummaryToRussian(summary: string): Promise<string> {
  const completion = await openai.chat.completions.create({
    model: AI_MODEL,
    messages: [
      {
        role: "system",
        content: "Переведи следующий текст с немецкого на русский язык. Переводи точно, сохраняя все детали. Верни только перевод, без пояснений.",
      },
      { role: "user", content: summary },
    ],
  });
  return completion.choices[0]?.message?.content ?? summary;
}

export async function getNextQaStep(
  analysisSummary: string,
  history: { role: "ai_question" | "user_answer"; content: string }[],
  lang: "ru" | "de"
): Promise<QaDecision> {
  const systemPrompt = lang === "ru" ? SYSTEM_PROMPT_RU : SYSTEM_PROMPT_DE;

  const contextSummary =
    lang === "ru"
      ? await translateSummaryToRussian(analysisSummary)
      : analysisSummary;

  const summaryLabel =
    lang === "ru"
      ? "Краткое содержание официального письма:"
      : "Zusammenfassung des Schreibens:";

  const languageInstruction =
    lang === "ru"
      ? "\n\nТвой ответ должен быть только на русском языке."
      : "";

  const messages: { role: "system" | "user" | "assistant"; content: string }[] = [
    { role: "system", content: systemPrompt },
    {
      role: "user",
      content: `${summaryLabel}\n${contextSummary}${languageInstruction}`,
    },
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
