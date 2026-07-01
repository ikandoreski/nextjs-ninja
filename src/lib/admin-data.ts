import {
  ClipboardList,
  GalleryVerticalEnd,
  LayoutDashboard,
  MessageSquareQuote,
  MonitorCog,
  Package2,
  ReceiptText,
  Settings2,
  ShieldCheck,
} from "lucide-react";

export const navigationItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/produk", label: "Produk", icon: Package2 },
  { href: "/order", label: "Order Toko", icon: ReceiptText },
  { href: "/booking", label: "Booking Rental", icon: ClipboardList },
  { href: "/station", label: "Station PS", icon: MonitorCog },
  { href: "/review", label: "Review", icon: MessageSquareQuote },
  { href: "/konten", label: "Konten", icon: GalleryVerticalEnd },
  { href: "/pengaturan", label: "Pengaturan", icon: Settings2 },
  { href: "/keamanan", label: "Keamanan", icon: ShieldCheck },
];

export const dashboardMetrics = [
  {
    label: "Order Baru Hari Ini",
    value: "18",
    detail: "+6 dibanding kemarin",
    tone: "red",
  },
  {
    label: "Booking Aktif",
    value: "7",
    detail: "3 station sedang dipakai",
    tone: "gold",
  },
  {
    label: "Produk Stok Kritis",
    value: "4",
    detail: "Perlu restock minggu ini",
    tone: "zinc",
  },
  {
    label: "Review Ditampilkan",
    value: "5",
    detail: "3 ulasan unggulan aktif",
    tone: "green",
  },
] as const;

export const spotlightModules = [
  {
    title: "Produk & Stok",
    description:
      "Kelola katalog, harga, gambar, SKU, dan stok dari satu panel tanpa edit HTML manual.",
    actionLabel: "Buka Produk",
    href: "/produk",
  },
  {
    title: "Booking Rental",
    description:
      "Pantau booking masuk, queue code, jam main, dan status check-in pelanggan.",
    actionLabel: "Buka Booking",
    href: "/booking",
  },
  {
    title: "Review & Reputasi",
    description:
      "Simpan review Google bisnis, pilih ulasan unggulan, dan siapkan blok testimoni publik.",
    actionLabel: "Buka Review",
    href: "/review",
  },
];

export const productRows = [
  {
    name: "PlayStation 5 Console Disc Edition",
    category: "Konsol",
    price: "Rp 9.200.000",
    stock: 6,
    status: "Aktif",
    sku: "N388-PS5-001",
  },
  {
    name: "DualSense Wireless Controller",
    category: "Aksesoris",
    price: "Rp 1.250.000",
    stock: 11,
    status: "Aktif",
    sku: "N388-ACC-011",
  },
  {
    name: "EA Sports FC 26",
    category: "Game PS5",
    price: "Rp 850.000",
    stock: 4,
    status: "Stok Menipis",
    sku: "N388-GM-026",
  },
  {
    name: "Kipas Pendingin PS5 OEM",
    category: "Sparepart",
    price: "Rp 350.000",
    stock: 2,
    status: "Stok Kritis",
    sku: "N388-SP-005",
  },
];

export const bookingRows = [
  {
    code: "N388-A01",
    customer: "Rizky Setiawan",
    station: "PS5 Lounge 01",
    schedule: "01 Jul 2026 · 19:00 - 21:00",
    duration: "2 Jam",
    status: "Check-in",
  },
  {
    code: "N388-B07",
    customer: "Dimas Arga",
    station: "PS5 Lounge 03",
    schedule: "01 Jul 2026 · 20:00 - 22:00",
    duration: "2 Jam",
    status: "Booked",
  },
  {
    code: "N388-C11",
    customer: "Ayu Rahma",
    station: "PS5 VIP 02",
    schedule: "01 Jul 2026 · 21:00 - 00:00",
    duration: "3 Jam",
    status: "Booked",
  },
];

export const orderRows = [
  {
    code: "ORD-N388-0018",
    customer: "Andre Wijaya",
    total: "Rp 9.200.000",
    payment: "Lunas",
    shipping: "Diproses",
  },
  {
    code: "ORD-N388-0019",
    customer: "Kevin Pratama",
    total: "Rp 850.000",
    payment: "Menunggu",
    shipping: "Belum Dikirim",
  },
  {
    code: "ORD-N388-0020",
    customer: "Nabila Putri",
    total: "Rp 1.250.000",
    payment: "Lunas",
    shipping: "Dikirim",
  },
];

export const stationRows = [
  {
    name: "PS5 Lounge 01",
    type: "Reguler",
    status: "Dipakai",
    note: "Sesi aktif sampai 21:00",
  },
  {
    name: "PS5 Lounge 02",
    type: "Reguler",
    status: "Tersedia",
    note: "Siap booking",
  },
  {
    name: "PS5 Lounge 03",
    type: "Reguler",
    status: "Booked",
    note: "Mulai 20:00",
  },
  {
    name: "PS5 VIP 02",
    type: "VIP",
    status: "Maintenance",
    note: "Cek kipas pendingin",
  },
];

export const reviewRows = [
  {
    reviewer: "Hijau Tower",
    rating: 5,
    body: "GG Ngab, voucher-nya cengli banget, banyak promo buat first customers...",
    reply: "Terimakasih telah berlangganan bersama Ninja388",
    status: "Unggulan",
  },
  {
    reviewer: "bunga citra atumi",
    rating: 5,
    body: "Asik banget sob, store ini aman dan voucher-nya bikin kalap...",
    reply: "Terimakasih telah berlangganan bersama Ninja388",
    status: "Aktif",
  },
  {
    reviewer: "game gaming",
    rating: 5,
    body: "Gokil, tempatnya mantap, vouchernya murah meriah dan sangat membantu gamer...",
    reply: "Terimakasih telah berlangganan bersama Ninja388",
    status: "Aktif",
  },
];

export const activityFeed = [
  "Admin Toko memperbarui stok EA Sports FC 26 menjadi 4 unit.",
  "Admin Rental mengubah status PS5 Lounge 01 menjadi dipakai.",
  "Admin Konten menandai review Hijau Tower sebagai unggulan.",
  "Super Admin menambahkan CTA promo baru untuk homepage.",
];
