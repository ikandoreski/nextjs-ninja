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

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await requireUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const payload = (await request.json()) as BookingPayload;

  if (!payload.customerId || !payload.stationId || !payload.playDate || !payload.startTime) {
    return NextResponse.json(
      { error: "Pelanggan, station, tanggal, dan jam mulai wajib diisi." },
      { status: 400 }
    );
  }

  const supabase = getSupabaseAdminClient();
  const bookingStatus = payload.status ?? "booked";
  const { data: existingBooking, error: existingBookingError } = await supabase
    .from("rental_bookings")
    .select("station_id")
    .eq("id", id)
    .single();

  if (existingBookingError) {
    return NextResponse.json({ error: existingBookingError.message }, { status: 400 });
  }

  const { error } = await supabase
    .from("rental_bookings")
    .update({
      customer_id: payload.customerId,
      station_id: payload.stationId,
      queue_code: payload.queueCode?.trim(),
      play_date: payload.playDate,
      start_time: payload.startTime,
      duration_hours: Number(payload.durationHours ?? 2),
      status: bookingStatus,
      notes: payload.notes?.trim() || null,
    })
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  if (
    existingBooking?.station_id &&
    existingBooking.station_id !== payload.stationId
  ) {
    await supabase
      .from("ps_stations")
      .update({ status: "tersedia" })
      .eq("id", existingBooking.station_id);
  }

  await syncStationStatus(supabase, payload.stationId, bookingStatus);
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

  const { data: booking, error: bookingError } = await supabase
    .from("rental_bookings")
    .select("station_id")
    .eq("id", id)
    .single();

  if (bookingError) {
    return NextResponse.json({ error: bookingError.message }, { status: 400 });
  }

  const { error } = await supabase.from("rental_bookings").delete().eq("id", id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  if (booking?.station_id) {
    await supabase
      .from("ps_stations")
      .update({ status: "tersedia" })
      .eq("id", booking.station_id);
  }

  return NextResponse.json({ success: true });
}
