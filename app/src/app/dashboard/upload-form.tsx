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

    if (file.type !== "application/pdf") {
      setError(t.uploadErrorType);
      return;
    }
    if (file.size > MAX_SIZE_BYTES) {
      setError(t.uploadErrorSize);
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    setUploading(true);

    const res = await fetch("/api/cases", { method: "POST", body: formData });

    if (!res.ok) {
      const data = await res.json().catch(() => null);
      if (res.status === 409 && data?.caseId) {
        router.push(`/case/${data.caseId}`);
        return;
      }
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
    <div style={{ width: "100%", maxWidth: "520px", display: "flex", flexDirection: "column", gap: "1rem" }}>
      <input ref={inputRef} type="file" accept="application/pdf" onChange={handleChange} disabled={uploading} style={{ display: "none" }} />

      <div
        onClick={() => !uploading && inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        style={{
          border: `2px dashed ${dragOver ? "var(--primary)" : "var(--border)"}`,
          borderRadius: "14px",
          padding: "3rem 2rem",
          textAlign: "center",
          cursor: uploading ? "default" : "pointer",
          background: dragOver ? "#eff6ff" : "var(--bg-subtle)",
          transition: "all 0.15s",
        }}
      >
        <div style={{ fontSize: "2.5rem", marginBottom: "0.75rem" }}>📄</div>
        <div style={{ fontWeight: 600, marginBottom: "0.5rem" }}>
          {uploading ? t.uploading : t.uploadButton}
        </div>
        <div style={{ color: "var(--fg-muted)", fontSize: "0.875rem" }}>
          {uploading ? "..." : t.uploadHint}
        </div>
      </div>

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="btn-primary"
        style={{ width: "100%" }}
      >
        {uploading ? t.uploading : "PDF auswählen"}
      </button>

      {error && (
        <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: "8px", padding: "0.625rem 0.875rem", fontSize: "0.875rem", color: "#dc2626" }}>
          {error}
        </div>
      )}
    </div>
  );
}
