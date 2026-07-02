import { NextResponse } from "next/server";

import { getSupabaseAdminClient } from "@/lib/supabase-admin";
import { getSupabaseServerClient } from "@/lib/supabase-server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MEDIA_BUCKET = process.env.SUPABASE_MEDIA_BUCKET || "media";

async function requireUser() {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user;
}

export async function DELETE(request: Request) {
  try {
    const user = await requireUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = (await request.json()) as { path?: string };
    const targetPath = String(payload.path ?? "").trim();

    if (!targetPath) {
      return NextResponse.json({ error: "Path media wajib diisi." }, { status: 400 });
    }

    const supabaseAdmin = getSupabaseAdminClient();
    const { error } = await supabaseAdmin.storage.from(MEDIA_BUCKET).remove([targetPath]);

    if (error) {
      return NextResponse.json(
        { error: `Gagal menghapus media: ${error.message}` },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true, path: targetPath });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Gagal menghapus media." },
      { status: 500 }
    );
  }
}
