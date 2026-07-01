import { NextResponse } from "next/server";

import { getSupabaseAdminClient } from "@/lib/supabase-admin";
import { getSupabaseServerClient } from "@/lib/supabase-server";

type ProductPayload = {
  categoryId?: string;
  name?: string;
  slug?: string;
  shortDescription?: string;
  description?: string;
  price?: number;
  stock?: number;
  sku?: string;
  mpn?: string;
  brand?: string;
  status?: "draft" | "active" | "out_of_stock" | "archived";
  featuredImageUrl?: string;
  seoTitle?: string;
  seoDescription?: string;
};

async function requireUser() {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user;
}

function normalizePayload(payload: ProductPayload) {
  return {
    category_id: payload.categoryId || null,
    name: payload.name?.trim() ?? "",
    slug: payload.slug?.trim() ?? "",
    short_description: payload.shortDescription?.trim() || null,
    description: payload.description?.trim() || null,
    price: Number(payload.price ?? 0),
    stock: Number(payload.stock ?? 0),
    sku: payload.sku?.trim() ?? "",
    mpn: payload.mpn?.trim() || null,
    brand: payload.brand?.trim() || null,
    status: payload.status ?? "draft",
    featured_image_url: payload.featuredImageUrl?.trim() || null,
    seo_title: payload.seoTitle?.trim() || null,
    seo_description: payload.seoDescription?.trim() || null,
  };
}

export async function POST(request: Request) {
  const user = await requireUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payload = (await request.json()) as ProductPayload;
  const dataToInsert = normalizePayload(payload);

  if (!dataToInsert.name || !dataToInsert.slug || !dataToInsert.sku) {
    return NextResponse.json(
      { error: "Nama, slug, dan SKU wajib diisi." },
      { status: 400 }
    );
  }

  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from("products")
    .insert(dataToInsert)
    .select("id")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ success: true, id: data.id });
}
