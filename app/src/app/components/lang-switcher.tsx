"use client";

import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";
import type { Lang } from "@/i18n";

export default function LangSwitcher({ current }: { current: Lang }) {
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();

  async function switchLang(l: Lang) {
    if (l === current) return;
    await fetch("/api/profile/language", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lang: l }),
    }).catch(() => {});
    router.refresh();
  }

  return (
    <div style={{ display: "flex", gap: "0.4rem" }}>
      {(["ru", "de"] as Lang[]).map((l) => (
        <button key={l} type="button" onClick={() => switchLang(l)} style={{
          padding: "0.3rem 0.8rem", borderRadius: "6px", fontSize: "0.8rem", fontWeight: 600,
          border: "1.5px solid", cursor: "pointer",
          background: current === l ? "var(--gold)" : "transparent",
          color: current === l ? "#fff" : "rgba(255,255,255,0.6)",
          borderColor: current === l ? "var(--gold)" : "rgba(255,255,255,0.3)",
        }}>{l.toUpperCase()}</button>
      ))}
    </div>
  );
}
