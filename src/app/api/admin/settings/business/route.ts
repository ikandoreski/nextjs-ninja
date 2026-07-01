import { NextResponse } from "next/server";

import { getSupabaseAdminClient } from "@/lib/supabase-admin";
import { getSupabaseServerClient } from "@/lib/supabase-server";

type BusinessSettingsPayload = {
  brandName: string;
  domainUrl: string;
  ampUrl: string;
  whatsappNumber: string;
  phoneDisplay: string;
  addressLines: string;
  mapsUrl: string;
  instagramUrl: string;
  facebookUrl: string;
  tiktokUrl: string;
  youtubeUrl: string;
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

  const payload = (await request.json()) as BusinessSettingsPayload;
  const supabase = getSupabaseAdminClient();
  const pageId = await ensurePageId("global-settings", "Global Settings");

  const { error } = await supabase.from("page_blocks").upsert(
    {
      page_id: pageId,
      block_key: "business",
      content: payload,
    },
    { onConflict: "page_id,block_key" }
  );

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}
