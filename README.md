# Ninja388 Admin Panel

Admin panel operasional untuk Ninja388, dibangun dengan:

- Next.js App Router
- Supabase Auth + PostgreSQL
- API publik untuk sinkronisasi website statis di `app/public`

## Local Development

Jalankan dari folder ini:

```bash
npm install
npm run dev
```

Admin panel lokal:

- `http://localhost:3001/login`

Pastikan environment berikut tersedia:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `BOOTSTRAP_ADMIN_EMAIL`
- `BOOTSTRAP_ADMIN_PASSWORD`

Contoh ada di [`.env.example`](file:///C:/Users/USER/Local%20Sites/ninja-rental-ps/app/admin-panel/.env.example).

## Validasi

Untuk cek lint + build:

```bash
npm run check
```

Untuk bootstrap akun admin:

```bash
npm run bootstrap-admin
```

## Deploy Produksi

Untuk kondisi tanpa Blaze plan Firebase, jalur yang disarankan sekarang adalah:

- website publik tetap di Firebase Hosting
- admin panel deploy ke Vercel

Panduan Vercel ada di [VERCEL-DEPLOY.md](file:///C:/Users/USER/Local%20Sites/ninja-rental-ps/VERCEL-DEPLOY.md).

Kalau suatu saat ingin pindah lagi ke Firebase App Hosting, konfigurasi awalnya tetap tersedia di [apphosting.yaml](file:///C:/Users/USER/Local%20Sites/ninja-rental-ps/app/admin-panel/apphosting.yaml) dan panduan lama ada di [FIREBASE-DEPLOY.md](file:///C:/Users/USER/Local%20Sites/ninja-rental-ps/FIREBASE-DEPLOY.md).

## Catatan Arsitektur

- Admin panel tetap memakai Supabase sebagai backend utama.
- Firebase dipakai sebagai hosting layer untuk deploy produksi.
- Website publik statis mengambil data live dari endpoint admin panel seperti:
  - `/api/public/pages/home`
  - `/api/public/products`
  - `/api/public/reviews`
  - `/api/public/stations`
