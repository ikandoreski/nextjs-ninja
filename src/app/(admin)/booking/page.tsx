import { AdminShell } from "@/components/admin/admin-shell";
import { BookingManager } from "@/components/admin/booking-manager";
import { getBookings, getCustomerOptions, getStations } from "@/lib/admin-queries";

export default async function BookingPage() {
  const [bookingRows, customers, stations] = await Promise.all([
    getBookings(),
    getCustomerOptions(),
    getStations(),
  ]);

  return (
    <AdminShell
      title="Booking Rental"
      description="Pantau queue code, station, waktu main, dan status check-in dari satu alur operasional yang rapi."
      currentPath="/booking"
    >
      <BookingManager
        initialBookings={bookingRows}
        customers={customers}
        stations={stations}
      />
    </AdminShell>
  );
}
