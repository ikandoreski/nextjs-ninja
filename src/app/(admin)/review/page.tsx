import { AdminShell } from "@/components/admin/admin-shell";
import { ReviewManager } from "@/components/admin/review-manager";
import { getReviews } from "@/lib/admin-queries";

export default async function ReviewPage() {
  const reviewRows = await getReviews();

  return (
    <AdminShell
      title="Review & Reputasi"
      description="Pilih ulasan bisnis yang akan ditampilkan di website publik dan siapkan data untuk schema organisasi secara konsisten."
      currentPath="/review"
    >
      <ReviewManager initialReviews={reviewRows} />
    </AdminShell>
  );
}
