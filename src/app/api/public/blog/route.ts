import { NextResponse } from "next/server";

import { getSupabaseAdminClient } from "@/lib/supabase-admin";

export async function GET() {
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from("published_blog_posts")
    .select("slug, title, excerpt, thumbnail_url, published_at, updated_at")
    .order("published_at", { ascending: false });

  if (error) {
    return NextResponse.json(
      { error: "Gagal mengambil blog publik." },
      {
        status: 500,
        headers: {
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  }

  const posts = (data ?? []).map((post) => ({
    slug: post.slug,
    title: post.title,
    excerpt: post.excerpt,
    thumbnail_url: post.thumbnail_url,
    published_at: post.published_at,
    updated_at: post.updated_at,
  }));

  return NextResponse.json(posts, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Cache-Control": "no-store",
    },
  });
}

