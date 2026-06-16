import { NextResponse } from "next/server";
import { createSupabaseServerClient, createSupabaseAdminClient } from "@/lib/supabase-server";

const PRICES = {
  payperuse: 3.99,
  subscription: 9.99,
} as const;

type UpgradePlan = keyof typeof PRICES;

export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const plan: UpgradePlan = body?.plan;

  if (plan !== "payperuse" && plan !== "subscription") {
    return NextResponse.json({ error: "invalid_plan" }, { status: 400 });
  }

  const profileUpdate: Record<string, unknown> = { plan };
  if (plan === "subscription") {
    profileUpdate.subscription_active = true;
    profileUpdate.subscription_period_start = new Date().toISOString().slice(0, 10);
  }

  const admin = createSupabaseAdminClient();
  await admin.from("profiles").update(profileUpdate).eq("id", user.id);

  await supabase.from("payments").insert({
    user_id: user.id,
    amount: PRICES[plan],
    type: plan === "subscription" ? "subscription" : "per_document",
  });

  return NextResponse.json({ plan });
}
