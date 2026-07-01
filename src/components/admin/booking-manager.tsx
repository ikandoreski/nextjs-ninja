"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CalendarRange,
  CircleGauge,
  LoaderCircle,
  Pencil,
  Plus,
  Save,
  Trash2,
  X,
} from "lucide-react";

type BookingRow = {
  id: string;
  code: string;
  customerId: string | null;
  stationId: string | null;
  customer: string;
  station: string;
  playDate: string;
  startTime: string;
  durationHours: number;
  rawStatus: "booked" | "check_in" | "selesai" | "batal";
  notes: string;
  schedule: string;
  duration: string;
  status: string;
};

type CustomerOption = {
  id: string;
  full_name: string;
  phone: string;
};

type StationOption = {
  id: string;
  code: string;
  name: string;
  rawStatus: "tersedia" | "dipakai" | "maintenance" | "full";
  status: string;
};

type BookingFormState = {
  customerId: string;
  stationId: string;
  queueCode: string;
  playDate: string;
  startTime: string;
  durationHours: string;
  status: "booked" | "check_in" | "selesai" | "batal";
  notes: string;
};

const emptyForm: BookingFormState = {
  customerId: "",
  stationId: "",
  queueCode: "",
  playDate: "",
  startTime: "19:00",
  durationHours: "2",
  status: "booked",
  notes: "",
};

type BookingManagerProps = {
  initialBookings: BookingRow[];
  customers: CustomerOption[];
  stations: StationOption[];
};

export function BookingManager({
  initialBookings,
  customers,
  stations,
}: BookingManagerProps) {
  const router = useRouter();
  const [formState, setFormState] = useState<BookingFormState>(emptyForm);
  const [editingBookingId, setEditingBookingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const bookingsById = useMemo(
    () => new Map(initialBookings.map((item) => [item.id, item])),
    [initialBookings]
  );

  const isEditing = Boolean(editingBookingId);

  function resetForm() {
    setFormState(emptyForm);
    setEditingBookingId(null);
    setFeedback("");
    setErrorMessage("");
  }

  function fillForm(bookingId: string) {
    const booking = bookingsById.get(bookingId);
    if (!booking) return;

    setFormState({
      customerId: booking.customerId ?? "",
      stationId: booking.stationId ?? "",
      queueCode: booking.code,
      playDate: booking.playDate,
      startTime: booking.startTime,
      durationHours: String(booking.durationHours),
      status: booking.rawStatus,
      notes: booking.notes,
    });
    setEditingBookingId(bookingId);
    setFeedback("");
    setErrorMessage("");
  }

  function updateField<K extends keyof BookingFormState>(
    key: K,
    value: BookingFormState[K]
  ) {
    setFormState((current) => ({
      ...current,
      [key]: value,
    }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setFeedback("");
    setErrorMessage("");

    try {
      const endpoint = editingBookingId
        ? `/api/admin/bookings/${editingBookingId}`
        : "/api/admin/bookings";
      const method = editingBookingId ? "PATCH" : "POST";

      const response = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formState,
          durationHours: Number(formState.durationHours || 2),
        }),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || "Gagal menyimpan booking.");
      }

      setFeedback(
        editingBookingId
          ? "Booking berhasil diperbarui."
          : "Booking manual berhasil ditambahkan."
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

  async function handleDelete(bookingId: string) {
    const shouldDelete = window.confirm(
      "Hapus booking ini? Station terkait akan dibebaskan kembali."
    );
    if (!shouldDelete) return;

    setIsSubmitting(true);
    setFeedback("");
    setErrorMessage("");

    try {
      const response = await fetch(`/api/admin/bookings/${bookingId}`, {
        method: "DELETE",
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || "Gagal menghapus booking.");
      }

      if (editingBookingId === bookingId) {
        resetForm();
      }

      setFeedback("Booking berhasil dihapus.");
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
                CRUD Booking
              </p>
              <h2 className="mt-2 text-2xl font-bold text-white">
                {isEditing ? "Edit Booking" : "Booking Manual Baru"}
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-7 text-zinc-400">
                Booking manual dari admin langsung tersimpan ke database dan
                mengubah status station sesuai alur operasional.
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
              Station
              <select
                value={formState.stationId}
                onChange={(event) => updateField("stationId", event.target.value)}
                className="mt-2 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm outline-none"
              >
                <option value="">Pilih station</option>
                {stations.map((station) => (
                  <option key={station.id} value={station.id}>
                    {station.name} · {station.status}
                  </option>
                ))}
              </select>
            </label>

            <label className="text-sm text-zinc-300">
              Queue Code
              <input
                value={formState.queueCode}
                onChange={(event) => updateField("queueCode", event.target.value.toUpperCase())}
                className="mt-2 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm outline-none"
                placeholder="Kosongkan untuk auto generate"
              />
            </label>

            <label className="text-sm text-zinc-300">
              Tanggal Main
              <input
                type="date"
                value={formState.playDate}
                onChange={(event) => updateField("playDate", event.target.value)}
                className="mt-2 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm outline-none"
              />
            </label>

            <label className="text-sm text-zinc-300">
              Jam Mulai
              <input
                type="time"
                value={formState.startTime}
                onChange={(event) => updateField("startTime", event.target.value)}
                className="mt-2 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm outline-none"
              />
            </label>

            <label className="text-sm text-zinc-300">
              Durasi
              <select
                value={formState.durationHours}
                onChange={(event) => updateField("durationHours", event.target.value)}
                className="mt-2 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm outline-none"
              >
                <option value="2">2 Jam</option>
                <option value="4">4 Jam</option>
                <option value="6">6 Jam</option>
                <option value="8">8 Jam</option>
                <option value="12">12 Jam</option>
              </select>
            </label>

            <label className="text-sm text-zinc-300">
              Status
              <select
                value={formState.status}
                onChange={(event) =>
                  updateField("status", event.target.value as BookingFormState["status"])
                }
                className="mt-2 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm outline-none"
              >
                <option value="booked">Booked</option>
                <option value="check_in">Check-in</option>
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
                placeholder="Catatan internal booking"
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
                    Tambah Booking
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
                  <th className="px-4 py-3 font-medium">Queue Code</th>
                  <th className="px-4 py-3 font-medium">Pelanggan</th>
                  <th className="px-4 py-3 font-medium">Station</th>
                  <th className="px-4 py-3 font-medium">Jadwal</th>
                  <th className="px-4 py-3 font-medium">Durasi</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 bg-black/20">
                {initialBookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-white/[0.03]">
                    <td className="px-4 py-4 font-medium text-red-200">{booking.code}</td>
                    <td className="px-4 py-4 text-white">{booking.customer}</td>
                    <td className="px-4 py-4 text-zinc-400">{booking.station}</td>
                    <td className="px-4 py-4 text-zinc-300">{booking.schedule}</td>
                    <td className="px-4 py-4 text-zinc-300">{booking.duration}</td>
                    <td className="px-4 py-4">
                      <span className="rounded-full border border-emerald-300/20 bg-emerald-300/10 px-3 py-1 text-xs uppercase tracking-[0.24em] text-emerald-200">
                        {booking.status}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => fillForm(booking.id)}
                          className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 text-xs text-zinc-300 transition hover:bg-white/10"
                        >
                          <span className="inline-flex items-center gap-2">
                            <Pencil className="size-3.5" />
                            Edit
                          </span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(booking.id)}
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

      <aside className="space-y-6">
        <section className="rounded-[28px] border border-white/10 bg-zinc-950/80 p-6 shadow-[0_24px_80px_rgba(0,0,0,0.22)]">
          <CalendarRange className="size-5 text-amber-300" />
          <h2 className="mt-4 text-xl font-bold">Aturan Booking</h2>
          <ul className="mt-4 space-y-3 text-sm leading-7 text-zinc-400">
            <li>Durasi main disarankan berbasis slot 2 jam agar rotasi rapi.</li>
            <li>Queue code bisa otomatis jika form dikosongkan.</li>
            <li>Status station berubah otomatis saat booking diubah admin.</li>
          </ul>
        </section>

        <section className="rounded-[28px] border border-white/10 bg-zinc-950/80 p-6 shadow-[0_24px_80px_rgba(0,0,0,0.22)]">
          <CircleGauge className="size-5 text-red-300" />
          <h2 className="mt-4 text-xl font-bold">Sinkron Live Queue</h2>
          <p className="mt-4 text-sm leading-7 text-zinc-400">
            Booking dan station kini berada pada jalur data yang sama, sehingga
            homepage dan halaman rental bisa membaca status live yang konsisten.
          </p>
        </section>
      </aside>
    </div>
  );
}
