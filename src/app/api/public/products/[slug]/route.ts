import { NextResponse } from "next/server";

import { getSupabaseAdminClient } from "@/lib/supabase-admin";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from("published_products")
    .select(
      "product_id, category_id, name, slug, short_description, description, price, stock, sku, mpn, brand, status, featured_image_url, seo_title, seo_description"
    )
    .eq("slug", slug)
    .eq("status", "active")
    .single();

  if (error) {
    return NextResponse.json(
      { error: "Produk tidak ditemukan." },
      {
        status: 404,
        headers: {
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  }

  return NextResponse.json(
    {
      id: data.product_id,
      category_id: data.category_id,
      name: data.name,
      slug: data.slug,
      short_description: data.short_description,
      description: data.description,
      price: data.price,
      stock: data.stock,
      sku: data.sku,
      mpn: data.mpn,
      brand: data.brand,
      status: data.status,
      featured_image_url: data.featured_image_url,
      seo_title: data.seo_title,
      seo_description: data.seo_description,
    },
    {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "no-store",
      },
    },
  );
}
