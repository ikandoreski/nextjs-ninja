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
  indexNowEnabled: boolean;
  indexNowKey: string;
  customHeadScripts: string;
  customFooterScripts: string;
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

async function saveBusinessBlock(pageId: string, payload: BusinessSettingsPayload) {
  const supabase = getSupabaseAdminClient();
  const { data: existing, error: readError } = await supabase
    .from("page_blocks")
    .select("id")
    .eq("page_id", pageId)
    .eq("block_key", "business")
    .maybeSingle();

  if (readError) {
    throw readError;
  }

  if (existing?.id) {
    const { error: updateError } = await supabase
      .from("page_blocks")
      .update({ content: payload })
      .eq("id", existing.id);

    if (updateError) {
      throw updateError;
    }

    return;
  }

  const { error: insertError } = await supabase.from("page_blocks").insert({
    page_id: pageId,
    block_key: "business",
    content: payload,
  });

  if (insertError) {
    throw insertError;
  }
}

export async function PUT(request: Request) {
  const user = await requireUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payload = (await request.json()) as BusinessSettingsPayload;
  const pageId = await ensurePageId("global-settings", "Global Settings");

  try {
    await saveBusinessBlock(pageId, payload);
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Gagal menyimpan pengaturan bisnis.",
      },
      { status: 400 }
    );
  }

  return NextResponse.json({ success: true });
}
