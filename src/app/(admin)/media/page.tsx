import { AdminShell } from "@/components/admin/admin-shell";
import { MediaManager } from "@/components/admin/media-manager";

export default async function MediaPage() {
  return (
    <AdminShell
      title="Media Ninja388"
      description="Upload gambar ke Firebase Storage dan gunakan URL resmi untuk blog atau produk."
      currentPath="/media"
    >
      <MediaManager />
    </AdminShell>
  );
}
