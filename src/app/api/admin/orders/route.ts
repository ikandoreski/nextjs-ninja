import { NextResponse } from "next/server";

import { getSupabaseAdminClient } from "@/lib/supabase-admin";
import { getSupabaseServerClient } from "@/lib/supabase-server";

type OrderPayload = {
  customerId?: string;
  orderCode?: string;
  totalAmount?: number;
  status?: "baru" | "diproses" | "dikirim" | "selesai" | "batal";
  notes?: string;
};

async function requireUser() {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user;
}

function generateOrderCode() {
  const randomNumber = String(Math.floor(Math.random() * 9999) + 1).padStart(4, "0");
  return `ORD-N388-${randomNumber}`;
}

export async function POST(request: Request) {
  const user = await requireUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payload = (await request.json()) as OrderPayload;
  if (!payload.customerId || !payload.totalAmount) {
    return NextResponse.json(
      { error: "Pelanggan dan total order wajib diisi." },
      { status: 400 }
    );
  }

  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from("orders")
    .insert({
      customer_id: payload.customerId,
      order_code: payload.orderCode?.trim() || generateOrderCode(),
      total_amount: Number(payload.totalAmount),
      status: payload.status ?? "baru",
      notes: payload.notes?.trim() || null,
    })
    .select("id")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ success: true, id: data.id });
}
