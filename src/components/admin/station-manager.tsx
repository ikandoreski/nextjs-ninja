"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { LoaderCircle, Pencil, Plus, Save, Trash2, Wrench, X } from "lucide-react";

type StationRow = {
  id: string;
  code: string;
  name: string;
  type: string;
  rawStatus: "tersedia" | "dipakai" | "maintenance" | "full";
  status: string;
  note: string;
};

type StationFormState = {
  code: string;
  name: string;
  status: "tersedia" | "dipakai" | "maintenance" | "full";
  notes: string;
};

const emptyForm: StationFormState = {
  code: "",
  name: "",
  status: "tersedia",
  notes: "",
};

type StationManagerProps = {
  initialStations: StationRow[];
};

export function StationManager({ initialStations }: StationManagerProps) {
  const router = useRouter();
  const [formState, setFormState] = useState<StationFormState>(emptyForm);
  const [editingStationId, setEditingStationId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const stationsById = useMemo(
    () => new Map(initialStations.map((item) => [item.id, item])),
    [initialStations]
  );

  const isEditing = Boolean(editingStationId);

  function resetForm() {
    setFormState(emptyForm);
    setEditingStationId(null);
    setFeedback("");
    setErrorMessage("");
  }

  function fillForm(stationId: string) {
    const station = stationsById.get(stationId);
    if (!station) return;

    setFormState({
      code: station.code,
      name: station.name,
      status: station.rawStatus,
      notes: station.note === "Belum ada catatan" ? "" : station.note,
    });
    setEditingStationId(stationId);
    setFeedback("");
    setErrorMessage("");
  }

  function updateField<K extends keyof StationFormState>(
    key: K,
    value: StationFormState[K]
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
      const endpoint = editingStationId
        ? `/api/admin/stations/${editingStationId}`
        : "/api/admin/stations";
      const method = editingStationId ? "PATCH" : "POST";

      const response = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formState),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || "Gagal menyimpan station.");
      }

      setFeedback(
        editingStationId
          ? "Station berhasil diperbarui."
          : "Station baru berhasil ditambahkan."
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

  async function handleDelete(stationId: string) {
    const shouldDelete = window.confirm(
      "Hapus station ini? Pastikan tidak ada booking aktif yang masih memakainya."
    );

    if (!shouldDelete) return;

    setIsSubmitting(true);
    setFeedback("");
    setErrorMessage("");

    try {
      const response = await fetch(`/api/admin/stations/${stationId}`, {
        method: "DELETE",
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || "Gagal menghapus station.");
      }

      if (editingStationId === stationId) {
        resetForm();
      }

      setFeedback("Station berhasil dihapus.");
      router.refresh();
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Terjadi error saat menghapus."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function quickStatus(stationId: string, status: StationFormState["status"]) {
    const station = stationsById.get(stationId);
    if (!station) return;

    setIsSubmitting(true);
    setFeedback("");
    setErrorMessage("");

    try {
      const response = await fetch(`/api/admin/stations/${stationId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: station.code,
          name: station.name,
          status,
          notes: station.note === "Belum ada catatan" ? "" : station.note,
        }),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || "Gagal mengubah status station.");
      }

      setFeedback(`Status ${station.name} berhasil diperbarui.`);
      router.refresh();
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Terjadi error saat update status."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[28px] border border-white/10 bg-zinc-950/80 p-6 shadow-[0_24px_80px_rgba(0,0,0,0.22)]">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-red-300">
              CRUD Station
            </p>
            <h2 className="mt-2 text-2xl font-bold text-white">
              {isEditing ? "Edit Station" : "Tambah Station Baru"}
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-7 text-zinc-400">
              Kelola daftar station dan status live yang tampil pada homepage dan
              halaman rental.
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
            Kode Station
            <input
              value={formState.code}
              onChange={(event) => updateField("code", event.target.value.toUpperCase())}
              className="mt-2 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm outline-none"
              placeholder="PS5-04 / VIP-01"
            />
          </label>

          <label className="text-sm text-zinc-300">
            Nama Station
            <input
              value={formState.name}
              onChange={(event) => updateField("name", event.target.value)}
              className="mt-2 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm outline-none"
              placeholder="PS5 Lounge 04"
            />
          </label>

          <label className="text-sm text-zinc-300">
            Status
            <select
              value={formState.status}
              onChange={(event) =>
                updateField("status", event.target.value as StationFormState["status"])
              }
              className="mt-2 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm outline-none"
            >
              <option value="tersedia">Tersedia</option>
              <option value="dipakai">Dipakai</option>
              <option value="full">Booked</option>
              <option value="maintenance">Maintenance</option>
            </select>
          </label>

          <label className="text-sm text-zinc-300">
            Catatan
            <input
              value={formState.notes}
              onChange={(event) => updateField("notes", event.target.value)}
              className="mt-2 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm outline-none"
              placeholder="Catatan station"
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
                  Tambah Station
                </>
              )}
            </button>
          </div>
        </form>
      </section>

      <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {initialStations.map((station) => (
          <article
            key={station.id}
            className="rounded-[28px] border border-white/10 bg-zinc-950/80 p-6 shadow-[0_24px_80px_rgba(0,0,0,0.22)]"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.28em] text-zinc-500">
                  {station.type}
                </p>
                <h2 className="mt-2 text-2xl font-bold">{station.name}</h2>
                <p className="mt-2 text-xs uppercase tracking-[0.24em] text-zinc-500">
                  {station.code}
                </p>
              </div>
              <Wrench className="size-5 text-amber-300" />
            </div>

            <div className="mt-6 inline-flex rounded-full border border-red-300/20 bg-red-300/10 px-3 py-1 text-xs uppercase tracking-[0.24em] text-red-100">
              {station.status}
            </div>

            <p className="mt-4 text-sm leading-7 text-zinc-400">{station.note}</p>

            <div className="mt-6 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => fillForm(station.id)}
                className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 text-xs uppercase tracking-[0.22em] text-zinc-300 transition hover:bg-white/10"
              >
                <span className="inline-flex items-center gap-2">
                  <Pencil className="size-3.5" />
                  Edit
                </span>
              </button>
              {[
                ["tersedia", "Tersedia"],
                ["dipakai", "Dipakai"],
                ["maintenance", "Maintenance"],
              ].map(([raw, label]) => (
                <button
                  key={raw}
                  type="button"
                  onClick={() =>
                    quickStatus(station.id, raw as StationFormState["status"])
                  }
                  className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 text-xs uppercase tracking-[0.22em] text-zinc-300 transition hover:bg-white/10"
                >
                  {label}
                </button>
              ))}
              <button
                type="button"
                onClick={() => handleDelete(station.id)}
                disabled={isSubmitting}
                className="rounded-full border border-red-400/20 bg-red-500/10 px-3 py-2 text-xs uppercase tracking-[0.22em] text-red-100 transition hover:bg-red-500/20"
              >
                <span className="inline-flex items-center gap-2">
                  <Trash2 className="size-3.5" />
                  Hapus
                </span>
              </button>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
