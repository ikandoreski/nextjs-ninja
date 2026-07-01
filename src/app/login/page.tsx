import { ShieldCheck, Store, TimerReset } from "lucide-react";

import { LoginForm } from "@/components/admin/login-form";

type LoginPageProps = {
  searchParams?: Promise<{
    redirectedFrom?: string;
  }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = (await searchParams) ?? {};
  const redirectPath = params.redirectedFrom || "/dashboard";

  return (
    <main className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,rgba(220,38,38,0.24),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(251,191,36,0.14),transparent_30%),linear-gradient(180deg,#050505_0%,#090909_100%)] px-4 py-8 text-white sm:px-6 lg:px-8">
      <div className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-7xl items-center gap-10 lg:grid-cols-[1.15fr_0.85fr]">
        <section className="max-w-2xl">
          <p className="text-sm font-medium uppercase tracking-[0.38em] text-red-300">
            Ninja388 Admin
          </p>
          <h1 className="mt-6 text-5xl font-bold leading-none tracking-tight sm:text-6xl">
            Kontrol toko, rental, dan reputasi brand dari satu panel.
          </h1>
          <p className="mt-6 max-w-xl text-base leading-8 text-zinc-400 sm:text-lg">
            Fase awal ini membangun panel admin terpisah agar website publik yang
            sekarang tetap aman. Seluruh operasional inti nanti dipindahkan
            bertahap ke sistem ini.
          </p>

          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            <article className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur">
              <Store className="size-5 text-amber-300" />
              <p className="mt-4 text-sm font-medium uppercase tracking-[0.24em] text-zinc-500">
                Produk
              </p>
              <p className="mt-2 text-sm leading-7 text-zinc-300">
                Harga, stok, media, dan SEO produk tersentral.
              </p>
            </article>
            <article className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur">
              <TimerReset className="size-5 text-red-300" />
              <p className="mt-4 text-sm font-medium uppercase tracking-[0.24em] text-zinc-500">
                Rental
              </p>
              <p className="mt-2 text-sm leading-7 text-zinc-300">
                Queue code, booking, dan status station lebih rapi.
              </p>
            </article>
            <article className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur">
              <ShieldCheck className="size-5 text-emerald-300" />
              <p className="mt-4 text-sm font-medium uppercase tracking-[0.24em] text-zinc-500">
                Kontrol
              </p>
              <p className="mt-2 text-sm leading-7 text-zinc-300">
                Role admin, review, konten, dan metadata lebih aman.
              </p>
            </article>
          </div>
        </section>

        <section className="rounded-[32px] border border-white/10 bg-black/45 p-6 shadow-[0_32px_120px_rgba(0,0,0,0.35)] backdrop-blur sm:p-8">
          <div className="flex items-center gap-3">
            <div className="flex size-12 items-center justify-center rounded-2xl border border-red-500/40 bg-red-500/10 text-lg font-bold text-red-200">
              N
            </div>
            <div>
              <p className="text-lg font-semibold">Akses Admin</p>
              <p className="text-xs uppercase tracking-[0.28em] text-zinc-500">
                Fase Implementasi Awal
              </p>
            </div>
          </div>

          <LoginForm redirectPath={redirectPath} />

          <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm text-zinc-400">
            Rekomendasi deployment akhir: panel admin di subdomain
            <span className="ml-1 text-amber-200">admin.ninja388.com</span>
          </div>
        </section>
      </div>
    </main>
  );
}
