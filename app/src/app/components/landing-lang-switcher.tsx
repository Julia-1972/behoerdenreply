"use client";

import { useState, useEffect } from "react";

type Lang = "ru" | "de";

export default function LandingLangSwitcher() {
  const [lang, setLang] = useState<Lang>("de");

  useEffect(() => {
    const saved = localStorage.getItem("lang") as Lang | null;
    if (saved === "ru" || saved === "de") setLang(saved);
  }, []);

  function switchLang(l: Lang) {
    setLang(l);
    localStorage.setItem("lang", l);
  }

  return (
    <div style={{ display: "flex", gap: "0.4rem" }}>
      {(["ru", "de"] as Lang[]).map((l) => (
        <button key={l} type="button" onClick={() => switchLang(l)} style={{
          padding: "0.3rem 0.8rem", borderRadius: "6px", fontSize: "0.8rem", fontWeight: 600,
          border: "1.5px solid", cursor: "pointer",
          background: lang === l ? "var(--gold)" : "transparent",
          color: lang === l ? "#fff" : "rgba(255,255,255,0.6)",
          borderColor: lang === l ? "var(--gold)" : "rgba(255,255,255,0.3)",
        }}>{l.toUpperCase()}</button>
      ))}
    </div>
  );
}
