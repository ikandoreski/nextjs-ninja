import { AdminShell } from "@/components/admin/admin-shell";

export default function KeamananPage() {
  return (
    <AdminShell
      title="Keamanan & Akses"
      description="Siapkan role admin, audit log, dan kebijakan akses sebelum panel dihubungkan ke login produksi."
      currentPath="/keamanan"
    >
      <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <article className="rounded-[28px] border border-white/10 bg-zinc-950/80 p-6 shadow-[0_24px_80px_rgba(0,0,0,0.22)]">
          <p className="text-xs uppercase tracking-[0.28em] text-red-300">
            Role yang Direncanakan
          </p>
          <div className="mt-5 overflow-hidden rounded-3xl border border-white/10">
            <table className="min-w-full divide-y divide-white/10 text-left text-sm">
              <thead className="bg-white/[0.04] text-zinc-400">
                <tr>
                  <th className="px-4 py-3 font-medium">Role</th>
                  <th className="px-4 py-3 font-medium">Hak Akses</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 bg-black/20">
                {[
                  ["Super Admin", "Akses penuh ke semua modul dan pengaturan."],
                  ["Admin Toko", "Kelola produk, order, dan review."],
                  ["Admin Rental", "Kelola booking, station, dan sesi main."],
                  ["Admin Konten", "Kelola halaman, CTA, FAQ, dan metadata."],
                ].map(([role, access]) => (
                  <tr key={role}>
                    <td className="px-4 py-4 font-medium text-white">{role}</td>
                    <td className="px-4 py-4 text-zinc-400">{access}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>

        <article className="rounded-[28px] border border-white/10 bg-zinc-950/80 p-6 shadow-[0_24px_80px_rgba(0,0,0,0.22)]">
          <p className="text-xs uppercase tracking-[0.28em] text-amber-300">
            Integrasi Berikutnya
          </p>
          <ul className="mt-5 space-y-3 text-sm leading-7 text-zinc-400">
            <li>Supabase Auth untuk login admin yang aman.</li>
            <li>Middleware proteksi route admin.</li>
            <li>Audit log untuk semua perubahan sensitif.</li>
            <li>Role-based access control per modul.</li>
          </ul>
        </article>
      </section>
    </AdminShell>
  );
}
