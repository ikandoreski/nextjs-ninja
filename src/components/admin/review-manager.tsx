"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { LoaderCircle, Pencil, Plus, Save, Star, Trash2, X } from "lucide-react";

type ReviewRow = {
  id: string;
  reviewer: string;
  rating: number;
  body: string;
  reply: string;
  isFeatured: boolean;
  status: string;
};

type ReviewFormState = {
  reviewerName: string;
  rating: string;
  reviewBody: string;
  ownerReply: string;
  isFeatured: boolean;
};

const emptyForm: ReviewFormState = {
  reviewerName: "",
  rating: "5",
  reviewBody: "",
  ownerReply: "",
  isFeatured: true,
};

type ReviewManagerProps = {
  initialReviews: ReviewRow[];
};

export function ReviewManager({ initialReviews }: ReviewManagerProps) {
  const router = useRouter();
  const [formState, setFormState] = useState<ReviewFormState>(emptyForm);
  const [editingReviewId, setEditingReviewId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEditing = Boolean(editingReviewId);
  const reviewMap = useMemo(
    () => new Map(initialReviews.map((item) => [item.id, item])),
    [initialReviews]
  );

  function resetForm() {
    setFormState(emptyForm);
    setEditingReviewId(null);
    setFeedback("");
    setErrorMessage("");
  }

  function fillFormFromReview(reviewId: string) {
    const review = reviewMap.get(reviewId);
    if (!review) return;

    setFormState({
      reviewerName: review.reviewer,
      rating: String(review.rating),
      reviewBody: review.body,
      ownerReply: review.reply,
      isFeatured: review.isFeatured,
    });
    setEditingReviewId(review.id);
    setFeedback("");
    setErrorMessage("");
  }

  function updateField<K extends keyof ReviewFormState>(
    key: K,
    value: ReviewFormState[K]
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

    const payload = {
      reviewerName: formState.reviewerName,
      rating: Number(formState.rating || 5),
      reviewBody: formState.reviewBody,
      ownerReply: formState.ownerReply,
      isFeatured: formState.isFeatured,
    };

    const endpoint = editingReviewId
      ? `/api/admin/reviews/${editingReviewId}`
      : "/api/admin/reviews";
    const method = editingReviewId ? "PATCH" : "POST";

    try {
      const response = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || "Gagal menyimpan review.");
      }

      setFeedback(
        editingReviewId
          ? "Review berhasil diperbarui."
          : "Review berhasil ditambahkan."
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

  async function handleDelete(reviewId: string) {
    const shouldDelete = window.confirm(
      "Hapus review ini dari daftar publik? Tindakan ini tidak bisa dibatalkan."
    );

    if (!shouldDelete) {
      return;
    }

    setIsSubmitting(true);
    setFeedback("");
    setErrorMessage("");

    try {
      const response = await fetch(`/api/admin/reviews/${reviewId}`, {
        method: "DELETE",
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || "Gagal menghapus review.");
      }

      if (editingReviewId === reviewId) {
        resetForm();
      }

      setFeedback("Review berhasil dihapus.");
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
    <div className="space-y-6">
      <section className="rounded-[28px] border border-white/10 bg-zinc-950/80 p-6 shadow-[0_24px_80px_rgba(0,0,0,0.22)]">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-red-300">
              CRUD Review
            </p>
            <h2 className="mt-2 text-2xl font-bold text-white">
              {isEditing ? "Edit Review" : "Tambah Review Baru"}
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-7 text-zinc-400">
              Kelola review bisnis yang ditampilkan di homepage, katalog, detail
              produk, dan schema organisasi Ninja388.
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
            Nama Reviewer
            <input
              value={formState.reviewerName}
              onChange={(event) => updateField("reviewerName", event.target.value)}
              className="mt-2 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm outline-none"
              placeholder="Nama reviewer"
            />
          </label>

          <label className="text-sm text-zinc-300">
            Rating
            <select
              value={formState.rating}
              onChange={(event) => updateField("rating", event.target.value)}
              className="mt-2 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm outline-none"
            >
              <option value="5">5 Bintang</option>
              <option value="4">4 Bintang</option>
              <option value="3">3 Bintang</option>
              <option value="2">2 Bintang</option>
              <option value="1">1 Bintang</option>
            </select>
          </label>

          <label className="text-sm text-zinc-300 lg:col-span-2">
            Isi Review
            <textarea
              value={formState.reviewBody}
              onChange={(event) => updateField("reviewBody", event.target.value)}
              rows={4}
              className="mt-2 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm outline-none"
              placeholder="Isi review pelanggan"
            />
          </label>

          <label className="text-sm text-zinc-300 lg:col-span-2">
            Balasan Ninja388
            <textarea
              value={formState.ownerReply}
              onChange={(event) => updateField("ownerReply", event.target.value)}
              rows={3}
              className="mt-2 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm outline-none"
              placeholder="Balasan dari Ninja388"
            />
          </label>

          <label className="inline-flex items-center gap-3 rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-zinc-300 lg:col-span-2">
            <input
              type="checkbox"
              checked={formState.isFeatured}
              onChange={(event) => updateField("isFeatured", event.target.checked)}
              className="size-4 accent-red-500"
            />
            Tampilkan sebagai review unggulan di website
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
                  Tambah Review
                </>
              )}
            </button>
          </div>
        </form>
      </section>

      <section className="grid gap-6 xl:grid-cols-3">
        {initialReviews.map((review) => (
          <article
            key={review.id}
            className="rounded-[28px] border border-white/10 bg-zinc-950/80 p-6 shadow-[0_24px_80px_rgba(0,0,0,0.22)]"
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.28em] text-zinc-500">
                  Sumber Google
                </p>
                <h2 className="mt-2 text-2xl font-bold">{review.reviewer}</h2>
              </div>
              <span className="rounded-full border border-amber-300/20 bg-amber-300/10 px-3 py-1 text-xs uppercase tracking-[0.24em] text-amber-200">
                {review.status}
              </span>
            </div>

            <div className="mt-5 flex items-center gap-1 text-amber-300">
              {Array.from({ length: review.rating }).map((_, index) => (
                <Star key={`${review.id}-${index}`} className="size-4 fill-current" />
              ))}
            </div>

            <p className="mt-5 text-sm leading-7 text-zinc-300">
              &ldquo;{review.body}&rdquo;
            </p>
            <p className="mt-4 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-4 text-sm leading-7 text-zinc-400">
              Balasan Ninja388: &ldquo;{review.reply}&rdquo;
            </p>

            <div className="mt-5 flex flex-wrap gap-2 border-t border-white/10 pt-5">
              <button
                type="button"
                onClick={() => fillFormFromReview(review.id)}
                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 text-xs text-zinc-300 transition hover:bg-white/10"
              >
                <Pencil className="size-3.5" />
                Edit
              </button>
              <button
                type="button"
                onClick={() => handleDelete(review.id)}
                disabled={isSubmitting}
                className="inline-flex items-center gap-2 rounded-full border border-red-400/20 bg-red-500/10 px-3 py-2 text-xs text-red-100 transition hover:bg-red-500/20 disabled:cursor-not-allowed"
              >
                <Trash2 className="size-3.5" />
                Hapus
              </button>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
