insert into products (
  category_id,
  name,
  slug,
  short_description,
  description,
  price,
  stock,
  sku,
  mpn,
  brand,
  status,
  featured_image_url,
  seo_title,
  seo_description
)
values
  (
    (select id from categories where slug = 'konsol' limit 1),
    'PlayStation 5 Console Disc Edition',
    'playstation-5-console',
    'Konsol resmi untuk gamer yang ingin setup utama dengan performa cepat.',
    'Konsol PlayStation 5 disc edition untuk gamer yang ingin performa generasi terbaru dan dukungan game fisik.',
    9200000,
    6,
    'N388-PS5-001',
    'CFI-1200A',
    'Sony',
    'active',
    'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=high-end%20studio%20product%20photo%20of%20a%20PlayStation%205%20console%20disc%20edition%20standing%20upright%2C%20on%20dark%20matte%20background%2C%20dramatic%20red%20and%20gold%20accent%20lighting%2C%20realistic%2C%20ultra-detailed%2C%201%3A1&image_size=square',
    'PlayStation 5 Console Disc Edition | Ninja388',
    'Beli PlayStation 5 Console Disc Edition di Ninja388.'
  ),
  (
    (select id from categories where slug = 'aksesoris' limit 1),
    'DualSense Wireless Controller',
    'dualsense-wireless-controller',
    'Controller resmi untuk pengalaman main PlayStation 5 yang presisi.',
    'DualSense Wireless Controller untuk gamer yang ingin respons haptic dan kenyamanan genggaman premium.',
    1250000,
    11,
    'N388-ACC-011',
    'CFI-ZCT1G',
    'Sony',
    'active',
    '/assets/dualsense-controller.jpg',
    'DualSense Wireless Controller | Ninja388',
    'Beli DualSense Wireless Controller original di Ninja388.'
  ),
  (
    (select id from categories where slug = 'game-ps5' limit 1),
    'EA Sports FC 26',
    'ea-sports-fc-26',
    'Game sepak bola physical edition untuk PlayStation 5.',
    'Game sepak bola physical edition untuk mode kompetitif dan koleksi game sport terbaru.',
    850000,
    4,
    'N388-GM-026',
    'PS5-EAFC26',
    'EA Sports',
    'active',
    'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=high-end%20studio%20product%20photo%20of%20a%20PlayStation%205%20soccer%20game%20case%20inspired%20by%20EA%20Sports%20FC%20style%20%28no%20logos%2C%20no%20text%29%2C%20generic%20football%20player%20silhouette%20on%20the%20cover%2C%20placed%20on%20dark%20matte%20background%20with%20dramatic%20red%20and%20gold%20rim%20lighting%2C%20realistic%2C%20ultra-detailed%2C%201%3A1&image_size=square',
    'EA Sports FC 26 PS5 Physical Edition | Ninja388',
    'Beli EA Sports FC 26 untuk PlayStation 5 di Ninja388.'
  ),
  (
    (select id from categories where slug = 'sparepart' limit 1),
    'Kipas Pendingin PS5 OEM',
    'kipas-pendingin-ps5-oem',
    'Sparepart pendingin untuk membantu menjaga suhu kerja mesin.',
    'Sparepart kipas pendingin OEM untuk PlayStation 5 yang membantu menjaga sirkulasi udara dan suhu kerja mesin.',
    350000,
    2,
    'N388-SP-005',
    'PS5-FAN-OEM',
    'OEM',
    'active',
    'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=high-end%20studio%20product%20photo%20of%20a%20PS5%20cooling%20fan%20spare%20part%20%28OEM%29%2C%20black%20plastic%20fan%20with%20metallic%20details%2C%20placed%20on%20dark%20matte%20background%20with%20subtle%20red%20and%20gold%20rim%20lighting%2C%20sharp%20focus%2C%20realistic%2C%201%3A1&image_size=square',
    'Kipas Pendingin PS5 OEM | Ninja388',
    'Cari kipas pendingin PS5 OEM untuk sparepart dan perawatan mesin di Ninja388.'
  )
on conflict (slug) do update
set
  category_id = excluded.category_id,
  name = excluded.name,
  short_description = excluded.short_description,
  description = excluded.description,
  price = excluded.price,
  stock = excluded.stock,
  sku = excluded.sku,
  mpn = excluded.mpn,
  brand = excluded.brand,
  status = excluded.status,
  featured_image_url = excluded.featured_image_url,
  seo_title = excluded.seo_title,
  seo_description = excluded.seo_description,
  updated_at = now();

insert into customers (full_name, phone, email)
values
  ('Andre Wijaya', '081234567891', 'andre@example.com'),
  ('Kevin Pratama', '081234567892', 'kevin@example.com'),
  ('Nabila Putri', '081234567893', 'nabila@example.com'),
  ('Rizky Setiawan', '081234567894', 'rizky@example.com'),
  ('Dimas Arga', '081234567895', 'dimas@example.com')
on conflict do nothing;

insert into orders (customer_id, order_code, status, total_amount, notes)
values
  ((select id from customers where email = 'andre@example.com' limit 1), 'ORD-N388-0018', 'diproses', 9200000, 'Order PS5 disc edition'),
  ((select id from customers where email = 'kevin@example.com' limit 1), 'ORD-N388-0019', 'baru', 850000, 'Menunggu konfirmasi pembayaran'),
  ((select id from customers where email = 'nabila@example.com' limit 1), 'ORD-N388-0020', 'dikirim', 1250000, 'DualSense siap dikirim')
on conflict (order_code) do update
set
  customer_id = excluded.customer_id,
  status = excluded.status,
  total_amount = excluded.total_amount,
  notes = excluded.notes,
  updated_at = now();

insert into rental_bookings (
  customer_id,
  station_id,
  queue_code,
  play_date,
  start_time,
  duration_hours,
  status,
  notes
)
values
  (
    (select id from customers where email = 'rizky@example.com' limit 1),
    (select id from ps_stations where code = 'PS5-01' limit 1),
    'N388-A01',
    current_date,
    '19:00',
    2,
    'check_in',
    'Sesi reguler malam'
  ),
  (
    (select id from customers where email = 'dimas@example.com' limit 1),
    (select id from ps_stations where code = 'PS5-03' limit 1),
    'N388-B07',
    current_date,
    '20:00',
    2,
    'booked',
    'Sudah dibooking'
  )
on conflict (queue_code) do update
set
  customer_id = excluded.customer_id,
  station_id = excluded.station_id,
  play_date = excluded.play_date,
  start_time = excluded.start_time,
  duration_hours = excluded.duration_hours,
  status = excluded.status,
  notes = excluded.notes,
  updated_at = now();
