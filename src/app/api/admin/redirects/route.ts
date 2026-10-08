import { NextResponse } from "next/server";

import { getSupabaseAdminClient } from "@/lib/supabase-admin";
import { getSupabaseServerClient } from "@/lib/supabase-server";

type RedirectPayload = {
  source?: string;
  destination?: string;
  type?: "301" | "302";
  active?: boolean;
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

  const payload = (await request.json()) as RedirectPayload;
  const source = payload.source?.trim() ?? "";
  const destination = payload.destination?.trim() ?? "";

  if (!source || !destination) {
    return NextResponse.json(
      { error: "Source dan destination redirect wajib diisi." },
      { status: 400 }
    );
  }

  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from("redirect_rules")
    .insert({
      source,
      destination,
      type: payload.type ?? "301",
      active: payload.active ?? true,
    })
    .select("id")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ success: true, id: data.id });
}
