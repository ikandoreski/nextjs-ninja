import { AdminShell } from "@/components/admin/admin-shell";
import { ContentManager } from "@/components/admin/content-manager";
import { getHomepageContent } from "@/lib/admin-queries";

export default async function KontenPage() {
  const homepageContent = await getHomepageContent();

  return (
    <AdminShell
      title="Konten Website"
      description="Siapkan manajemen blok konten, CTA, FAQ, dan metadata halaman tanpa perlu edit file statis secara langsung."
      currentPath="/konten"
    >
      <ContentManager initialContent={homepageContent} />
    </AdminShell>
  );
}
