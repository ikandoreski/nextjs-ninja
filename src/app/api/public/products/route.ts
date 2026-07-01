import { NextResponse } from "next/server";

import { getSupabaseAdminClient } from "@/lib/supabase-admin";

export async function GET() {
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from("products")
    .select(
      "id, category_id, name, slug, short_description, description, price, stock, sku, mpn, brand, status, featured_image_url, seo_title, seo_description"
    )
    .eq("status", "active")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json(
      { error: "Gagal mengambil produk publik." },
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
