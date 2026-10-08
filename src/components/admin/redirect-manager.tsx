"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, LoaderCircle, Pencil, Plus, Save, Trash2, X } from "lucide-react";

type RedirectRow = {
  id: string;
  source: string;
  destination: string;
  type: "301" | "302";
  active: boolean;
};

type RedirectFormState = {
  source: string;
  destination: string;
  type: "301" | "302";
  active: boolean;
};

const emptyForm: RedirectFormState = {
  source: "",
  destination: "",
  type: "301",
  active: true,
};

type RedirectManagerProps = {
  initialRedirects: RedirectRow[];
};

export function RedirectManager({ initialRedirects }: RedirectManagerProps) {
  const router = useRouter();
  const [formState, setFormState] = useState<RedirectFormState>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const redirectsById = useMemo(
    () => new Map(initialRedirects.map((item) => [item.id, item])),
    [initialRedirects]
  );

  const isEditing = Boolean(editingId);

  function resetForm() {
    setFormState(emptyForm);
    setEditingId(null);
    setFeedback("");
    setErrorMessage("");
  }

  function fillForm(id: string) {
    const rule = redirectsById.get(id);
    if (!rule) return;

    setFormState({
      source: rule.source,
      destination: rule.destination,
      type: rule.type,
      active: rule.active,
    });
    setEditingId(id);
    setFeedback("");
    setErrorMessage("");
  }

  function updateField<K extends keyof RedirectFormState>(
    key: K,
    value: RedirectFormState[K]
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
      const endpoint = editingId
        ? `/api/admin/redirects/${editingId}`
        : "/api/admin/redirects";
      const method = editingId ? "PATCH" : "POST";

      const response = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formState),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || "Gagal menyimpan redirect.");
      }

      setFeedback(
        editingId
          ? "Redirect berhasil diperbarui."
          : "Redirect baru berhasil ditambahkan."
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

  async function handleDelete(id: string) {
    const shouldDelete = window.confirm("Hapus aturan redirect ini?");
    if (!shouldDelete) return;

    setIsSubmitting(true);
    setFeedback("");
    setErrorMessage("");

    try {
      const response = await fetch(`/api/admin/redirects/${id}`, {
        method: "DELETE",
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || "Gagal menghapus redirect.");
      }

      if (editingId === id) {
        resetForm();
      }

      setFeedback("Redirect berhasil dihapus.");
      router.refresh();
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Terjadi error saat menghapus."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function toggleActive(id: string) {
    const rule = redirectsById.get(id);
    if (!rule) return;

    setIsSubmitting(true);
    setFeedback("");
    setErrorMessage("");

    try {
      const response = await fetch(`/api/admin/redirects/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          source: rule.source,
          destination: rule.destination,
          type: rule.type,
          active: !rule.active,
        }),
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || "Gagal mengubah status redirect.");
      }

      setFeedback("Status redirect berhasil diperbarui.");
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
              Aturan Redirect
            </p>
            <h2 className="mt-2 text-2xl font-bold text-white">
              {isEditing ? "Edit Redirect" : "Tambah Redirect Baru"}
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-7 text-zinc-400">
              Redirect 301/302 diterapkan ke website publik saat publish berikutnya.
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
          <label className="text-sm text-zinc-300 lg:col-span-2">
            Source (path)
            <input
              value={formState.source}
              onChange={(event) => updateField("source", event.target.value)}
              className="mt-2 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 font-mono text-sm outline-none"
              placeholder="/amp/** atau /halaman-lama/"
            />
          </label>

          <label className="text-sm text-zinc-300 lg:col-span-2">
            Destination (URL)
            <input
              value={formState.destination}
              onChange={(event) => updateField("destination", event.target.value)}
              className="mt-2 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 font-mono text-sm outline-none"
              placeholder="https://tokoninja.b-cdn.net/"
            />
          </label>

          <label className="text-sm text-zinc-300">
            Tipe
            <select
              value={formState.type}
              onChange={(event) =>
                updateField("type", event.target.value as "301" | "302")
              }
              className="mt-2 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm outline-none"
            >
              <option value="301">301 (Permanent)</option>
              <option value="302">302 (Sementara)</option>
            </select>
          </label>

          <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/30 px-4 py-4 text-sm text-zinc-200">
            <input
              type="checkbox"
              checked={formState.active}
              onChange={(event) => updateField("active", event.target.checked)}
              className="size-4 rounded border-white/20 bg-black/40"
            />
            Aktif
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
                  Tambah Redirect
                </>
              )}
            </button>
          </div>
        </form>
      </section>

      <section className="overflow-hidden rounded-[28px] border border-white/10 bg-zinc-950/80 shadow-[0_24px_80px_rgba(0,0,0,0.22)]">
        <div className="p-6">
          <h2 className="text-2xl font-bold">Daftar Redirect</h2>
          <p className="mt-2 text-sm leading-7 text-zinc-400">
            {initialRedirects.length} aturan (aktif maupun nonaktif).
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-white/10 text-left text-sm">
            <thead className="bg-white/[0.04] text-zinc-400">
              <tr>
                <th className="px-4 py-3 font-medium">Source</th>
                <th className="px-4 py-3 font-medium">Destination</th>
                <th className="px-4 py-3 font-medium">Tipe</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 bg-black/20">
              {initialRedirects.map((rule) => (
                <tr key={rule.id} className="hover:bg-white/[0.03]">
                  <td className="px-4 py-4 font-mono text-zinc-200">{rule.source}</td>
                  <td className="px-4 py-4">
                    <span className="inline-flex items-center gap-2 font-mono text-zinc-400">
                      <ArrowRight className="size-3.5 text-amber-300" />
                      {rule.destination}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-zinc-300">{rule.type}</td>
                  <td className="px-4 py-4">
                    <button
                      type="button"
                      onClick={() => toggleActive(rule.id)}
                      disabled={isSubmitting}
                      className={
                        rule.active
                          ? "rounded-full border border-green-400/20 bg-green-500/10 px-3 py-1 text-xs uppercase tracking-[0.24em] text-green-100"
                          : "rounded-full border border-zinc-500/20 bg-zinc-500/10 px-3 py-1 text-xs uppercase tracking-[0.24em] text-zinc-400"
                      }
                    >
                      {rule.active ? "Aktif" : "Nonaktif"}
                    </button>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => fillForm(rule.id)}
                        className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 text-xs uppercase tracking-[0.22em] text-zinc-300 transition hover:bg-white/10"
                      >
                        <span className="inline-flex items-center gap-2">
                          <Pencil className="size-3.5" />
                          Edit
                        </span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(rule.id)}
                        disabled={isSubmitting}
                        className="rounded-full border border-red-400/20 bg-red-500/10 px-3 py-2 text-xs uppercase tracking-[0.22em] text-red-100 transition hover:bg-red-500/20"
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
    </div>
  );
}
