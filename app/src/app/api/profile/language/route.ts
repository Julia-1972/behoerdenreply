import { NextResponse } from "next/server";
import { createSupabaseServerClient, createSupabaseAdminClient } from "@/lib/supabase-server";

export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const lang = body?.lang;

  if (lang !== "ru" && lang !== "de") {
    return NextResponse.json({ error: "invalid_lang" }, { status: 400 });
  }

  await createSupabaseAdminClient()
    .from("profiles")
    .update({ language: lang })
    .eq("id", user.id);

  return NextResponse.json({ ok: true });
}
