"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";
import { dictionaries, type Lang } from "@/i18n";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();

  const [lang, setLang] = useState<Lang>("ru");
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const t = dictionaries[lang];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (mode === "login") {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }
      await fetch("/api/profile/language", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lang }),
      });
    } else {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });
      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }

      if (data.user) {
        await supabase.from("profiles").insert({
          id: data.user.id,
          language: lang,
        });
      }
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 p-6">
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setLang("ru")}
          className={`rounded px-3 py-1 text-sm ${
            lang === "ru" ? "bg-black text-white" : "bg-gray-200"
          }`}
        >
          RU
        </button>
        <button
          type="button"
          onClick={() => setLang("de")}
          className={`rounded px-3 py-1 text-sm ${
            lang === "de" ? "bg-black text-white" : "bg-gray-200"
          }`}
        >
          DE
        </button>
      </div>

      <form
        onSubmit={handleSubmit}
        className="flex w-full max-w-sm flex-col gap-4"
      >
        <h1 className="text-center text-xl font-semibold">
          {mode === "login" ? t.login : t.register}
        </h1>

        <input
          type="email"
          required
          placeholder={t.email}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="rounded border px-3 py-2"
        />

        <input
          type="password"
          required
          placeholder={t.password}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="rounded border px-3 py-2"
        />

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="rounded bg-black px-3 py-2 text-white disabled:opacity-50"
        >
          {mode === "login" ? t.loginButton : t.registerButton}
        </button>

        <button
          type="button"
          onClick={() => setMode(mode === "login" ? "register" : "login")}
          className="text-sm text-blue-600 underline"
        >
          {mode === "login" ? t.switchToRegister : t.switchToLogin}
        </button>
      </form>
    </div>
  );
}
