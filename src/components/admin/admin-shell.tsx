import Link from "next/link";
import { Bell, Search } from "lucide-react";
import { clsx } from "clsx";

import { navigationItems } from "@/lib/admin-data";

type AdminShellProps = {
  title: string;
  description: string;
  currentPath: string;
  children: React.ReactNode;
};

export function AdminShell({
  title,
  description,
  currentPath,
  children,
}: AdminShellProps) {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(220,38,38,0.20),transparent_28%),radial-gradient(circle_at_top_right,rgba(251,191,36,0.12),transparent_22%),linear-gradient(180deg,#070707_0%,#0a0a0a_100%)] text-white">
      <div className="mx-auto grid min-h-screen max-w-[1600px] grid-cols-1 xl:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="border-b border-white/10 bg-black/55 px-6 py-8 backdrop-blur xl:border-r xl:border-b-0">
          <Link href="/dashboard" className="flex items-center gap-3">
            <div className="flex size-12 items-center justify-center rounded-2xl border border-red-500/40 bg-red-500/10 text-lg font-bold text-red-200">
              N
            </div>
            <div>
              <p className="text-lg font-semibold tracking-tight">Ninja388 Admin</p>
              <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">
                Control Center
              </p>
            </div>
          </Link>

          <nav className="mt-10 grid gap-2">
            {navigationItems.map((item) => {
              const active =
                currentPath === item.href ||
                currentPath.startsWith(`${item.href}/`);
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={clsx(
                    "flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm transition",
                    active
                      ? "border-amber-300/40 bg-amber-300/10 text-white shadow-[0_0_0_1px_rgba(251,191,36,0.10)]"
                      : "border-transparent bg-white/[0.02] text-zinc-400 hover:border-white/10 hover:bg-white/[0.04] hover:text-white"
                  )}
                >
                  <Icon className="size-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="mt-10 rounded-3xl border border-white/10 bg-zinc-950/70 p-5">
            <p className="text-xs uppercase tracking-[0.28em] text-amber-300">
              Fase Saat Ini
            </p>
            <p className="mt-3 text-sm leading-7 text-zinc-400">
              Website publik tetap aktif. Admin panel ini menjadi pondasi untuk
              operasional dan migrasi bertahap ke arsitektur dinamis.
            </p>
          </div>
        </aside>

        <main className="px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
          <header className="rounded-[28px] border border-white/10 bg-black/35 px-5 py-5 shadow-[0_24px_80px_rgba(0,0,0,0.18)] backdrop-blur">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.28em] text-red-300">
                  Operasional Harian
                </p>
                <h1 className="mt-2 text-3xl font-bold tracking-tight">{title}</h1>
                <p className="mt-2 max-w-2xl text-sm leading-7 text-zinc-400">
                  {description}
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <label className="flex min-w-[260px] items-center gap-3 rounded-full border border-white/10 bg-white/5 px-4 py-3 text-sm text-zinc-400">
                  <Search className="size-4" />
                  <input
                    className="w-full bg-transparent outline-none placeholder:text-zinc-500"
                    placeholder="Cari produk, booking, atau order..."
                  />
                </label>
                <button className="flex items-center justify-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-3 text-sm text-zinc-300 transition hover:bg-white/10">
                  <Bell className="size-4" />
                  4 Notifikasi
                </button>
              </div>
            </div>
          </header>

          <section className="mt-6">{children}</section>
        </main>
      </div>
    </div>
  );
}
