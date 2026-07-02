import { NextResponse } from "next/server";

import { getSupabaseAdminClient } from "@/lib/supabase-admin";
import { getSupabaseServerClient } from "@/lib/supabase-server";

type BlogPayload = {
  title?: string;
  slug?: string;
  excerpt?: string;
  contentMarkdown?: string;
  thumbnailUrl?: string;
  status?: "draft" | "published" | "archived";
};

async function requireUser() {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user;
}

function normalizePayload(payload: BlogPayload) {
  return {
    title: payload.title?.trim() ?? "",
    slug: payload.slug?.trim() ?? "",
    excerpt: payload.excerpt?.trim() || null,
    content_markdown: payload.contentMarkdown ?? "",
    thumbnail_url: payload.thumbnailUrl?.trim() || null,
    status: payload.status ?? "draft",
    updated_at: new Date().toISOString(),
  };
}

export async function POST(request: Request) {
  const user = await requireUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payload = (await request.json()) as BlogPayload;
  const dataToInsert = normalizePayload(payload);

  if (!dataToInsert.title || !dataToInsert.slug) {
    return NextResponse.json(
      { error: "Judul dan slug wajib diisi." },
      { status: 400 }
    );
  }

  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from("blog_posts")
    .insert({
      ...dataToInsert,
      created_at: new Date().toISOString(),
    })
    .select("id")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ success: true, id: data.id });
}

