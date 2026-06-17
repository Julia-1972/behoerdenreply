import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const caseId = searchParams.get("id");
  if (!caseId) return NextResponse.json({ error: "no id" }, { status: 400 });

  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { data } = await supabase
    .from("cases")
    .select("analysis_summary")
    .eq("id", caseId)
    .eq("user_id", user.id)
    .single();

  return NextResponse.json({ analysis_summary: data?.analysis_summary ?? null });
}
