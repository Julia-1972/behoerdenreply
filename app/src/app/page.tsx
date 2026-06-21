"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { dictionaries, type Lang } from "@/i18n";

const NAV: React.CSSProperties = {
  background: "linear-gradient(90deg, #1E1133 0%, #261245 55%, #1E1133 100%)",
  height: "64px", padding: "0 2.5rem",
  display: "flex", alignItems: "center", justifyContent: "space-between",
  position: "sticky", top: 0, zIndex: 100,
  boxShadow: "0 8px 32px rgba(30,17,51,0.28)",
};

export default function Home() {
  const [lang, setLang] = useState<Lang>("de");

  useEffect(() => {
    const saved = localStorage.getItem("lang") as Lang | null;
    if (saved === "ru" || saved === "de") setLang(saved);
  }, []);

  function switchLang(l: Lang) {
    setLang(l);
    localStorage.setItem("lang", l);
  }

  const t = dictionaries[lang];

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "var(--sand)" }}>

      {/* NAV */}
      <nav style={NAV}>
        <span style={{ fontFamily: "var(--font-sans)", fontWeight: 800, fontSize: "1.5rem", color: "#fff" }}>
          Behörden<span style={{ color: "var(--gold)" }}>Reply</span>
        </span>
        <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
          <div style={{ display: "flex", gap: "0.4rem" }}>
            {(["ru", "de"] as Lang[]).map((l) => (
              <button key={l} type="button" onClick={() => switchLang(l)} style={{
                padding: "0.3rem 0.8rem", borderRadius: "6px", fontSize: "0.9rem", fontWeight: 600,
                border: "1.5px solid", cursor: "pointer",
                background: lang === l ? "var(--gold)" : "transparent",
                color: lang === l ? "#fff" : "rgba(255,255,255,0.6)",
                borderColor: lang === l ? "var(--gold)" : "rgba(255,255,255,0.3)",
              }}>{l.toUpperCase()}</button>
            ))}
          </div>
          <Link href="/login" className="btn-gold">{t.navLogin}</Link>
        </div>
      </nav>

      {/* HERO */}
      <section style={{ background: "linear-gradient(90deg, #FFF9F2 0%, #FAF6F0 42%, #F4E9DA 100%)", overflow: "hidden", display: "grid", gridTemplateColumns: "46fr 54fr", minHeight: "calc(100vh - 64px)" }}>
          <div style={{ padding: "28px 16px 28px 48px", display: "flex", alignItems: "center" }}><div style={{ width: "100%", textAlign: "center" }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "var(--lavender)", border: "1px solid var(--violet-pale)", borderRadius: "6px", padding: "5px 14px", marginBottom: "12px" }}>
              <div style={{ width: "7px", height: "7px", background: "var(--violet-mid)", borderRadius: "50%" }} />
              <span style={{ fontSize: "15px", fontWeight: 700, color: "var(--violet)", letterSpacing: "0.1em", textTransform: "uppercase" }}>{t.heroBadge}</span>
            </div>
            <h1 style={{ fontFamily: "var(--font-sans)", fontSize: "clamp(2.4rem, 4.5vw, 3.4rem)", color: "var(--violet)", lineHeight: 1.15, marginBottom: "0.85rem", textAlign: "center" }}>
              {t.heroTitle.split("\n").map((line, i) => <React.Fragment key={i}>{i > 0 && <br />}{line}</React.Fragment>)}
            </h1>
            <p style={{ color: "#555", fontSize: "1.35rem", lineHeight: 1.5, marginBottom: "1.25rem", textAlign: "center" }}>
              {t.heroSubtitle}
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px", marginBottom: "1.5rem" }}>
              {[["1", t.heroStep1],["2", t.heroStep2],["3", t.heroStep3]].map(([n,text]) => (
                <div key={n} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "12px 14px", background: "#F6F1FB", borderRadius: "10px", border: "1px solid rgba(123,94,167,0.15)", fontSize: "1.1rem", fontWeight: 500, color: "#333" }}>
                  <div style={{ width: "30px", height: "30px", minWidth: "30px", background: "var(--violet)", borderRadius: "6px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "15px", fontWeight: 700, color: "#fff" }}>{n}</div>
                  {text}
                </div>
              ))}
            </div>
            <Link href="/login" className="btn-violet" style={{ fontSize: "1.2rem", marginBottom: "10px", display: "inline-flex", padding: "0.85rem 2.4rem" }}>
              {t.heroCta}
            </Link>
            <p style={{ fontSize: "1.1rem", color: "#999", marginBottom: "14px" }}>{t.heroFree}</p>
            <div style={{ display: "flex", gap: "1.25rem", flexWrap: "wrap", justifyContent: "center" }}>
              {[t.heroTrust1, t.heroTrust2, t.heroTrust3].map(txt => (
                <span key={txt} style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "1.1rem", color: "#555", fontWeight: 500 }}>
                  <span style={{ color: "var(--violet-mid)", fontWeight: 700 }}>✓</span> {txt}
                </span>
              ))}
            </div>
          </div></div>

          {/* Right — photo */}
          <div style={{ position: "relative", overflow: "hidden" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/hero.png"
              alt="Deutsche Behördenbriefe auf dem Schreibtisch"
              style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "90% 20%", display: "block", filter: "brightness(0.87) saturate(0.78)", position: "absolute", inset: 0 }}
            />
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to right, #FAF6F0 0%, rgba(250,246,240,0.6) 22%, rgba(250,246,240,0.15) 38%, transparent 55%)", zIndex: 1, pointerEvents: "none" }} />
            <div style={{ position: "absolute", inset: 0, background: "rgba(248,238,218,0.12)", zIndex: 1, pointerEvents: "none" }} />
          </div>
      </section>

      {/* HOW IT WORKS */}
      <section style={{ background: "var(--sand)", overflow: "hidden", display: "grid", gridTemplateColumns: "46fr 54fr", minHeight: "520px" }}>
          {/* Left — photo */}
          <div style={{ position: "relative", overflow: "hidden" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/ablauf.png"
              alt="Behördenbriefe und Notizen auf dem Schreibtisch"
              style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center center", display: "block", filter: "brightness(0.88) saturate(0.8)", position: "absolute", inset: 0 }}
            />
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to left, var(--sand) 0%, rgba(245,240,232,0.6) 22%, rgba(245,240,232,0.15) 38%, transparent 55%)", zIndex: 1, pointerEvents: "none" }} />
            <div style={{ position: "absolute", inset: 0, background: "rgba(248,238,218,0.12)", zIndex: 1, pointerEvents: "none" }} />
          </div>

          {/* Right — content */}
          <div style={{ padding: "3.5rem 48px 3.5rem 32px", display: "flex", alignItems: "center" }}>
            <div style={{ width: "100%" }}>
              <div className="section-label">{t.sectionHowLabel}</div>
              <h2 style={{ fontFamily: "var(--font-sans)", fontSize: "2.2rem", color: "var(--violet)", marginBottom: "2rem" }}>{t.sectionHowTitle}</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                {[
                  {n:"1",title:t.howStep1Title,text:t.howStep1Text},
                  {n:"2",title:t.howStep2Title,text:t.howStep2Text},
                  {n:"3",title:t.howStep3Title,text:t.howStep3Text},
                ].map(s => (
                  <div key={s.n} style={{ background: "#fff", borderRadius: "14px", padding: "1.5rem 1.75rem", border: "1px solid var(--border)", boxShadow: "0 2px 12px rgba(76,29,149,0.06)", display: "flex", gap: "1.25rem", alignItems: "flex-start" }}>
                    <div style={{ width: "2.5rem", height: "2.5rem", minWidth: "2.5rem", background: "linear-gradient(135deg,#4C1D95,#6B46C1)", color: "#fff", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: "1rem", boxShadow: "0 4px 12px rgba(76,29,149,0.25)" }}>{s.n}</div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: "1.1rem", marginBottom: "0.3rem", color: "var(--plum)" }}>{s.title}</div>
                      <div style={{ color: "var(--fg-muted)", fontSize: "1rem", lineHeight: 1.65 }}>{s.text}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
      </section>

      {/* PRICING */}
      <section style={{ padding: "4rem 2.5rem", background: "#fff" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          <div className="section-label">{t.sectionPricingLabel}</div>
          <h2 style={{ fontFamily: "var(--font-sans)", fontSize: "2.2rem", color: "var(--violet)", marginBottom: "2rem" }}>{t.sectionPricingTitle}</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "1.5rem", alignItems: "start" }}>
            {[
              {label:t.priceFreeLabel,price:t.priceFreePrice,desc:t.priceFreeDesc,features:[t.priceFreeFeat1,t.priceFreeFeat2,t.priceFreeFeat3],hot:false,badge:""},
              {label:t.priceSingleLabel,price:t.priceSinglePrice,desc:t.priceSingleDesc,features:[t.priceSingleFeat1,t.priceSingleFeat2,t.priceSingleFeat3],hot:true,badge:t.priceSingleBadge},
              {label:t.priceSubLabel,price:t.priceSubPrice,desc:t.priceSubDesc,features:[t.priceSubFeat1,t.priceSubFeat2,t.priceSubFeat3],hot:false,badge:""},
            ].map(p => (
              <div key={p.label} style={{ background: p.hot ? "linear-gradient(135deg,#4C1D95,#3D2578)" : "#fff", color: p.hot ? "#fff" : "var(--fg)", borderRadius: "16px", padding: "2rem", border: p.hot ? "none" : "1px solid var(--border)", boxShadow: p.hot ? "0 12px 40px rgba(76,29,149,0.28)" : "0 2px 12px rgba(0,0,0,0.05)", position: "relative" }}>
                {p.hot && <div style={{ position: "absolute", top: "-12px", left: "50%", transform: "translateX(-50%)", background: "var(--gold)", color: "#fff", borderRadius: "100px", padding: "0.2rem 1rem", fontSize: "0.85rem", fontWeight: 700, whiteSpace: "nowrap" }}>{p.badge}</div>}
                <div style={{ fontWeight: 700, fontSize: "0.9rem", opacity: 0.65, marginBottom: "0.25rem", textTransform: "uppercase", letterSpacing: "0.08em" }}>{p.label}</div>
                <div style={{ fontSize: "2.5rem", fontWeight: 800, marginBottom: "0.2rem", fontFamily: "var(--font-sans)" }}>{p.price}</div>
                <div style={{ fontSize: "1rem", opacity: 0.6, marginBottom: "1.25rem" }}>{p.desc}</div>
                <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "0.55rem" }}>
                  {p.features.map(f => (
                    <li key={f} style={{ display: "flex", gap: "8px", fontSize: "1rem", opacity: 0.85 }}>
                      <span style={{ color: p.hot ? "var(--gold)" : "var(--violet-mid)", fontWeight: 700 }}>✓</span>{f}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ background: "linear-gradient(135deg,#1E1133 0%,#261245 100%)", padding: "5rem 2.5rem", textAlign: "center" }}>
        <div style={{ maxWidth: "620px", margin: "0 auto" }}>
          <h2 style={{ fontFamily: "var(--font-sans)", color: "#fff", fontSize: "2.4rem", lineHeight: 1.2, marginBottom: "1rem" }}>
            {t.ctaTitle.split("\n").map((line, i) => <React.Fragment key={i}>{i > 0 && <br />}{line}</React.Fragment>)}
          </h2>
          <p style={{ color: "rgba(255,255,255,0.6)", marginBottom: "2rem", lineHeight: 1.7, fontSize: "1.15rem" }}>
            {t.ctaText}
          </p>
          <Link href="/login" className="btn-gold" style={{ fontSize: "1.15rem", padding: "0.9rem 2.4rem" }}>
            {t.ctaButton}
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ background: "#150D30", padding: "1.75rem 2.5rem", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
        <span style={{ fontWeight: 800, color: "#fff", fontSize: "1.25rem" }}>Behörden<span style={{ color: "var(--gold)" }}>Reply</span></span>
        <div style={{ display: "flex", gap: "1.5rem" }}>
          {[{label:"Impressum",href:"/impressum"},{label:"Datenschutz",href:"/datenschutz"},{label:"AGB",href:"/agb"}].map(l => (
            <Link key={l.label} href={l.href} style={{ color: "rgba(255,255,255,0.45)", textDecoration: "none", fontSize: "0.95rem" }}>{l.label}</Link>
          ))}
        </div>
        <span style={{ fontSize: "0.88rem", color: "rgba(255,255,255,0.3)" }}>© 2026 BehördenReply</span>
      </footer>
    </div>
  );
}
