"use client";

import { useState } from "react";
import { LoaderCircle, Save } from "lucide-react";

type HomepageContent = {
  hero: {
    eyebrow: string;
    headingLine1: string;
    headingLine2: string;
    highlight: string;
    description: string;
    primaryCtaLabel: string;
    primaryCtaHref: string;
    secondaryCtaLabel: string;
    secondaryCtaHref: string;
  };
  seo: {
    metaTitle: string;
    metaDescription: string;
    canonicalUrl: string;
    ampUrl: string;
    ogTitle: string;
    ogDescription: string;
  };
};

type ContentManagerProps = {
  initialContent: HomepageContent;
};

export function ContentManager({ initialContent }: ContentManagerProps) {
  const [content, setContent] = useState(initialContent);
  const [feedback, setFeedback] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  function updateHero<K extends keyof HomepageContent["hero"]>(
    key: K,
    value: HomepageContent["hero"][K]
  ) {
    setContent((current) => ({
      ...current,
      hero: {
        ...current.hero,
        [key]: value,
      },
    }));
  }

  function updateSeo<K extends keyof HomepageContent["seo"]>(
    key: K,
    value: HomepageContent["seo"][K]
  ) {
    setContent((current) => ({
      ...current,
      seo: {
        ...current.seo,
        [key]: value,
      },
    }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setFeedback("");
    setErrorMessage("");

    try {
      const response = await fetch("/api/admin/content/home", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(content),
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || "Gagal menyimpan konten homepage.");
      }

      setFeedback("Konten homepage berhasil disimpan.");
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Terjadi error saat menyimpan."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="grid gap-6 lg:grid-cols-2" onSubmit={handleSubmit}>
      <article className="rounded-[28px] border border-white/10 bg-zinc-950/80 p-6 shadow-[0_24px_80px_rgba(0,0,0,0.22)]">
        <p className="text-xs uppercase tracking-[0.28em] text-red-300">
          Hero Homepage
        </p>
        <h2 className="mt-3 text-2xl font-bold">Konten visual utama</h2>
        <div className="mt-5 grid gap-4">
          <label className="text-sm text-zinc-300">
            Eyebrow
            <input
              value={content.hero.eyebrow}
              onChange={(event) => updateHero("eyebrow", event.target.value)}
              className="mt-2 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm outline-none"
            />
          </label>
          <label className="text-sm text-zinc-300">
            Judul Baris 1
            <input
              value={content.hero.headingLine1}
              onChange={(event) => updateHero("headingLine1", event.target.value)}
              className="mt-2 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm outline-none"
            />
          </label>
          <label className="text-sm text-zinc-300">
            Highlight
            <input
              value={content.hero.highlight}
              onChange={(event) => updateHero("highlight", event.target.value)}
              className="mt-2 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm outline-none"
            />
          </label>
          <label className="text-sm text-zinc-300">
            Judul Baris 2
            <input
              value={content.hero.headingLine2}
              onChange={(event) => updateHero("headingLine2", event.target.value)}
              className="mt-2 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm outline-none"
            />
          </label>
          <label className="text-sm text-zinc-300">
            Deskripsi
            <textarea
              rows={5}
              value={content.hero.description}
              onChange={(event) => updateHero("description", event.target.value)}
              className="mt-2 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm outline-none"
            />
          </label>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="text-sm text-zinc-300">
              Label CTA Utama
              <input
                value={content.hero.primaryCtaLabel}
                onChange={(event) => updateHero("primaryCtaLabel", event.target.value)}
                className="mt-2 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm outline-none"
              />
            </label>
            <label className="text-sm text-zinc-300">
              Link CTA Utama
              <input
                value={content.hero.primaryCtaHref}
                onChange={(event) => updateHero("primaryCtaHref", event.target.value)}
                className="mt-2 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm outline-none"
              />
            </label>
            <label className="text-sm text-zinc-300">
              Label CTA Kedua
              <input
                value={content.hero.secondaryCtaLabel}
                onChange={(event) => updateHero("secondaryCtaLabel", event.target.value)}
                className="mt-2 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm outline-none"
              />
            </label>
            <label className="text-sm text-zinc-300">
              Link CTA Kedua
              <input
                value={content.hero.secondaryCtaHref}
                onChange={(event) => updateHero("secondaryCtaHref", event.target.value)}
                className="mt-2 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm outline-none"
              />
            </label>
          </div>
        </div>
      </article>

      <article className="rounded-[28px] border border-white/10 bg-zinc-950/80 p-6 shadow-[0_24px_80px_rgba(0,0,0,0.22)]">
        <p className="text-xs uppercase tracking-[0.28em] text-amber-300">
          SEO Homepage
        </p>
        <h2 className="mt-3 text-2xl font-bold">Metadata inti</h2>
        <div className="mt-5 grid gap-4">
          <label className="text-sm text-zinc-300">
            Meta Title
            <input
              value={content.seo.metaTitle}
              onChange={(event) => updateSeo("metaTitle", event.target.value)}
              className="mt-2 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm outline-none"
            />
          </label>
          <label className="text-sm text-zinc-300">
            Meta Description
            <textarea
              rows={4}
              value={content.seo.metaDescription}
              onChange={(event) => updateSeo("metaDescription", event.target.value)}
              className="mt-2 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm outline-none"
            />
          </label>
          <label className="text-sm text-zinc-300">
            Canonical URL
            <input
              value={content.seo.canonicalUrl}
              onChange={(event) => updateSeo("canonicalUrl", event.target.value)}
              className="mt-2 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm outline-none"
            />
          </label>
          <label className="text-sm text-zinc-300">
            AMP URL
            <input
              value={content.seo.ampUrl}
              onChange={(event) => updateSeo("ampUrl", event.target.value)}
              className="mt-2 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm outline-none"
            />
          </label>
          <label className="text-sm text-zinc-300">
            OG Title
            <input
              value={content.seo.ogTitle}
              onChange={(event) => updateSeo("ogTitle", event.target.value)}
              className="mt-2 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm outline-none"
            />
          </label>
          <label className="text-sm text-zinc-300">
            OG Description
            <textarea
              rows={4}
              value={content.seo.ogDescription}
              onChange={(event) => updateSeo("ogDescription", event.target.value)}
              className="mt-2 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm outline-none"
            />
          </label>
        </div>
      </article>

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

      <div className="lg:col-span-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center gap-2 rounded-full bg-red-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-red-400 disabled:cursor-not-allowed disabled:bg-zinc-700"
        >
          {isSubmitting ? (
            <>
              <LoaderCircle className="size-4 animate-spin" />
              Menyimpan
            </>
          ) : (
            <>
              <Save className="size-4" />
              Simpan Konten Homepage
            </>
          )}
        </button>
      </div>
    </form>
  );
}
