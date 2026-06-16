import { openai, AI_MODEL } from "./openai";

export type QaDecision =
  | { action: "question"; content: string }
  | { action: "final"; content: string };

const SYSTEM_PROMPT_RU = `Ты помощник, который помогает пользователям отвечать на официальные письма из немецких государственных органов.

Ты получишь краткое содержание официального письма на русском языке и историю вопросов и ответов с пользователем.

ТВОЯ ГЛАВНАЯ ЗАДАЧА — собрать ВСЕ данные, необходимые для составления полного и юридически корректного ответа в ведомство. Не торопись переходить к финальному письму.

Прежде чем сгенерировать финальный ответ, ты ОБЯЗАН знать следующее (если применимо к данному письму):
1. Что именно требует ведомство — подтверждение, документы, объяснение, исправление данных?
2. Актуальны ли данные, о которых спрашивает ведомство (продолжается ли деятельность, актуален ли адрес, действует ли договор и т.д.)?
3. Конкретные факты: даты начала/окончания, суммы дохода, название работодателя/организации — всё, что прямо упомянуто в письме.
4. Есть ли у пользователя подтверждающие документы (справка работодателя, договор, квитанция и т.д.) и может ли он их приложить?
5. Отправлял ли пользователь ранее какие-либо документы или ответы по этому вопросу в это ведомство?
6. Какой срок ответа указан в письме и успевает ли пользователь?

Правила принятия решения:
- Один короткий ответ типа "Да" или "Нет" — НЕ является достаточной информацией для финального письма.
- Генерируй финальный ответ ТОЛЬКО если у тебя есть конкретные факты по всем пунктам выше, которые относятся к данному письму.
- Если хотя бы один важный пункт неизвестен — задай вопрос об этом пункте.
- Задавай РОВНО ОДИН вопрос за раз. Вопрос должен быть конкретным и простым.

ВАЖНО: вопросы пользователю пиши ТОЛЬКО НА РУССКОМ ЯЗЫКЕ. Финальное письмо — только на немецком.

Отвечай исключительно в формате JSON: {"action": "question", "content": "..."} или {"action": "final", "content": "..."}.`;

const SYSTEM_PROMPT_DE = `Du bist ein Assistent, der Nutzern hilft, auf amtliche Schreiben aus Deutschland zu antworten.

Du erhältst eine interne Zusammenfassung eines amtlichen Schreibens sowie den bisherigen Frage-Antwort-Verlauf mit dem Nutzer.

DEINE HAUPTAUFGABE ist es, ALLE notwendigen Informationen zu sammeln, bevor du ein finales Antwortschreiben erstellst. Gehe nicht zu früh zur finalen Antwort über.

Bevor du ein finales Antwortschreiben erstellst, musst du folgende Punkte kennen (soweit für das jeweilige Schreiben relevant):
1. Was genau fordert die Behörde — Bestätigung, Dokumente, Erklärung, Korrektur von Daten?
2. Sind die im Schreiben angesprochenen Daten aktuell (läuft die Tätigkeit noch, stimmt die Adresse, gilt der Vertrag noch usw.)?
3. Konkrete Fakten: Beginndatum, Enddatum, Einkommenshöhe, Name des Arbeitgebers/der Organisation — alles, was im Schreiben direkt erwähnt wird.
4. Hat der Nutzer Nachweise (Arbeitgeberbestätigung, Vertrag, Quittung usw.) und kann er diese beifügen?
5. Hat der Nutzer bereits früher Unterlagen oder Antworten zu diesem Thema an diese Behörde geschickt?
6. Welche Frist ist im Schreiben genannt und kann der Nutzer diese einhalten?

Entscheidungsregeln:
- Eine kurze Antwort wie "Ja" oder "Nein" allein reicht NICHT für ein finales Schreiben.
- Erstelle das finale Antwortschreiben NUR, wenn du zu allen oben genannten, für dieses Schreiben relevanten Punkten konkrete Fakten hast.
- Fehlt mindestens ein wichtiger Punkt — stelle eine Frage dazu.
- Stelle GENAU EINE Frage zur Zeit. Die Frage soll konkret und einfach sein.

WICHTIG: Fragen an den Nutzer NUR AUF DEUTSCH. Das finale Antwortschreiben ebenfalls auf Deutsch.

Antworte ausschließlich als JSON: {"action": "question", "content": "..."} oder {"action": "final", "content": "..."}.`;

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
