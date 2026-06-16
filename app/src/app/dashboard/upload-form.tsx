"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { dictionaries, type Lang } from "@/i18n";

const MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

export default function UploadForm({ lang }: { lang: Lang }) {
  const router = useRouter();
  const t = dictionaries[lang];
  const inputRef = useRef<HTMLInputElement>(null);

  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  async function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);

    if (file.type !== "application/pdf") {
      setError(t.uploadErrorType);
      e.target.value = "";
      return;
    }

    if (file.size > MAX_SIZE_BYTES) {
      setError(t.uploadErrorSize);
      e.target.value = "";
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    setUploading(true);

    const res = await fetch("/api/cases", {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      const data = await res.json().catch(() => null);

      if (res.status === 409 && data?.caseId) {
        router.push(`/case/${data.caseId}`);
        return;
      }

      setError(t.error);
      setUploading(false);
      e.target.value = "";
      return;
    }

    const data = await res.json();
    router.push(`/case/${data.caseId}`);
  }

  return (
    <div className="flex w-full max-w-sm flex-col items-center gap-3 text-center">
      <h2 className="text-lg font-semibold">{t.uploadTitle}</h2>
      <p className="text-sm text-gray-500">{t.uploadHint}</p>

      <input
        ref={inputRef}
        type="file"
        accept="application/pdf"
        onChange={handleChange}
        disabled={uploading}
        className="hidden"
      />

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="rounded bg-black px-4 py-2 text-white disabled:opacity-50"
      >
        {uploading ? t.uploading : t.uploadButton}
      </button>

      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
