import { AdminShell } from "@/components/admin/admin-shell";
import { MediaManager } from "@/components/admin/media-manager";
import { getMediaAssets } from "@/lib/admin-queries";

type MediaPageProps = {
  searchParams?: Promise<{
    page?: string;
    pageSize?: string;
  }>;
};

export default async function MediaPage({ searchParams }: MediaPageProps) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const page = Number(resolvedSearchParams.page ?? "1");
  const pageSize = Number(resolvedSearchParams.pageSize ?? "20");
  const mediaAssets = await getMediaAssets(page, pageSize).catch((error) => ({
    items: [],
    page: Number.isFinite(page) ? page : 1,
    pageSize: Number.isFinite(pageSize) ? pageSize : 20,
    totalItems: 0,
    totalPages: 1,
    errorMessage:
      error instanceof Error
        ? `Galeri media belum bisa dimuat: ${error.message}`
        : "Galeri media belum bisa dimuat saat ini.",
  }));

  return (
    <AdminShell
      title="Media Ninja388"
      description="Upload gambar ke Supabase Storage dan gunakan URL resmi untuk blog atau produk."
      currentPath="/media"
    >
      <MediaManager mediaAssets={mediaAssets} />
    </AdminShell>
  );
}
