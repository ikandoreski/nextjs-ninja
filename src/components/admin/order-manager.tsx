"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { LoaderCircle, PackageCheck, Pencil, Plus, Save, Trash2, X } from "lucide-react";

type OrderRow = {
  id: string;
  customerId: string | null;
  code: string;
  customer: string;
  rawTotalAmount: number;
  rawStatus: "baru" | "diproses" | "dikirim" | "selesai" | "batal";
  notes: string;
  total: string;
  payment: string;
  shipping: string;
};

type CustomerOption = {
  id: string;
  full_name: string;
  phone: string;
};

type OrderFormState = {
  customerId: string;
  orderCode: string;
  totalAmount: string;
  status: "baru" | "diproses" | "dikirim" | "selesai" | "batal";
  notes: string;
};

const emptyForm: OrderFormState = {
  customerId: "",
  orderCode: "",
  totalAmount: "",
  status: "baru",
  notes: "",
};

type OrderManagerProps = {
  initialOrders: OrderRow[];
  customers: CustomerOption[];
};

export function OrderManager({ initialOrders, customers }: OrderManagerProps) {
  const router = useRouter();
  const [formState, setFormState] = useState<OrderFormState>(emptyForm);
  const [editingOrderId, setEditingOrderId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const ordersById = useMemo(
    () => new Map(initialOrders.map((item) => [item.id, item])),
    [initialOrders]
  );

  const isEditing = Boolean(editingOrderId);

  function resetForm() {
    setFormState(emptyForm);
    setEditingOrderId(null);
    setFeedback("");
    setErrorMessage("");
  }

  function updateField<K extends keyof OrderFormState>(
    key: K,
    value: OrderFormState[K]
  ) {
    setFormState((current) => ({
      ...current,
      [key]: value,
    }));
  }

  function fillForm(orderId: string) {
    const order = ordersById.get(orderId);
    if (!order) return;

    setFormState({
      customerId: order.customerId ?? "",
      orderCode: order.code,
      totalAmount: String(order.rawTotalAmount),
      status: order.rawStatus,
      notes: order.notes,
    });
    setEditingOrderId(orderId);
    setFeedback("");
    setErrorMessage("");
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setFeedback("");
    setErrorMessage("");

    try {
      const endpoint = editingOrderId
        ? `/api/admin/orders/${editingOrderId}`
        : "/api/admin/orders";
      const method = editingOrderId ? "PATCH" : "POST";

      const response = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formState,
          totalAmount: Number(formState.totalAmount || 0),
        }),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || "Gagal menyimpan order.");
      }

      setFeedback(
        editingOrderId
          ? "Order berhasil diperbarui."
          : "Order baru berhasil ditambahkan."
      );
      resetForm();
      router.refresh();
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Terjadi error saat menyimpan."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete(orderId: string) {
    const shouldDelete = window.confirm("Hapus order ini dari sistem?");
    if (!shouldDelete) return;

    setIsSubmitting(true);
    setFeedback("");
    setErrorMessage("");

    try {
      const response = await fetch(`/api/admin/orders/${orderId}`, {
        method: "DELETE",
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || "Gagal menghapus order.");
      }

      if (editingOrderId === orderId) {
        resetForm();
      }

      setFeedback("Order berhasil dihapus.");
      router.refresh();
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Terjadi error saat menghapus."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
      <section className="space-y-6">
        <section className="rounded-[28px] border border-white/10 bg-zinc-950/80 p-6 shadow-[0_24px_80px_rgba(0,0,0,0.22)]">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-red-300">
                CRUD Order
              </p>
              <h2 className="mt-2 text-2xl font-bold text-white">
                {isEditing ? "Edit Order" : "Tambah Order Baru"}
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-7 text-zinc-400">
                Kelola pesanan masuk, status pembayaran, dan progres pengiriman
                dari satu panel yang terhubung ke katalog.
              </p>
            </div>

            <button
              type="button"
              onClick={resetForm}
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-zinc-300 transition hover:bg-white/10"
            >
              {isEditing ? <X className="size-4" /> : <Plus className="size-4" />}
              {isEditing ? "Batal Edit" : "Reset Form"}
            </button>
          </div>

          <form className="mt-6 grid gap-4 lg:grid-cols-2" onSubmit={handleSubmit}>
            <label className="text-sm text-zinc-300">
              Pelanggan
              <select
                value={formState.customerId}
                onChange={(event) => updateField("customerId", event.target.value)}
                className="mt-2 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm outline-none"
              >
                <option value="">Pilih pelanggan</option>
                {customers.map((customer) => (
                  <option key={customer.id} value={customer.id}>
                    {customer.full_name} · {customer.phone}
                  </option>
                ))}
              </select>
            </label>

            <label className="text-sm text-zinc-300">
              Kode Order
              <input
                value={formState.orderCode}
                onChange={(event) => updateField("orderCode", event.target.value.toUpperCase())}
                className="mt-2 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm outline-none"
                placeholder="Kosongkan untuk auto generate"
              />
            </label>

            <label className="text-sm text-zinc-300">
              Total Order
              <input
                type="number"
                min="0"
                value={formState.totalAmount}
                onChange={(event) => updateField("totalAmount", event.target.value)}
                className="mt-2 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm outline-none"
                placeholder="9200000"
              />
            </label>

            <label className="text-sm text-zinc-300">
              Status
              <select
                value={formState.status}
                onChange={(event) =>
                  updateField("status", event.target.value as OrderFormState["status"])
                }
                className="mt-2 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm outline-none"
              >
                <option value="baru">Baru</option>
                <option value="diproses">Diproses</option>
                <option value="dikirim">Dikirim</option>
                <option value="selesai">Selesai</option>
                <option value="batal">Batal</option>
              </select>
            </label>

            <label className="text-sm text-zinc-300 lg:col-span-2">
              Catatan
              <textarea
                value={formState.notes}
                onChange={(event) => updateField("notes", event.target.value)}
                rows={3}
                className="mt-2 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm outline-none"
                placeholder="Catatan order"
              />
            </label>

            {feedback ? (
              <div className="rounded-2xl border border-green-400/20 bg-green-500/10 px-4 py-3 text-sm text-green-100 lg:col-span-2">
                {feedback}
              </div>
            ) : null}

            {errorMessage ? (
              <div className="rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-100 lg:col-span-2">
                {errorMessage}
              </div>
            ) : null}

            <div className="flex flex-wrap gap-3 lg:col-span-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center gap-2 rounded-full bg-red-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-red-400 disabled:cursor-not-allowed disabled:bg-zinc-700"
              >
                {isSubmitting ? (
                  <>
                    <LoaderCircle className="size-4 animate-spin" />
                    Memproses
                  </>
                ) : isEditing ? (
                  <>
                    <Save className="size-4" />
                    Simpan Perubahan
                  </>
                ) : (
                  <>
                    <Plus className="size-4" />
                    Tambah Order
                  </>
                )}
              </button>
            </div>
          </form>
        </section>

        <section className="rounded-[28px] border border-white/10 bg-zinc-950/80 p-6 shadow-[0_24px_80px_rgba(0,0,0,0.22)]">
          <div className="mt-0 overflow-hidden rounded-3xl border border-white/10">
            <table className="min-w-full divide-y divide-white/10 text-left text-sm">
              <thead className="bg-white/[0.04] text-zinc-400">
                <tr>
                  <th className="px-4 py-3 font-medium">Kode Order</th>
                  <th className="px-4 py-3 font-medium">Pelanggan</th>
                  <th className="px-4 py-3 font-medium">Total</th>
                  <th className="px-4 py-3 font-medium">Pembayaran</th>
                  <th className="px-4 py-3 font-medium">Pengiriman</th>
                  <th className="px-4 py-3 font-medium">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 bg-black/20">
                {initialOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-white/[0.03]">
                    <td className="px-4 py-4 font-medium text-white">{order.code}</td>
                    <td className="px-4 py-4 text-zinc-300">{order.customer}</td>
                    <td className="px-4 py-4 text-zinc-300">{order.total}</td>
                    <td className="px-4 py-4 text-amber-200">{order.payment}</td>
                    <td className="px-4 py-4 text-zinc-400">{order.shipping}</td>
                    <td className="px-4 py-4">
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => fillForm(order.id)}
                          className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 text-xs text-zinc-300 transition hover:bg-white/10"
                        >
                          <span className="inline-flex items-center gap-2">
                            <Pencil className="size-3.5" />
                            Edit
                          </span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(order.id)}
                          disabled={isSubmitting}
                          className="rounded-full border border-red-400/20 bg-red-500/10 px-3 py-2 text-xs text-red-100 transition hover:bg-red-500/20"
                        >
                          <span className="inline-flex items-center gap-2">
                            <Trash2 className="size-3.5" />
                            Hapus
                          </span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </section>

      <aside className="rounded-[28px] border border-white/10 bg-zinc-950/80 p-6 shadow-[0_24px_80px_rgba(0,0,0,0.22)]">
        <PackageCheck className="size-5 text-amber-300" />
        <h2 className="mt-4 text-xl font-bold">Proses Ideal</h2>
        <ol className="mt-4 space-y-3 text-sm leading-7 text-zinc-400">
          <li>Validasi stok produk sebelum konfirmasi order.</li>
          <li>Update status pembayaran oleh admin toko.</li>
          <li>Lanjutkan ke proses packing dan pengiriman.</li>
          <li>Simpan catatan order untuk riwayat pelanggan.</li>
        </ol>
      </aside>
    </div>
  );
}
