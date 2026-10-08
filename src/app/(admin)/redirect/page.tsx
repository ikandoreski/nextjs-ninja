import { AdminShell } from "@/components/admin/admin-shell";
import { RedirectManager } from "@/components/admin/redirect-manager";
import { getRedirects } from "@/lib/admin-queries";

export default async function RedirectPage() {
  const redirects = await getRedirects();

  return (
    <AdminShell
      title="Redirect URL"
      description="Kelola aturan redirect (301/302) untuk website publik. Perubahan diterapkan saat publish berikutnya."
      currentPath="/redirect"
    >
      <RedirectManager initialRedirects={redirects} />
    </AdminShell>
  );
}
