"use client";

import { useState } from "react";
import { Copy, ImageUp, LoaderCircle } from "lucide-react";

type UploadResult = {
  path: string;
  url: string;
  contentType: string;
  size: number;
};

const MAX_UPLOAD_BYTES = 2.5 * 1024 * 1024;
const MAX_DIMENSION = 1920;

async function readImageDimensions(file: File) {
  const objectUrl = URL.createObjectURL(file);

  try {
    const dimensions = await new Promise<{ width: number; height: number }>((resolve, reject) => {
      const image = new Image();
      image.onload = () => {
        resolve({ width: image.naturalWidth, height: image.naturalHeight });
      };
      image.onerror = () => reject(new Error("Gagal membaca file gambar."));
      image.src = objectUrl;
    });

    return dimensions;
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

async function compressImageForUpload(file: File) {
  if (file.size <= MAX_UPLOAD_BYTES) {
    return file;
  }

  const { width, height } = await readImageDimensions(file);
  const scale = Math.min(1, MAX_DIMENSION / Math.max(width, height));
  const targetWidth = Math.max(1, Math.round(width * scale));
  const targetHeight = Math.max(1, Math.round(height * scale));

  const objectUrl = URL.createObjectURL(file);

  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const nextImage = new Image();
      nextImage.onload = () => resolve(nextImage);
      nextImage.onerror = () => reject(new Error("Gagal memuat file gambar."));
      nextImage.src = objectUrl;
    });

    const canvas = document.createElement("canvas");
    canvas.width = targetWidth;
    canvas.height = targetHeight;

    const context = canvas.getContext("2d");
    if (!context) {
      throw new Error("Browser tidak mendukung proses kompres gambar.");
    }

    context.drawImage(image, 0, 0, targetWidth, targetHeight);

    const qualities = [0.9, 0.82, 0.74, 0.66, 0.58, 0.5];
    for (const quality of qualities) {
      const blob = await new Promise<Blob | null>((resolve) => {
        canvas.toBlob(resolve, "image/webp", quality);
      });

      if (!blob) {
        continue;
      }

      if (blob.size <= MAX_UPLOAD_BYTES || quality === qualities[qualities.length - 1]) {
        const nextName = file.name.replace(/\.[^.]+$/, "") || "upload";
        return new File([blob], `${nextName}.webp`, {
          type: "image/webp",
          lastModified: Date.now(),
        });
      }
    }

    throw new Error("Gagal mengompres gambar.");
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

export function MediaManager() {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [result, setResult] = useState<UploadResult | null>(null);
  const [feedback, setFeedback] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleUpload() {
    if (!file) {
      setErrorMessage("Pilih file gambar terlebih dulu.");
      return;
    }

    setIsUploading(true);
    setFeedback("");
    setErrorMessage("");

    try {
      const preparedFile = await compressImageForUpload(file);
      const form = new FormData();
      form.append("file", preparedFile);

      const response = await fetch("/api/admin/media/upload", {
        method: "POST",
        body: form,
      });

      const text = await response.text();
      let data: unknown = null;

      try {
        data = text ? JSON.parse(text) : null;
      } catch {
        data = null;
      }

      if (!response.ok) {
        const message =
          data && typeof data === "object" && "error" in data
            ? String((data as { error: unknown }).error || "Gagal upload gambar.")
            : text
              ? text.slice(0, 180)
              : "Gagal upload gambar.";
        throw new Error(message);
      }

      setResult(data as UploadResult);
      setFeedback(
        preparedFile.size === file.size
          ? "Upload berhasil. URL siap dipakai di produk atau blog."
          : "Upload berhasil. Gambar otomatis dikompres agar lolos batas upload Vercel."
      );
      setFile(null);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Terjadi error saat upload.");
    } finally {
      setIsUploading(false);
    }
  }

  async function copyToClipboard(value: string) {
    try {
      await navigator.clipboard.writeText(value);
      setFeedback("URL berhasil disalin.");
    } catch {
      setErrorMessage("Gagal menyalin URL. Silakan copy manual.");
    }
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[28px] border border-white/10 bg-zinc-950/80 p-6 shadow-[0_24px_80px_rgba(0,0,0,0.22)]">
        <p className="text-xs uppercase tracking-[0.32em] text-amber-300">Upload Gambar</p>
        <p className="mt-2 text-sm leading-7 text-zinc-400">
          Upload ke Firebase Storage lalu gunakan URL yang diberikan untuk thumbnail blog, gambar di
          artikel, atau featured image produk. File besar akan otomatis dikompres sebelum dikirim.
        </p>

        <div className="mt-5 flex flex-col gap-4 md:flex-row md:items-center">
          <input
            type="file"
            accept="image/*"
            onChange={(event) => {
              setFeedback("");
              setErrorMessage("");
              setResult(null);
              setFile(event.target.files?.[0] ?? null);
            }}
            className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-zinc-200 file:mr-4 file:rounded-full file:border-0 file:bg-white/10 file:px-4 file:py-2 file:text-sm file:text-white"
          />
          <button
            type="button"
            disabled={isUploading}
            onClick={handleUpload}
            className="inline-flex items-center justify-center gap-2 rounded-full border border-amber-300/40 bg-amber-300/10 px-6 py-3 text-sm font-semibold text-white transition hover:bg-amber-300/20 disabled:opacity-60"
          >
            {isUploading ? (
              <LoaderCircle className="size-4 animate-spin" />
            ) : (
              <ImageUp className="size-4" />
            )}
            Upload
          </button>
        </div>

        {feedback ? (
          <p className="mt-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">
            {feedback}
          </p>
        ) : null}
        {errorMessage ? (
          <p className="mt-4 rounded-2xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-100">
            {errorMessage}
          </p>
        ) : null}
      </section>

      {result ? (
        <section className="rounded-[28px] border border-white/10 bg-black/35 p-6 shadow-[0_24px_80px_rgba(0,0,0,0.18)] backdrop-blur">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-[0.32em] text-amber-300">URL Gambar</p>
              <p className="text-sm text-zinc-400">{result.path}</p>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <input
                  value={result.url}
                  readOnly
                  className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none"
                />
                <button
                  type="button"
                  onClick={() => copyToClipboard(result.url)}
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm text-zinc-200 transition hover:bg-white/10"
                >
                  <Copy className="size-4" />
                  Copy
                </button>
              </div>
              <p className="text-xs text-zinc-500">
                {result.contentType} · {(result.size / 1024).toFixed(1)} KB
              </p>
            </div>
            <div className="overflow-hidden rounded-2xl border border-white/10 bg-black/40">
              <img src={result.url} alt="Preview upload" className="h-40 w-64 object-cover" />
            </div>
          </div>
        </section>
      ) : null}
    </div>
  );
}
