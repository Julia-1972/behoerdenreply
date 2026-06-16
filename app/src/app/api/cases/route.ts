import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";

const MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  // Free/paid gate
  const { data: profile } = await supabase
    .from("profiles")
    .select("plan, free_used, subscription_active")
    .eq("id", user.id)
    .single();

  if (profile?.free_used && profile.plan === "free") {
    return NextResponse.json({ error: "upgrade_required" }, { status: 402 });
  }

  // MVP Rule: only 1 active case at a time.
  const { data: activeCase } = await supabase
    .from("cases")
    .select("id")
    .eq("user_id", user.id)
    .not("status", "in", "(done,cancelled)")
    .maybeSingle();

  if (activeCase) {
    return NextResponse.json(
      { error: "active_case_exists", caseId: activeCase.id },
      { status: 409 }
    );
  }

  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "no_file" }, { status: 400 });
  }

  // MVP Rule: only PDF, max 10MB, no JPG/PNG.
  if (file.type !== "application/pdf") {
    return NextResponse.json({ error: "invalid_type" }, { status: 400 });
  }

  if (file.size > MAX_SIZE_BYTES) {
    return NextResponse.json({ error: "file_too_large" }, { status: 400 });
  }

  const caseId = crypto.randomUUID();
  const storagePath = `${user.id}/${caseId}/original.pdf`;

  const { error: uploadError } = await supabase.storage
    .from("uploads")
    .upload(storagePath, file, {
      contentType: "application/pdf",
      upsert: false,
    });

  if (uploadError) {
    return NextResponse.json({ error: "upload_failed" }, { status: 500 });
  }

  const { error: insertError } = await supabase.from("cases").insert({
    id: caseId,
    user_id: user.id,
    status: "uploaded",
    original_pdf_path: storagePath,
  });

  if (insertError) {
    await supabase.storage.from("uploads").remove([storagePath]);
    return NextResponse.json({ error: "case_create_failed" }, { status: 500 });
  }

  if (profile?.plan === "payperuse") {
    await supabase.from("payments").insert({
      user_id: user.id,
      case_id: caseId,
      amount: 3.99,
      type: "per_document",
    });
  }

  return NextResponse.json({ caseId });
}
