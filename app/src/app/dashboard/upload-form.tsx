"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { dictionaries, type Lang } from "@/i18n";

const MAX_SIZE_BYTES = 10 * 1024 * 1024;

export default function UploadForm({ lang }: { lang: Lang }) {
  const router = useRouter();
  const t = dictionaries[lang];
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  async function processFile(file: File) {
    setError(null);
    if (file.type !== "application/pdf") { setError(t.uploadErrorType); return; }
    if (file.size > MAX_SIZE_BYTES) { setError(t.uploadErrorSize); return; }

    const formData = new FormData();
    formData.append("file", file);
    setUploading(true);

    const res = await fetch("/api/cases", { method: "POST", body: formData });
    if (!res.ok) {
      const data = await res.json().catch(() => null);
      if (res.status === 409 && data?.caseId) { router.push(`/case/${data.caseId}`); return; }
      if (res.status === 402) { setError(t.upgradeFreeUsed); setUploading(false); setTimeout(() => router.refresh(), 2000); return; }
      setError(t.error);
      setUploading(false);
      return;
    }
    const data = await res.json();
    router.push(`/case/${data.caseId}`);
  }

  async function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) await processFile(file);
  }

  async function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) await processFile(file);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      <input ref={inputRef} type="file" accept="application/pdf" onChange={handleChange} disabled={uploading} style={{ display: "none" }} />

      <div
        onClick={() => !uploading && inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        style={{
          border: `2px dashed ${dragOver ? "var(--gold)" : "var(--border)"}`,
          borderRadius: "16px",
          padding: "3rem 2rem",
          textAlign: "center",
          cursor: uploading ? "default" : "pointer",
          background: dragOver ? "rgba(201,134,42,0.05)" : "var(--bg-white)",
          transition: "all 0.15s",
        }}
      >
        <div style={{ fontSize: "2.5rem", marginBottom: "0.75rem" }}>📄</div>
        <div style={{ fontWeight: 700, marginBottom: "0.4rem", color: "var(--fg)" }}>
          {uploading ? t.uploading : t.uploadDropzone}
        </div>
        <div style={{ color: "var(--fg-muted)", fontSize: "0.875rem" }}>
          {uploading ? "..." : t.uploadHint}
        </div>
      </div>

      {error && (
        <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: "8px", padding: "0.625rem 0.875rem", fontSize: "0.875rem", color: "#dc2626" }}>
          {error}
        </div>
      )}
    </div>
  );
}
