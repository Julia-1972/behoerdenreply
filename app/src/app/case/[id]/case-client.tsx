"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { CaseStatus, CaseMessage, CaseResult } from "@/lib/database.types";
import type { Dictionary, Lang } from "@/i18n";

type InitialMessage = Pick<CaseMessage, "id" | "role" | "content" | "created_at">;
type InitialResult = {
  final_text: CaseResult["final_text"];
  pdf_url: string | null;
  docx_url: string | null;
} | null;

export default function CaseClient({
  caseId,
  initialStatus,
  errorReason,
  initialMessages,
  initialResult,
  lang,
  t,
}: {
  caseId: string;
  initialStatus: CaseStatus;
  errorReason: string | null;
  initialMessages: InitialMessage[];
  initialResult: InitialResult;
  lang: Lang;
  t: Dictionary;
}) {
  const router = useRouter();
  const [status, setStatus] = useState<CaseStatus>(initialStatus);
  const [unreadable, setUnreadable] = useState(errorReason === "unreadable");
  const [aiError, setAiError] = useState(errorReason === "ai_error");
  const [messages, setMessages] = useState<InitialMessage[]>(initialMessages);
  const [result, setResult] = useState<InitialResult>(initialResult);
  const [answer, setAnswer] = useState("");
  const [sending, setSending] = useState(false);
  const started = useRef(false);

  useEffect(() => {
    if (initialStatus !== "uploaded" || started.current) return;
    started.current = true;

    setStatus("analyzing");

    fetch(`/api/cases/${caseId}/analyze`, { method: "POST" })
      .then(async (res) => {
        if (res.status === 422) {
          setUnreadable(true);
          setStatus("cancelled");
          return;
        }

        if (res.status === 502) {
          setAiError(true);
          setStatus("cancelled");
          return;
        }

        if (!res.ok) {
          return;
        }

        router.refresh();
      })
      .catch(() => {});
  }, [initialStatus, caseId, router]);

  async function submitAnswer() {
    const trimmed = answer.trim();
    if (!trimmed || sending) return;

    setSending(true);

    const optimisticQuestion: InitialMessage = {
      id: `local-${Date.now()}`,
      role: "user_answer",
      content: trimmed,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimisticQuestion]);
    setAnswer("");

    try {
      const res = await fetch(`/api/cases/${caseId}/answer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answer: trimmed }),
      });

      if (res.status === 502) {
        setAiError(true);
        setStatus("cancelled");
        return;
      }

      if (!res.ok) return;

      const data = await res.json();

      if (data.status === "done") {
        setResult({
          final_text: data.final_text,
          pdf_url: data.pdf_url ?? null,
          docx_url: data.docx_url ?? null,
        });
        setStatus("done");
      } else if (data.status === "questioning" && data.question) {
        setMessages((prev) => [
          ...prev,
          {
            id: `local-q-${Date.now()}`,
            role: "ai_question",
            content: data.question,
            created_at: new Date().toISOString(),
          },
        ]);
      }
    } finally {
      setSending(false);
    }
  }

  if (aiError) {
    return (
      <div className="flex flex-col items-center gap-3 text-center">
        <h1 className="text-lg font-semibold">{t.aiErrorTitle}</h1>
        <p className="max-w-sm text-sm text-gray-600">{t.aiErrorText}</p>
        <Link href="/dashboard" className="rounded bg-black px-4 py-2 text-white">
          {t.backToDashboard}
        </Link>
      </div>
    );
  }

  if (unreadable) {
    return (
      <div className="flex flex-col items-center gap-3 text-center">
        <h1 className="text-lg font-semibold">{t.unreadableTitle}</h1>
        <p className="max-w-sm text-sm text-gray-600">{t.unreadableText}</p>
        <Link href="/dashboard" className="rounded bg-black px-4 py-2 text-white">
          {t.backToDashboard}
        </Link>
      </div>
    );
  }

  if (status === "uploaded" || status === "analyzing") {
    return (
      <div className="flex flex-col items-center gap-3 text-center">
        <p className="text-sm text-gray-600">{t.analyzing}</p>
      </div>
    );
  }

  if (status === "done" && result) {
    return (
      <div className="flex w-full max-w-xl flex-col gap-4">
        <h1 className="text-lg font-semibold">{t.finalTitle}</h1>
        <p className="text-sm text-gray-600">{t.finalIntro}</p>
        <pre className="whitespace-pre-wrap rounded border bg-gray-50 p-4 text-sm">
          {result.final_text}
        </pre>
        <div className="flex gap-3">
          {result.pdf_url && (
            <a
              href={result.pdf_url}
              className="rounded bg-black px-4 py-2 text-sm text-white"
            >
              {t.downloadPdf}
            </a>
          )}
          {result.docx_url && (
            <a
              href={result.docx_url}
              className="rounded bg-black px-4 py-2 text-sm text-white"
            >
              {t.downloadDocx}
            </a>
          )}
        </div>
        <Link href="/dashboard" className="text-sm text-gray-600 underline">
          {t.backToDashboard}
        </Link>
      </div>
    );
  }

  if (status === "questioning") {
    const lastQuestion = [...messages]
      .reverse()
      .find((m) => m.role === "ai_question");

    return (
      <div className="flex w-full max-w-xl flex-col gap-4">
        <div className="flex flex-col gap-3">
          {messages.map((m) => (
            <div
              key={m.id}
              className={
                m.role === "ai_question"
                  ? "rounded bg-gray-100 p-3 text-sm"
                  : "rounded bg-black p-3 text-sm text-white self-end"
              }
            >
              {m.content}
            </div>
          ))}
        </div>

        {lastQuestion && (
          <div className="flex flex-col gap-2">
            <textarea
              className="w-full rounded border p-2 text-sm"
              rows={3}
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder={t.answerPlaceholder}
              disabled={sending}
            />
            <button
              onClick={submitAnswer}
              disabled={sending || !answer.trim()}
              className="self-end rounded bg-black px-4 py-2 text-sm text-white disabled:opacity-50"
            >
              {sending ? t.answerSending : t.answerButton}
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-3 text-center">
      <p className="text-sm text-gray-600">Status: {status}</p>
    </div>
  );
}
