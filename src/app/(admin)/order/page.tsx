import { AdminShell } from "@/components/admin/admin-shell";
import { OrderManager } from "@/components/admin/order-manager";
import { getCustomerOptions, getOrders } from "@/lib/admin-queries";

export default async function OrderPage() {
  const [orderRows, customers] = await Promise.all([getOrders(), getCustomerOptions()]);

  return (
    <AdminShell
      title="Order Toko"
      description="Kelola pesanan masuk, status pembayaran, dan progres pengiriman dari satu panel yang terhubung ke katalog."
      currentPath="/order"
    >
      <OrderManager initialOrders={orderRows} customers={customers} />
    </AdminShell>
  );
}
