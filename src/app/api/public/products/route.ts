import { NextResponse } from "next/server";

import { getSupabaseAdminClient } from "@/lib/supabase-admin";

export async function GET() {
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from("published_products")
    .select(
      "product_id, category_id, name, slug, short_description, description, price, stock, sku, mpn, brand, status, featured_image_url, seo_title, seo_description"
    )
    .eq("status", "active")
    .order("published_at", { ascending: false });

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

  const products = (data ?? []).map((product) => ({
    id: product.product_id,
    category_id: product.category_id,
    name: product.name,
    slug: product.slug,
    short_description: product.short_description,
    description: product.description,
    price: product.price,
    stock: product.stock,
    sku: product.sku,
    mpn: product.mpn,
    brand: product.brand,
    status: product.status,
    featured_image_url: product.featured_image_url,
    seo_title: product.seo_title,
    seo_description: product.seo_description,
  }));

  return NextResponse.json(products, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Cache-Control": "no-store",
    },
  });
}
