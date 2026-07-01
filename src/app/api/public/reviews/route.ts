import { NextResponse } from "next/server";

import { getSupabaseAdminClient } from "@/lib/supabase-admin";

export async function GET() {
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from("business_reviews")
    .select("reviewer_name, rating, review_body, owner_reply, is_featured, created_at")
    .order("created_at", { ascending: true });

  if (error) {
    return NextResponse.json(
      { error: "Gagal mengambil review publik." },
      {
        status: 500,
        headers: {
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  }

  return NextResponse.json(data ?? [], {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Cache-Control": "no-store",
    },
  });
}
