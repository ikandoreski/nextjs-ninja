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

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await requireUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
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
  const { error } = await supabase
    .from("ps_stations")
    .update({
      code,
      name,
      status: payload.status ?? "tersedia",
      notes: payload.notes?.trim() || null,
    })
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await requireUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const supabase = getSupabaseAdminClient();
  const { count, error: bookingError } = await supabase
    .from("rental_bookings")
    .select("*", { count: "exact", head: true })
    .eq("station_id", id)
    .in("status", ["booked", "check_in"]);

  if (bookingError) {
    return NextResponse.json({ error: bookingError.message }, { status: 400 });
  }

  if ((count ?? 0) > 0) {
    return NextResponse.json(
      { error: "Station masih dipakai booking aktif dan belum bisa dihapus." },
      { status: 400 }
    );
  }

  const { error } = await supabase.from("ps_stations").delete().eq("id", id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}
