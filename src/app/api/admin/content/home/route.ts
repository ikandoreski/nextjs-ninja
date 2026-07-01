import { NextResponse } from "next/server";

import { getSupabaseAdminClient } from "@/lib/supabase-admin";
import { getSupabaseServerClient } from "@/lib/supabase-server";

type HomeContentPayload = {
  hero: {
    eyebrow: string;
    headingLine1: string;
    headingLine2: string;
    highlight: string;
    description: string;
    primaryCtaLabel: string;
    primaryCtaHref: string;
    secondaryCtaLabel: string;
    secondaryCtaHref: string;
  };
  seo: {
    metaTitle: string;
    metaDescription: string;
    canonicalUrl: string;
    ampUrl: string;
    ogTitle: string;
    ogDescription: string;
  };
};

async function requireUser() {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user;
}

async function ensurePageId(pageKey: string, title: string) {
  const supabase = getSupabaseAdminClient();
  const { data: existing, error: readError } = await supabase
    .from("pages")
    .select("id")
    .eq("page_key", pageKey)
    .maybeSingle();

  if (readError) {
    throw readError;
  }

  if (existing?.id) {
    return existing.id;
  }

  const { data, error } = await supabase
    .from("pages")
    .insert({ page_key: pageKey, title })
    .select("id")
    .single();

  if (error) {
    throw error;
  }

  return data.id;
}

async function savePageBlock(
  pageId: string,
  blockKey: string,
  content: HomeContentPayload["hero"]
) {
  const supabase = getSupabaseAdminClient();
  const { data: existing, error: readError } = await supabase
    .from("page_blocks")
    .select("id")
    .eq("page_id", pageId)
    .eq("block_key", blockKey)
    .maybeSingle();

  if (readError) {
    throw readError;
  }

  if (existing?.id) {
    const { error: updateError } = await supabase
      .from("page_blocks")
      .update({ content })
      .eq("id", existing.id);

    if (updateError) {
      throw updateError;
    }

    return;
  }

  const { error: insertError } = await supabase.from("page_blocks").insert({
    page_id: pageId,
    block_key: blockKey,
    content,
  });

  if (insertError) {
    throw insertError;
  }
}

async function savePageSeo(pageId: string, seo: HomeContentPayload["seo"]) {
  const supabase = getSupabaseAdminClient();
  const record = {
    page_id: pageId,
    meta_title: seo.metaTitle,
    meta_description: seo.metaDescription,
    canonical_url: seo.canonicalUrl,
    amp_url: seo.ampUrl,
    og_title: seo.ogTitle,
    og_description: seo.ogDescription,
  };

  const { data: existing, error: readError } = await supabase
    .from("page_seo")
    .select("id")
    .eq("page_id", pageId)
    .maybeSingle();

  if (readError) {
    throw readError;
  }

  if (existing?.id) {
    const { error: updateError } = await supabase
      .from("page_seo")
      .update(record)
      .eq("id", existing.id);

    if (updateError) {
      throw updateError;
    }

    return;
  }

  const { error: insertError } = await supabase.from("page_seo").insert(record);

  if (insertError) {
    throw insertError;
  }
}

export async function PUT(request: Request) {
  const user = await requireUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payload = (await request.json()) as HomeContentPayload;
  const pageId = await ensurePageId("home", "Homepage Ninja388");

  try {
    await savePageBlock(pageId, "hero", payload.hero);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Gagal menyimpan blok hero." },
      { status: 400 }
    );
  }

  try {
    await savePageSeo(pageId, payload.seo);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Gagal menyimpan SEO homepage." },
      { status: 400 }
    );
  }

  return NextResponse.json({ success: true });
}
