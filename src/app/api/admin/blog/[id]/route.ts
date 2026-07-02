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

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const user = await requireUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const params = await context.params;
  const postId = params.id;

  const payload = (await request.json()) as BlogPayload;
  const dataToUpdate = normalizePayload(payload);

  if (!dataToUpdate.title || !dataToUpdate.slug) {
    return NextResponse.json(
      { error: "Judul dan slug wajib diisi." },
      { status: 400 }
    );
  }

  const supabase = getSupabaseAdminClient();
  const { error } = await supabase.from("blog_posts").update(dataToUpdate).eq("id", postId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const user = await requireUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const params = await context.params;
  const postId = params.id;

  const supabase = getSupabaseAdminClient();
  const [{ error: postDeleteError }, { error: publishedDeleteError }] = await Promise.all([
    supabase.from("blog_posts").delete().eq("id", postId),
    supabase.from("published_blog_posts").delete().eq("post_id", postId),
  ]);

  if (postDeleteError || publishedDeleteError) {
    return NextResponse.json(
      { error: postDeleteError?.message ?? publishedDeleteError?.message ?? "Gagal menghapus artikel." },
      { status: 400 }
    );
  }

  return NextResponse.json({ success: true });
}
