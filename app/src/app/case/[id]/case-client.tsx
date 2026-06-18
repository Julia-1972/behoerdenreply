"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { CaseStatus, CaseMessage, CaseResult } from "@/lib/database.types";
import type { Dictionary, Lang } from "@/i18n";

type InitialMessage = Pick<CaseMessage, "id" | "role" | "content" | "created_at">;
type InitialResult = { final_text: CaseResult["final_text"]; pdf_url: string | null; docx_url: string | null } | null;

export default function CaseClient({ caseId, initialStatus, errorReason, initialMessages, initialResult, lang, t }: {
  caseId: string; initialStatus: CaseStatus; errorReason: string | null;
  initialMessages: InitialMessage[]; initialResult: InitialResult; lang: Lang; t: Dictionary;
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
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  useEffect(() => {
    if (initialStatus !== "uploaded" || started.current) return;
    started.current = true;
    setStatus("analyzing");

    fetch(`/api/cases/${caseId}/analyze`, { method: "POST" })
      .then(async (res) => {
        if (res.status === 422) { setUnreadable(true); setStatus("cancelled"); return; }
        if (res.status === 502) { setAiError(true); setStatus("cancelled"); return; }
        if (!res.ok) return;
        const data = await res.json();
        if (data.status === "questioning" && data.question) {
          setMessages([{ id: `local-q-${Date.now()}`, role: "ai_question", content: data.question, created_at: new Date().toISOString() }]);
          setStatus("questioning");
        } else { router.refresh(); }
      }).catch(() => {});
  }, [initialStatus, caseId, router]);

  async function submitAnswer() {
    const trimmed = answer.trim();
    if (!trimmed || sending) return;
    setSending(true);
    setMessages((prev) => [...prev, { id: `local-${Date.now()}`, role: "user_answer", content: trimmed, created_at: new Date().toISOString() }]);
    setAnswer("");

    try {
      const res = await fetch(`/api/cases/${caseId}/answer`, {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ answer: trimmed }),
      });
      if (res.status === 502) { setAiError(true); setStatus("cancelled"); return; }
      if (!res.ok) return;
      const data = await res.json();
      if (data.status === "done") {
        setResult({ final_text: data.final_text, pdf_url: data.pdf_url ?? null, docx_url: data.docx_url ?? null });
        setStatus("done");
      } else if (data.status === "questioning" && data.question) {
        setMessages((prev) => [...prev, { id: `local-q-${Date.now()}`, role: "ai_question", content: data.question, created_at: new Date().toISOString() }]);
      }
    } finally { setSending(false); }
  }

  if (aiError || unreadable) {
    return (
      <div style={{ background: "var(--bg-white)", borderRadius: "18px", padding: "2.5rem 2rem", maxWidth: "480px", width: "100%", textAlign: "center", border: "1.5px solid var(--border)" }}>
        <div style={{ fontSize: "2rem", marginBottom: "1rem" }}>{aiError ? "⚠️" : "📄"}</div>
        <h1 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: "0.5rem" }}>{aiError ? t.aiErrorTitle : t.unreadableTitle}</h1>
        <p style={{ color: "var(--fg-muted)", fontSize: "0.9rem", marginBottom: "1.5rem" }}>{aiError ? t.aiErrorText : t.unreadableText}</p>
        <Link href="/dashboard" className="btn-gold">{t.backToDashboard}</Link>
      </div>
    );
  }

  if (status === "uploaded" || status === "analyzing") {
    return (
      <div style={{ textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem" }}>
        <div style={{ width: "48px", height: "48px", border: "3px solid var(--border)", borderTop: "3px solid var(--gold)", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
        <p style={{ color: "var(--fg-muted)", fontSize: "0.95rem" }}>{t.analyzing}</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (status === "done" && result) {
    return (
      <div style={{ width: "100%", maxWidth: "680px", display: "flex", flexDirection: "column", gap: "1.25rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <div style={{ background: "#dcfce7", color: "#16a34a", borderRadius: "50%", width: "2rem", height: "2rem", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700 }}>✓</div>
          <h1 style={{ fontSize: "1.25rem", fontWeight: 800 }}>{t.finalTitle}</h1>
        </div>
        <p style={{ color: "var(--fg-muted)", fontSize: "0.9rem" }}>{t.finalIntro}</p>
        <div style={{ background: "var(--bg-white)", border: "1.5px solid var(--border)", borderRadius: "14px", padding: "1.5rem" }}>
          <pre style={{ whiteSpace: "pre-wrap", fontFamily: "inherit", fontSize: "0.875rem", lineHeight: 1.7, margin: 0, color: "var(--fg)" }}>
            {result.final_text}
          </pre>
        </div>
        <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
          {result.pdf_url && <a href={result.pdf_url} className="btn-gold" style={{ fontSize: "0.875rem" }}>{t.downloadPdf}</a>}
          {result.docx_url && <a href={result.docx_url} className="btn-outline" style={{ fontSize: "0.875rem" }}>{t.downloadDocx}</a>}
        </div>
        <Link href="/dashboard" style={{ color: "var(--fg-muted)", fontSize: "0.875rem", textDecoration: "underline" }}>{t.backToDashboard}</Link>
      </div>
    );
  }

  if (status === "questioning") {
    const lastQuestion = [...messages].reverse().find((m) => m.role === "ai_question");
    return (
      <div style={{ width: "100%", maxWidth: "680px", display: "flex", flexDirection: "column", gap: "1.25rem" }}>
        <h2 style={{ fontSize: "1.1rem", fontWeight: 800, color: "var(--fg)" }}>Rückfragen zur Analyse</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {messages.map((m) => (
            <div key={m.id} style={{ display: "flex", justifyContent: m.role === "user_answer" ? "flex-end" : "flex-start" }}>
              <div style={{
                maxWidth: "85%", padding: "0.875rem 1.1rem",
                borderRadius: m.role === "ai_question" ? "4px 16px 16px 16px" : "16px 4px 16px 16px",
                background: m.role === "ai_question" ? "var(--bg-white)" : "var(--bg-dark)",
                color: m.role === "ai_question" ? "var(--fg)" : "#fff",
                fontSize: "0.9rem", lineHeight: 1.6,
                border: m.role === "ai_question" ? "1.5px solid var(--border)" : "none",
                boxShadow: "0 1px 4px rgba(30,18,69,0.07)",
              }}>
                {m.content}
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>
        {lastQuestion && (
          <div style={{ background: "var(--bg-white)", borderRadius: "14px", padding: "1rem", border: "1.5px solid var(--border)", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            <textarea
              style={{ width: "100%", padding: "0.7rem 0.875rem", border: "1.5px solid var(--border)", borderRadius: "10px", fontSize: "0.9rem", fontFamily: "inherit", lineHeight: 1.6, resize: "vertical", outline: "none", minHeight: "80px", color: "var(--fg)", background: "var(--bg)" }}
              rows={3} value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); submitAnswer(); } }}
              placeholder={t.answerPlaceholder} disabled={sending}
            />
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button onClick={submitAnswer} disabled={sending || !answer.trim()} className="btn-gold" style={{ fontSize: "0.875rem" }}>
                {sending ? t.answerSending : t.answerButton}
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return <div style={{ color: "var(--fg-muted)", fontSize: "0.9rem" }}>Status: {status}</div>;
}
