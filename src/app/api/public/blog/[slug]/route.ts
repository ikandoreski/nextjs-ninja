import { NextResponse } from "next/server";

import { getSupabaseAdminClient } from "@/lib/supabase-admin";

export async function GET(
  _request: Request,
  context: { params: Promise<{ slug: string }> }
) {
  const params = await context.params;
  const slug = params.slug;

  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from("published_blog_posts")
    .select("slug, title, excerpt, content_markdown, thumbnail_url, published_at, updated_at")
    .eq("slug", slug)
    .maybeSingle();

  if (error) {
    return NextResponse.json(
      { error: "Gagal mengambil artikel publik." },
      {
        status: 500,
        headers: {
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  }

  if (!data) {
    return NextResponse.json(
      { error: "Artikel tidak ditemukan." },
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
      slug: data.slug,
      title: data.title,
      excerpt: data.excerpt,
      content_markdown: data.content_markdown,
      thumbnail_url: data.thumbnail_url,
      published_at: data.published_at,
      updated_at: data.updated_at,
    },
    {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "no-store",
      },
    }
  );
}

