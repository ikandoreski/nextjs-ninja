import { Activity, ArrowUpRight, Sparkles } from "lucide-react";

import { AdminShell } from "@/components/admin/admin-shell";
import { MetricCard } from "@/components/admin/metric-card";
import { ModuleCard } from "@/components/admin/module-card";
import { getDashboardSummary, getProducts } from "@/lib/admin-queries";
import {
  activityFeed,
  spotlightModules,
} from "@/lib/admin-data";

export default async function DashboardPage() {
  const [summary, productRows] = await Promise.all([
    getDashboardSummary(),
    getProducts(),
  ]);

  const dashboardMetrics = [
    {
      label: "Order Masuk",
      value: String(summary.totalOrders),
      detail: "Total order toko yang sudah masuk ke sistem",
      tone: "red" as const,
    },
    {
      label: "Booking Aktif",
      value: String(summary.activeBookings),
      detail: "Booking dengan status booked atau check-in",
      tone: "gold" as const,
    },
    {
      label: "Produk Stok Kritis",
      value: String(summary.criticalProducts),
      detail: "Produk dengan stok 4 atau kurang",
      tone: "zinc" as const,
    },
    {
      label: "Review Unggulan",
      value: String(summary.featuredReviews),
      detail: "Ulasan toko yang ditandai sebagai unggulan",
      tone: "green" as const,
    },
  ];

  return (
    <AdminShell
      title="Dashboard Operasional"
      description="Pantau metrik utama Ninja388, status bisnis harian, dan modul prioritas tanpa menyentuh website publik yang sedang aktif."
      currentPath="/dashboard"
    >
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-6">
          <section className="grid gap-4 md:grid-cols-2 2xl:grid-cols-4">
            {dashboardMetrics.map((metric) => (
              <MetricCard key={metric.label} {...metric} />
            ))}
          </section>

          <section className="grid gap-6 xl:grid-cols-3">
            {spotlightModules.map((module) => (
              <ModuleCard key={module.title} {...module} />
            ))}
          </section>

          <section className="rounded-[28px] border border-white/10 bg-zinc-950/80 p-6 shadow-[0_24px_80px_rgba(0,0,0,0.22)]">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.28em] text-amber-300">
                  Produk Paling Butuh Perhatian
                </p>
                <h2 className="mt-2 text-2xl font-bold tracking-tight">
                  Stok, harga, dan posisi katalog
                </h2>
              </div>
              <button className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-zinc-300 transition hover:bg-white/10">
                Lihat semua produk
                <ArrowUpRight className="size-4" />
              </button>
            </div>

            <div className="mt-6 overflow-hidden rounded-3xl border border-white/10">
              <table className="min-w-full divide-y divide-white/10 text-left text-sm">
                <thead className="bg-white/[0.04] text-zinc-400">
                  <tr>
                    <th className="px-4 py-3 font-medium">Produk</th>
                    <th className="px-4 py-3 font-medium">Kategori</th>
                    <th className="px-4 py-3 font-medium">Harga</th>
                    <th className="px-4 py-3 font-medium">Stok</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 bg-black/20">
                  {productRows.map((product) => (
                    <tr key={product.sku} className="hover:bg-white/[0.03]">
                      <td className="px-4 py-4 font-medium text-white">
                        {product.name}
                      </td>
                      <td className="px-4 py-4 text-zinc-400">{product.category}</td>
                      <td className="px-4 py-4 text-zinc-300">{product.price}</td>
                      <td className="px-4 py-4 text-zinc-300">{product.stock}</td>
                      <td className="px-4 py-4">
                        <span className="rounded-full border border-amber-300/20 bg-amber-300/10 px-3 py-1 text-xs uppercase tracking-[0.24em] text-amber-200">
                          {product.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>

        <aside className="space-y-6">
          <section className="rounded-[28px] border border-white/10 bg-zinc-950/80 p-6 shadow-[0_24px_80px_rgba(0,0,0,0.22)]">
            <div className="flex items-center gap-3">
              <Sparkles className="size-5 text-amber-300" />
              <h2 className="text-xl font-bold">Prioritas Minggu Ini</h2>
            </div>
            <ul className="mt-5 space-y-3 text-sm leading-7 text-zinc-400">
              <li>Sinkronkan stok produk yang paling sering ditanya pelanggan.</li>
              <li>Finalkan struktur station dan durasi booking rental.</li>
              <li>Hubungkan login admin dengan Supabase Auth.</li>
            </ul>
          </section>

          <section className="rounded-[28px] border border-white/10 bg-zinc-950/80 p-6 shadow-[0_24px_80px_rgba(0,0,0,0.22)]">
            <div className="flex items-center gap-3">
              <Activity className="size-5 text-red-300" />
              <h2 className="text-xl font-bold">Aktivitas Terbaru</h2>
            </div>
            <ul className="mt-5 space-y-4">
              {activityFeed.map((item) => (
                <li
                  key={item}
                  className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-4 text-sm leading-7 text-zinc-300"
                >
                  {item}
                </li>
              ))}
            </ul>
          </section>
        </aside>
      </div>
    </AdminShell>
  );
}
