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

export async function PUT(request: Request) {
  const user = await requireUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payload = (await request.json()) as HomeContentPayload;
  const supabase = getSupabaseAdminClient();
  const pageId = await ensurePageId("home", "Homepage Ninja388");

  const { error: blockError } = await supabase.from("page_blocks").upsert(
    {
      page_id: pageId,
      block_key: "hero",
      content: payload.hero,
    },
    {
      onConflict: "page_id,block_key",
    }
  );

  if (blockError) {
    return NextResponse.json({ error: blockError.message }, { status: 400 });
  }

  const { error: seoError } = await supabase.from("page_seo").upsert(
    {
      page_id: pageId,
      meta_title: payload.seo.metaTitle,
      meta_description: payload.seo.metaDescription,
      canonical_url: payload.seo.canonicalUrl,
      amp_url: payload.seo.ampUrl,
      og_title: payload.seo.ogTitle,
      og_description: payload.seo.ogDescription,
    },
    {
      onConflict: "page_id",
    }
  );

  if (seoError) {
    return NextResponse.json({ error: seoError.message }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}
