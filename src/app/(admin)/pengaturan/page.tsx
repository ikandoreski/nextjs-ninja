import { AdminShell } from "@/components/admin/admin-shell";
import { SettingsManager } from "@/components/admin/settings-manager";
import { getBusinessSettings } from "@/lib/admin-queries";

export default async function PengaturanPage() {
  const settings = await getBusinessSettings();

  return (
    <AdminShell
      title="Pengaturan Bisnis"
      description="Kelola identitas brand, jalur kontak, dan pengaturan operasional utama yang akan dipakai lintas modul."
      currentPath="/pengaturan"
    >
      <SettingsManager initialSettings={settings} />
    </AdminShell>
  );
}
