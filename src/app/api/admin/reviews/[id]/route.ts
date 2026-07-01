import { NextResponse } from "next/server";

import { getSupabaseAdminClient } from "@/lib/supabase-admin";
import { getSupabaseServerClient } from "@/lib/supabase-server";

type ReviewPayload = {
  reviewerName?: string;
  rating?: number;
  reviewBody?: string;
  ownerReply?: string;
  isFeatured?: boolean;
};

async function requireUser() {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user;
}

function normalizePayload(payload: ReviewPayload) {
  return {
    reviewer_name: payload.reviewerName?.trim() ?? "",
    rating: Number(payload.rating ?? 5),
    review_body: payload.reviewBody?.trim() ?? "",
    owner_reply: payload.ownerReply?.trim() || null,
    is_featured: Boolean(payload.isFeatured),
  };
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await requireUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const payload = (await request.json()) as ReviewPayload;
  const dataToUpdate = normalizePayload(payload);

  if (!dataToUpdate.reviewer_name || !dataToUpdate.review_body) {
    return NextResponse.json(
      { error: "Nama reviewer dan isi review wajib diisi." },
      { status: 400 }
    );
  }

  const supabase = getSupabaseAdminClient();
  const { error } = await supabase
    .from("business_reviews")
    .update(dataToUpdate)
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await requireUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const supabase = getSupabaseAdminClient();
  const { error } = await supabase.from("business_reviews").delete().eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}
