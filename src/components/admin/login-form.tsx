"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, LoaderCircle } from "lucide-react";

import { getSupabaseBrowserClient, isSupabaseConfigured } from "@/lib/supabase";

type LoginFormProps = {
  redirectPath: string;
};

export function LoginForm({ redirectPath }: LoginFormProps) {
  const router = useRouter();

  const [email, setEmail] = useState("admin@ninja388.com");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const configured = isSupabaseConfigured();

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      setErrorMessage("Konfigurasi Supabase belum tersedia di environment.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setErrorMessage(error.message);
      setIsSubmitting(false);
      return;
    }

    router.replace(redirectPath);
    router.refresh();
  }

  return (
    <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
      <div>
        <label
          htmlFor="email"
          className="text-xs uppercase tracking-[0.28em] text-zinc-500"
        >
          Email Admin
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="admin@ninja388.com"
          className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none transition focus:border-red-400/50 focus:bg-white/[0.08]"
        />
      </div>
      <div>
        <label
          htmlFor="password"
          className="text-xs uppercase tracking-[0.28em] text-zinc-500"
        >
          Password
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="Masukkan password admin"
          className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none transition focus:border-red-400/50 focus:bg-white/[0.08]"
        />
      </div>

      {!configured ? (
        <div className="rounded-2xl border border-red-300/20 bg-red-500/10 p-4 text-sm leading-7 text-red-100">
          Supabase belum terkonfigurasi. Isi `.env.local` terlebih dahulu.
        </div>
      ) : (
        <div className="rounded-2xl border border-amber-300/20 bg-amber-300/10 p-4 text-sm leading-7 text-amber-100/90">
          Login ini sudah terhubung ke Supabase Auth. Gunakan akun admin yang
          sudah dibootstrap untuk masuk ke panel.
        </div>
      )}

      {errorMessage ? (
        <div className="rounded-2xl border border-red-300/20 bg-red-500/10 p-4 text-sm leading-7 text-red-100">
          {errorMessage}
        </div>
      ) : null}

      <button
        type="submit"
        disabled={!configured || isSubmitting}
        className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-red-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-red-400 disabled:cursor-not-allowed disabled:bg-zinc-700"
      >
        {isSubmitting ? (
          <>
            <LoaderCircle className="size-4 animate-spin" />
            Memproses Login
          </>
        ) : (
          <>
            Masuk ke Dashboard
            <ArrowRight className="size-4" />
          </>
        )}
      </button>
    </form>
  );
}
