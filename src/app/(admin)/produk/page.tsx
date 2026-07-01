import { AdminShell } from "@/components/admin/admin-shell";
import { ProductManager } from "@/components/admin/product-manager";
import { getCategories, getProducts } from "@/lib/admin-queries";

export default async function ProdukPage() {
  const [productRows, categories] = await Promise.all([
    getProducts(),
    getCategories(),
  ]);

  return (
    <AdminShell
      title="Manajemen Produk"
      description="Kelola katalog Ninja388 dari satu tempat: harga, stok, SKU, status tayang, dan kesiapan migrasi halaman publik."
      currentPath="/produk"
    >
      <ProductManager initialProducts={productRows} categories={categories} />
    </AdminShell>
  );
}
