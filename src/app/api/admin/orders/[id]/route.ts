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

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await requireUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payload = (await request.json()) as OrderPayload;
  if (!payload.customerId || !payload.totalAmount || !payload.orderCode?.trim()) {
    return NextResponse.json(
      { error: "Pelanggan, kode order, dan total order wajib diisi." },
      { status: 400 }
    );
  }

  const { id } = await params;
  const supabase = getSupabaseAdminClient();
  const { error } = await supabase
    .from("orders")
    .update({
      customer_id: payload.customerId,
      order_code: payload.orderCode.trim(),
      total_amount: Number(payload.totalAmount),
      status: payload.status ?? "baru",
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
  const { error } = await supabase.from("orders").delete().eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}
