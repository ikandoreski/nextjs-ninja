import { NextResponse } from "next/server";

import { getSupabaseAdminClient } from "@/lib/supabase-admin";

export async function GET() {
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from("page_publications")
    .select("payload")
    .eq("page_key", "global-settings")
    .maybeSingle();

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

  const payload = data?.payload;
  const reviews = payload && typeof payload === "object" && Array.isArray(payload.reviews)
    ? payload.reviews
    : [];

  return NextResponse.json(reviews, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Cache-Control": "no-store",
    },
  });
}
