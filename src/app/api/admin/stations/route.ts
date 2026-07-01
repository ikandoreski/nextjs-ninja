import { NextResponse } from "next/server";

import { getSupabaseAdminClient } from "@/lib/supabase-admin";
import { getSupabaseServerClient } from "@/lib/supabase-server";

type StationPayload = {
  code?: string;
  name?: string;
  status?: "tersedia" | "dipakai" | "maintenance" | "full";
  notes?: string;
};

async function requireUser() {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user;
}

export async function POST(request: Request) {
  const user = await requireUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payload = (await request.json()) as StationPayload;
  const code = payload.code?.trim() ?? "";
  const name = payload.name?.trim() ?? "";

  if (!code || !name) {
    return NextResponse.json(
      { error: "Kode station dan nama station wajib diisi." },
      { status: 400 }
    );
  }

  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from("ps_stations")
    .insert({
      code,
      name,
      status: payload.status ?? "tersedia",
      notes: payload.notes?.trim() || null,
    })
    .select("id")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ success: true, id: data.id });
}
