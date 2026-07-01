import { AdminShell } from "@/components/admin/admin-shell";
import { StationManager } from "@/components/admin/station-manager";
import { getStations } from "@/lib/admin-queries";

export default async function StationPage() {
  const stationRows = await getStations();

  return (
    <AdminShell
      title="Station PS"
      description="Kelola status tiap station agar operasional rental lebih cepat, konsisten, dan siap dihubungkan ke queue live."
      currentPath="/station"
    >
      <StationManager initialStations={stationRows} />
    </AdminShell>
  );
}
