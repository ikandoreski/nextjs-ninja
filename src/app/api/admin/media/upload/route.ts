import { randomUUID } from "crypto";
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

function sanitizeFilename(value: string) {
  return value
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-zA-Z0-9._-]/g, "");
}

async function ensureMediaBucket() {
  const supabaseAdmin = getSupabaseAdminClient();
  const { data: buckets, error: listError } = await supabaseAdmin.storage.listBuckets();

  if (listError) {
    throw new Error(`Gagal membaca bucket Supabase: ${listError.message}`);
  }

  const bucketExists = buckets.some((bucket) => bucket.name === MEDIA_BUCKET);
  if (!bucketExists) {
    const { error: createError } = await supabaseAdmin.storage.createBucket(MEDIA_BUCKET, {
      public: true,
      fileSizeLimit: 10 * 1024 * 1024,
    });

    if (createError && !/already exists/i.test(createError.message)) {
      throw new Error(`Gagal membuat bucket media Supabase: ${createError.message}`);
    }
  }

  return supabaseAdmin;
}

export async function POST(request: Request) {
  try {
    const user = await requireUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const form = await request.formData();
    const file = form.get("file");

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: "File tidak ditemukan." }, { status: 400 });
    }

    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "Hanya file gambar yang diperbolehkan." },
        { status: 400 }
      );
    }

    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: "Ukuran gambar maksimal 10MB." },
        { status: 400 }
      );
    }

    const supabaseAdmin = await ensureMediaBucket();
    const now = new Date();
    const year = String(now.getUTCFullYear());
    const month = String(now.getUTCMonth() + 1).padStart(2, "0");
    const originalName = sanitizeFilename(file.name || "upload");
    const objectPath = `uploads/${year}/${month}/${randomUUID()}-${originalName}`;

    const buffer = Buffer.from(await file.arrayBuffer());
    const { error: uploadError } = await supabaseAdmin.storage.from(MEDIA_BUCKET).upload(objectPath, buffer, {
      contentType: file.type,
      upsert: false,
    });

    if (uploadError) {
      throw new Error(`Gagal upload ke Supabase Storage: ${uploadError.message}`);
    }

    const {
      data: { publicUrl },
    } = supabaseAdmin.storage.from(MEDIA_BUCKET).getPublicUrl(objectPath);

    return NextResponse.json({
      path: objectPath,
      url: publicUrl,
      contentType: file.type,
      size: file.size,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Gagal upload gambar." },
      { status: 500 }
    );
  }
}
