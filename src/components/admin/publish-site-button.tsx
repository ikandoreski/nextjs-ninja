"use client";

import { useState } from "react";
import { LoaderCircle, Rocket } from "lucide-react";

export function PublishSiteButton() {
  const [isPublishing, setIsPublishing] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  async function handlePublish() {
    setIsPublishing(true);
    setFeedback("");
    setErrorMessage("");

    try {
      const response = await fetch("/api/admin/publish/site", {
        method: "POST",
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Gagal mempublish perubahan.");
      }

      setFeedback(
        result.message ||
          "Versi publish berhasil diperbarui dan siap dilanjutkan ke deploy website publik."
      );
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Terjadi error saat publish."
      );
    } finally {
      setIsPublishing(false);
    }
  }

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={handlePublish}
        disabled={isPublishing}
        className="inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-500/10 px-5 py-3 text-sm font-semibold text-amber-100 transition hover:bg-amber-500/20 disabled:cursor-not-allowed disabled:border-zinc-700 disabled:bg-zinc-900 disabled:text-zinc-400"
      >
        {isPublishing ? (
          <>
            <LoaderCircle className="size-4 animate-spin" />
            Mempublish Perubahan
          </>
        ) : (
          <>
            <Rocket className="size-4" />
            Publish Semua Perubahan
          </>
        )}
      </button>

      {feedback ? (
        <div className="rounded-2xl border border-green-400/20 bg-green-500/10 px-4 py-3 text-sm text-green-100">
          {feedback}
        </div>
      ) : null}

      {errorMessage ? (
        <div className="rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-100">
          {errorMessage}
        </div>
      ) : null}
    </div>
  );
}
