import { NextResponse } from "next/server";

import { getSupabaseAdminClient } from "@/lib/supabase-admin";
import { getSupabaseServerClient } from "@/lib/supabase-server";

type BookingPayload = {
  customerId?: string;
  stationId?: string;
  queueCode?: string;
  playDate?: string;
  startTime?: string;
  durationHours?: number;
  status?: "booked" | "check_in" | "selesai" | "batal";
  notes?: string;
};

async function requireUser() {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user;
}

function generateQueueCode() {
  const randomGroup = String.fromCharCode(65 + Math.floor(Math.random() * 26));
  const randomNumber = String(Math.floor(Math.random() * 99) + 1).padStart(2, "0");
  return `N388-${randomGroup}${randomNumber}`;
}

async function syncStationStatus(
  supabase: ReturnType<typeof getSupabaseAdminClient>,
  stationId: string,
  bookingStatus: string
) {
  const stationStatus =
    bookingStatus === "check_in"
      ? "dipakai"
      : bookingStatus === "booked"
        ? "full"
        : "tersedia";

  await supabase.from("ps_stations").update({ status: stationStatus }).eq("id", stationId);
}

export async function POST(request: Request) {
  const user = await requireUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payload = (await request.json()) as BookingPayload;

  if (!payload.customerId || !payload.stationId || !payload.playDate || !payload.startTime) {
    return NextResponse.json(
      { error: "Pelanggan, station, tanggal, dan jam mulai wajib diisi." },
      { status: 400 }
    );
  }

  const supabase = getSupabaseAdminClient();
  const queueCode = payload.queueCode?.trim() || generateQueueCode();
  const durationHours = Number(payload.durationHours ?? 2);
  const bookingStatus = payload.status ?? "booked";

  const { data, error } = await supabase
    .from("rental_bookings")
    .insert({
      customer_id: payload.customerId,
      station_id: payload.stationId,
      queue_code: queueCode,
      play_date: payload.playDate,
      start_time: payload.startTime,
      duration_hours: durationHours,
      status: bookingStatus,
      notes: payload.notes?.trim() || null,
    })
    .select("id")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  await syncStationStatus(supabase, payload.stationId, bookingStatus);
  return NextResponse.json({ success: true, id: data.id });
}
