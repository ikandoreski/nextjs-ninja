"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Bold,
  Heading2,
  Image as ImageIcon,
  Italic,
  Link2,
  LoaderCircle,
  Plus,
  Save,
  Trash2,
  X,
} from "lucide-react";

import { PublishSiteButton } from "@/components/admin/publish-site-button";

type BlogPostRow = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  contentMarkdown: string;
  thumbnailUrl: string;
  status: string;
  updatedAt: string;
  createdAt: string;
};

type BlogFormState = {
  id?: string;
  title: string;
  slug: string;
  excerpt: string;
  contentMarkdown: string;
  thumbnailUrl: string;
  status: "draft" | "published" | "archived";
};

const emptyForm: BlogFormState = {
  title: "",
  slug: "",
  excerpt: "",
  contentMarkdown: "",
  thumbnailUrl: "",
  status: "draft",
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function formatDate(value: string) {
  if (!value) {
    return "";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

type BlogManagerProps = {
  initialPosts: BlogPostRow[];
};

export function BlogManager({ initialPosts }: BlogManagerProps) {
  const router = useRouter();
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const [formState, setFormState] = useState<BlogFormState>(emptyForm);
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEditing = Boolean(editingPostId);

  const postsById = useMemo(
    () => new Map(initialPosts.map((item) => [item.id, item])),
    [initialPosts]
  );

  function resetForm() {
    setFormState(emptyForm);
    setEditingPostId(null);
    setErrorMessage("");
  }

  function fillFormFromPost(postId: string) {
    const post = postsById.get(postId);
    if (!post) {
      return;
    }

    setFormState({
      id: post.id,
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt,
      contentMarkdown: post.contentMarkdown,
      thumbnailUrl: post.thumbnailUrl,
      status:
        post.status === "published" || post.status === "archived" ? post.status : "draft",
    });
    setEditingPostId(post.id);
    setFeedback("");
    setErrorMessage("");
  }

  function updateField<K extends keyof BlogFormState>(key: K, value: BlogFormState[K]) {
    setFormState((current) => ({
      ...current,
      [key]: value,
      ...(key === "title" && !editingPostId ? { slug: slugify(String(value)) } : {}),
    }));
  }

  function insertMarkdown(snippet: string) {
    const textarea = textareaRef.current;
    if (!textarea) {
      return;
    }

    const start = textarea.selectionStart ?? 0;
    const end = textarea.selectionEnd ?? 0;
    const before = formState.contentMarkdown.slice(0, start);
    const after = formState.contentMarkdown.slice(end);
    const nextValue = `${before}${snippet}${after}`;

    setFormState((current) => ({
      ...current,
      contentMarkdown: nextValue,
    }));

    requestAnimationFrame(() => {
      textarea.focus();
      const nextCursor = start + snippet.length;
      textarea.setSelectionRange(nextCursor, nextCursor);
    });
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setFeedback("");
    setErrorMessage("");

    const payload = {
      ...formState,
      slug: formState.slug || slugify(formState.title),
    };

    const endpoint = editingPostId ? `/api/admin/blog/${editingPostId}` : "/api/admin/blog";
    const method = editingPostId ? "PATCH" : "POST";

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
        throw new Error(result.error || "Gagal menyimpan artikel.");
      }

      setFeedback(editingPostId ? "Artikel berhasil diperbarui." : "Artikel baru berhasil dibuat.");
      resetForm();
      router.refresh();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Terjadi error saat menyimpan.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete(postId: string) {
    const shouldDelete = window.confirm(
      "Hapus artikel ini dari database? Tindakan ini tidak bisa dibatalkan."
    );

    if (!shouldDelete) {
      return;
    }

    setIsSubmitting(true);
    setFeedback("");
    setErrorMessage("");

    try {
      const response = await fetch(`/api/admin/blog/${postId}`, {
        method: "DELETE",
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || "Gagal menghapus artikel.");
      }

      if (editingPostId === postId) {
        resetForm();
      }

      setFeedback("Artikel berhasil dihapus.");
      router.refresh();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Terjadi error saat menghapus.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[28px] border border-white/10 bg-zinc-950/80 p-6 shadow-[0_24px_80px_rgba(0,0,0,0.22)]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.32em] text-amber-300">Blog</p>
            <p className="mt-2 text-sm leading-7 text-zinc-400">
              Status artikel mengikuti sistem publish. Artikel baru akan muncul di website publik
              setelah status menjadi Published dan Anda menekan Publish Semua Perubahan.
            </p>
          </div>
          <PublishSiteButton />
        </div>
      </section>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <section className="rounded-[28px] border border-white/10 bg-black/35 p-6 shadow-[0_24px_80px_rgba(0,0,0,0.18)] backdrop-blur">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold tracking-tight">Daftar Artikel</h2>
            <button
              type="button"
              onClick={() => {
                resetForm();
                setFeedback("");
              }}
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-zinc-200 transition hover:bg-white/10"
            >
              <Plus className="size-4" />
              Artikel Baru
            </button>
          </div>

          <div className="mt-5 space-y-3">
            {initialPosts.length === 0 ? (
              <p className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-sm text-zinc-400">
                Belum ada artikel. Buat artikel baru untuk memulai.
              </p>
            ) : (
              initialPosts.map((post) => (
                <button
                  key={post.id}
                  type="button"
                  onClick={() => fillFormFromPost(post.id)}
                  className="w-full rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-4 text-left transition hover:border-white/20 hover:bg-white/[0.05]"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold text-white">{post.title}</p>
                      <p className="mt-1 text-xs text-zinc-500">/{post.slug}</p>
                    </div>
                    <span className="rounded-full border border-white/10 bg-black/50 px-3 py-1 text-xs uppercase tracking-[0.3em] text-zinc-300">
                      {post.status}
                    </span>
                  </div>
                  {post.excerpt ? (
                    <p className="mt-3 line-clamp-2 text-sm leading-6 text-zinc-400">
                      {post.excerpt}
                    </p>
                  ) : null}
                  <p className="mt-3 text-xs text-zinc-500">
                    Update terakhir: {formatDate(post.updatedAt)}
                  </p>
                </button>
              ))
            )}
          </div>
        </section>

        <section className="rounded-[28px] border border-white/10 bg-zinc-950/80 p-6 shadow-[0_24px_80px_rgba(0,0,0,0.22)]">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold tracking-tight">
              {isEditing ? "Edit Artikel" : "Buat Artikel"}
            </h2>
            {isEditing ? (
              <button
                type="button"
                onClick={resetForm}
                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-zinc-200 transition hover:bg-white/10"
              >
                <X className="size-4" />
                Batal
              </button>
            ) : null}
          </div>

          <form className="mt-5 space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-200">Judul</label>
              <input
                value={formState.title}
                onChange={(event) => updateField("title", event.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none transition focus:border-amber-300/60"
                placeholder="Judul artikel Ninja388"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-200">Slug</label>
              <input
                value={formState.slug}
                onChange={(event) => updateField("slug", slugify(event.target.value))}
                className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none transition focus:border-amber-300/60"
                placeholder="judul-artikel"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-200">Thumbnail URL</label>
              <input
                value={formState.thumbnailUrl}
                onChange={(event) => updateField("thumbnailUrl", event.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none transition focus:border-amber-300/60"
                placeholder="https://... (upload lewat menu Media)"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-200">Ringkasan</label>
              <textarea
                value={formState.excerpt}
                onChange={(event) => updateField("excerpt", event.target.value)}
                className="min-h-[92px] w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none transition focus:border-amber-300/60"
                placeholder="Ringkasan singkat yang tampil di halaman blog."
              />
            </div>

            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-white/10 bg-black/35 px-3 py-2">
                <button
                  type="button"
                  onClick={() => insertMarkdown("## ")}
                  className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs text-zinc-200 transition hover:bg-white/10"
                >
                  <Heading2 className="size-4" />
                  Heading
                </button>
                <button
                  type="button"
                  onClick={() => insertMarkdown("**teks tebal**")}
                  className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs text-zinc-200 transition hover:bg-white/10"
                >
                  <Bold className="size-4" />
                  Bold
                </button>
                <button
                  type="button"
                  onClick={() => insertMarkdown("_teks miring_")}
                  className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs text-zinc-200 transition hover:bg-white/10"
                >
                  <Italic className="size-4" />
                  Italic
                </button>
                <button
                  type="button"
                  onClick={() => insertMarkdown("[teks link](https://)")}
                  className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs text-zinc-200 transition hover:bg-white/10"
                >
                  <Link2 className="size-4" />
                  Link
                </button>
                <button
                  type="button"
                  onClick={() => insertMarkdown("![alt text](https://)")}
                  className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs text-zinc-200 transition hover:bg-white/10"
                >
                  <ImageIcon className="size-4" />
                  Gambar
                </button>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-200">
                  Konten (Markdown)
                </label>
                <textarea
                  ref={textareaRef}
                  value={formState.contentMarkdown}
                  onChange={(event) => updateField("contentMarkdown", event.target.value)}
                  className="min-h-[260px] w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none transition focus:border-amber-300/60"
                  placeholder="Tulis artikel di sini. Gunakan menu Media untuk upload gambar lalu paste URL-nya."
                  required
                />
              </div>
            </div>

            <div className="grid gap-2">
              <label className="text-sm font-medium text-zinc-200">Status</label>
              <select
                value={formState.status}
                onChange={(event) =>
                  updateField("status", event.target.value as BlogFormState["status"])
                }
                className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none transition focus:border-amber-300/60"
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </select>
            </div>

            {feedback ? (
              <p className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">
                {feedback}
              </p>
            ) : null}
            {errorMessage ? (
              <p className="rounded-2xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-100">
                {errorMessage}
              </p>
            ) : null}

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              {isEditing ? (
                <button
                  type="button"
                  onClick={() => handleDelete(editingPostId as string)}
                  disabled={isSubmitting}
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200 transition hover:bg-red-500/20 disabled:opacity-50"
                >
                  <Trash2 className="size-4" />
                  Hapus
                </button>
              ) : (
                <span className="text-xs uppercase tracking-[0.3em] text-zinc-500">
                  Simpan dulu sebagai draft.
                </span>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-amber-300/40 bg-amber-300/10 px-6 py-3 text-sm font-semibold text-white transition hover:bg-amber-300/20 disabled:opacity-60"
              >
                {isSubmitting ? (
                  <LoaderCircle className="size-4 animate-spin" />
                ) : (
                  <Save className="size-4" />
                )}
                Simpan Artikel
              </button>
            </div>
          </form>
        </section>
      </div>
    </div>
  );
}

