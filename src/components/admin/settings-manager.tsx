"use client";

import { useState } from "react";
import { LoaderCircle, Save } from "lucide-react";

import { PublishSiteButton } from "@/components/admin/publish-site-button";

type BusinessSettings = {
  brandName: string;
  domainUrl: string;
  ampUrl: string;
  whatsappNumber: string;
  phoneDisplay: string;
  addressLines: string;
  mapsUrl: string;
  instagramUrl: string;
  facebookUrl: string;
  tiktokUrl: string;
  youtubeUrl: string;
  customHeadScripts: string;
  customFooterScripts: string;
};

type SettingsManagerProps = {
  initialSettings: BusinessSettings;
};

export function SettingsManager({ initialSettings }: SettingsManagerProps) {
  const [settings, setSettings] = useState(initialSettings);
  const [feedback, setFeedback] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  function updateField<K extends keyof BusinessSettings>(
    key: K,
    value: BusinessSettings[K]
  ) {
    setSettings((current) => ({
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
      const response = await fetch("/api/admin/settings/business", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || "Gagal menyimpan pengaturan bisnis.");
      }

      setFeedback("Draft pengaturan bisnis berhasil disimpan.");
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
        <p className="text-xs uppercase tracking-[0.28em] text-zinc-500">Konfigurasi</p>
        <h2 className="mt-3 text-2xl font-bold">Identitas Brand</h2>
        <div className="mt-5 grid gap-4">
          <label className="text-sm text-zinc-300">
            Nama Brand
            <input
              value={settings.brandName}
              onChange={(event) => updateField("brandName", event.target.value)}
              className="mt-2 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm outline-none"
            />
          </label>
          <label className="text-sm text-zinc-300">
            Domain Utama
            <input
              value={settings.domainUrl}
              onChange={(event) => updateField("domainUrl", event.target.value)}
              className="mt-2 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm outline-none"
            />
          </label>
          <label className="text-sm text-zinc-300">
            URL AMP
            <input
              value={settings.ampUrl}
              onChange={(event) => updateField("ampUrl", event.target.value)}
              className="mt-2 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm outline-none"
            />
          </label>
          <label className="text-sm text-zinc-300">
            WhatsApp Number
            <input
              value={settings.whatsappNumber}
              onChange={(event) => updateField("whatsappNumber", event.target.value)}
              className="mt-2 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm outline-none"
            />
          </label>
          <label className="text-sm text-zinc-300">
            Nomor Tampil
            <input
              value={settings.phoneDisplay}
              onChange={(event) => updateField("phoneDisplay", event.target.value)}
              className="mt-2 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm outline-none"
            />
          </label>
        </div>
      </article>

      <article className="rounded-[28px] border border-white/10 bg-zinc-950/80 p-6 shadow-[0_24px_80px_rgba(0,0,0,0.22)]">
        <p className="text-xs uppercase tracking-[0.28em] text-zinc-500">Konfigurasi</p>
        <h2 className="mt-3 text-2xl font-bold">Kontak Operasional</h2>
        <div className="mt-5 grid gap-4">
          <label className="text-sm text-zinc-300">
            Google Maps URL
            <input
              value={settings.mapsUrl}
              onChange={(event) => updateField("mapsUrl", event.target.value)}
              className="mt-2 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm outline-none"
            />
          </label>
          <label className="text-sm text-zinc-300">
            Alamat
            <textarea
              rows={5}
              value={settings.addressLines}
              onChange={(event) => updateField("addressLines", event.target.value)}
              className="mt-2 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm outline-none"
            />
          </label>
        </div>
      </article>

      <article className="rounded-[28px] border border-white/10 bg-zinc-950/80 p-6 shadow-[0_24px_80px_rgba(0,0,0,0.22)] lg:col-span-2">
        <p className="text-xs uppercase tracking-[0.28em] text-zinc-500">Konfigurasi</p>
        <h2 className="mt-3 text-2xl font-bold">Media Sosial</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <label className="text-sm text-zinc-300">
            Facebook URL
            <input
              value={settings.facebookUrl}
              onChange={(event) => updateField("facebookUrl", event.target.value)}
              className="mt-2 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm outline-none"
            />
          </label>
          <label className="text-sm text-zinc-300">
            Instagram URL
            <input
              value={settings.instagramUrl}
              onChange={(event) => updateField("instagramUrl", event.target.value)}
              className="mt-2 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm outline-none"
            />
          </label>
          <label className="text-sm text-zinc-300">
            TikTok URL
            <input
              value={settings.tiktokUrl}
              onChange={(event) => updateField("tiktokUrl", event.target.value)}
              className="mt-2 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm outline-none"
            />
          </label>
          <label className="text-sm text-zinc-300">
            YouTube URL
            <input
              value={settings.youtubeUrl}
              onChange={(event) => updateField("youtubeUrl", event.target.value)}
              className="mt-2 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm outline-none"
            />
          </label>
        </div>
      </article>

      <article className="rounded-[28px] border border-white/10 bg-zinc-950/80 p-6 shadow-[0_24px_80px_rgba(0,0,0,0.22)] lg:col-span-2">
        <p className="text-xs uppercase tracking-[0.28em] text-zinc-500">Integrasi</p>
        <h2 className="mt-3 text-2xl font-bold">Custom Script Head & Footer</h2>
        <div className="mt-5 grid gap-4">
          <label className="text-sm text-zinc-300">
            Custom Script Head
            <textarea
              rows={8}
              value={settings.customHeadScripts}
              onChange={(event) => updateField("customHeadScripts", event.target.value)}
              className="mt-2 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 font-mono text-sm outline-none"
              placeholder="<script>/* script head */</script>"
            />
          </label>
          <label className="text-sm text-zinc-300">
            Custom Script Footer
            <textarea
              rows={8}
              value={settings.customFooterScripts}
              onChange={(event) =>
                updateField("customFooterScripts", event.target.value)
              }
              className="mt-2 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 font-mono text-sm outline-none"
              placeholder="<script>/* script footer */</script>"
            />
          </label>
          <p className="text-sm leading-7 text-zinc-400">
            Script ini disimpan sebagai draft lebih dulu. Setelah klik publish,
            script akan ikut masuk ke source HTML statis saat Anda menjalankan
            proses publish publik.
          </p>
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

      <div className="flex flex-wrap items-start gap-3 lg:col-span-2">
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
              Simpan Draft Pengaturan Bisnis
            </>
          )}
        </button>

        <PublishSiteButton />
      </div>
    </form>
  );
}
