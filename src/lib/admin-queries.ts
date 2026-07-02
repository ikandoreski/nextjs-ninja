import "server-only";

import { getSupabaseAdminClient } from "@/lib/supabase-admin";

export async function getDashboardSummary() {
  const supabase = getSupabaseAdminClient();

  const [
    { count: totalOrders },
    { count: activeBookings },
    { count: criticalProducts },
    { count: featuredReviews },
  ] = await Promise.all([
    supabase.from("orders").select("*", { count: "exact", head: true }),
    supabase
      .from("rental_bookings")
      .select("*", { count: "exact", head: true })
      .in("status", ["booked", "check_in"]),
    supabase
      .from("products")
      .select("*", { count: "exact", head: true })
      .lte("stock", 4),
    supabase
      .from("business_reviews")
      .select("*", { count: "exact", head: true })
      .eq("is_featured", true),
  ]);

  return {
    totalOrders: totalOrders ?? 0,
    activeBookings: activeBookings ?? 0,
    criticalProducts: criticalProducts ?? 0,
    featuredReviews: featuredReviews ?? 0,
  };
}

export async function getProducts() {
  const supabase = getSupabaseAdminClient();
  const [{ data, error }, { data: categories, error: categoriesError }] =
    await Promise.all([
      supabase
        .from("products")
        .select(
          "id, category_id, name, slug, short_description, description, price, stock, sku, mpn, brand, status, featured_image_url, seo_title, seo_description"
        )
        .order("created_at", { ascending: false }),
      supabase.from("categories").select("id, name"),
    ]);

  if (error || categoriesError) {
    throw error ?? categoriesError;
  }

  const categoryMap = new Map((categories ?? []).map((item) => [item.id, item.name]));

  return (data ?? []).map((product) => ({
    id: product.id,
    categoryId: product.category_id,
    slug: product.slug,
    name: product.name,
    category: categoryMap.get(product.category_id ?? "") ?? "Tanpa Kategori",
    shortDescription: product.short_description ?? "",
    description: product.description ?? "",
    rawPrice: Number(product.price),
    price: `Rp ${Number(product.price).toLocaleString("id-ID")}`,
    stock: product.stock,
    mpn: product.mpn ?? "",
    brand: product.brand ?? "",
    rawStatus: product.status,
    status:
      product.stock <= 2
        ? "Stok Kritis"
        : product.stock <= 4
          ? "Stok Menipis"
          : product.status === "active"
            ? "Aktif"
            : product.status,
    sku: product.sku,
    featuredImageUrl: product.featured_image_url ?? "",
    seoTitle: product.seo_title ?? "",
    seoDescription: product.seo_description ?? "",
  }));
}

export async function getCategories() {
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from("categories")
    .select("id, name, slug")
    .order("name", { ascending: true });

  if (error) {
    throw error;
  }

  return data ?? [];
}

export async function getBlogPosts() {
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from("blog_posts")
    .select(
      "id, slug, title, excerpt, content_markdown, thumbnail_url, status, updated_at, created_at"
    )
    .order("updated_at", { ascending: false });

  if (error) {
    throw error;
  }

  return (data ?? []).map((post) => ({
    id: post.id,
    slug: post.slug,
    title: post.title,
    excerpt: post.excerpt ?? "",
    contentMarkdown: post.content_markdown ?? "",
    thumbnailUrl: post.thumbnail_url ?? "",
    status: post.status,
    updatedAt: post.updated_at,
    createdAt: post.created_at,
  }));
}

export type MediaAssetRow = {
  path: string;
  url: string;
  contentType: string;
  size: number;
  createdAt: string | null;
  updatedAt: string | null;
};

export async function getMediaAssets(page = 1, pageSize = 20) {
  const supabase = getSupabaseAdminClient();
  const bucketName = process.env.SUPABASE_MEDIA_BUCKET || "media";
  const safePage = Math.max(1, Math.trunc(page) || 1);
  const safePageSize = Math.min(20, Math.max(10, Math.trunc(pageSize) || 20));
  const from = (safePage - 1) * safePageSize;
  const to = from + safePageSize - 1;

  const { data, error, count } = await supabase
    .schema("storage")
    .from("objects")
    .select("name, metadata, created_at, updated_at", { count: "exact" })
    .eq("bucket_id", bucketName)
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) {
    throw error;
  }

  const items = (data ?? []).map((item) => {
    const metadata =
      item.metadata && typeof item.metadata === "object"
        ? (item.metadata as Record<string, unknown>)
        : {};
    const {
      data: { publicUrl },
    } = supabase.storage.from(bucketName).getPublicUrl(item.name);

    return {
      path: item.name,
      url: publicUrl,
      contentType: String(metadata.mimetype ?? metadata.contentType ?? "image/*"),
      size: Number(metadata.size ?? 0),
      createdAt: item.created_at ?? null,
      updatedAt: item.updated_at ?? null,
    };
  });

  return {
    items,
    page: safePage,
    pageSize: safePageSize,
    totalItems: count ?? 0,
    totalPages: Math.max(1, Math.ceil((count ?? 0) / safePageSize)),
  };
}

export async function getOrders() {
  const supabase = getSupabaseAdminClient();
  const [{ data, error }, { data: customers, error: customersError }] =
    await Promise.all([
      supabase
        .from("orders")
        .select("id, customer_id, order_code, status, total_amount, notes")
        .order("created_at", { ascending: false }),
      supabase.from("customers").select("id, full_name"),
    ]);

  if (error || customersError) {
    throw error ?? customersError;
  }

  const customerMap = new Map((customers ?? []).map((item) => [item.id, item.full_name]));

  return (data ?? []).map((order) => ({
    id: order.id,
    customerId: order.customer_id,
    code: order.order_code,
    customer: customerMap.get(order.customer_id ?? "") ?? "Pelanggan",
    rawTotalAmount: Number(order.total_amount),
    rawStatus: order.status,
    notes: order.notes ?? "",
    total: `Rp ${Number(order.total_amount).toLocaleString("id-ID")}`,
    payment: order.status === "baru" ? "Menunggu" : "Lunas",
    shipping:
      order.status === "dikirim"
        ? "Dikirim"
        : order.status === "diproses"
          ? "Diproses"
          : "Belum Dikirim",
  }));
}

export async function getBookings() {
  const supabase = getSupabaseAdminClient();
  const [
    { data, error },
    { data: customers, error: customersError },
    { data: stations, error: stationsError },
  ] = await Promise.all([
    supabase
      .from("rental_bookings")
      .select(
        "id, customer_id, station_id, queue_code, play_date, start_time, duration_hours, status, notes"
      )
      .order("play_date", { ascending: true }),
    supabase.from("customers").select("id, full_name"),
    supabase.from("ps_stations").select("id, name"),
  ]);

  if (error || customersError || stationsError) {
    throw error ?? customersError ?? stationsError;
  }

  const customerMap = new Map((customers ?? []).map((item) => [item.id, item.full_name]));
  const stationMap = new Map((stations ?? []).map((item) => [item.id, item.name]));

  return (data ?? []).map((booking) => {
    const playDate = new Date(booking.play_date);
    return {
      id: booking.id,
      code: booking.queue_code,
      customerId: booking.customer_id,
      stationId: booking.station_id,
      customer: customerMap.get(booking.customer_id ?? "") ?? "Pelanggan",
      station: stationMap.get(booking.station_id ?? "") ?? "Station",
      playDate: booking.play_date,
      startTime: booking.start_time.slice(0, 5),
      durationHours: booking.duration_hours,
      rawStatus: booking.status,
      notes: booking.notes ?? "",
      schedule: `${playDate.toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })} · ${booking.start_time.slice(0, 5)}`,
      duration: `${booking.duration_hours} Jam`,
      status:
        booking.status === "check_in"
          ? "Check-in"
          : booking.status === "selesai"
            ? "Selesai"
            : booking.status === "batal"
              ? "Batal"
              : "Booked",
    };
  });
}

export async function getStations() {
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from("ps_stations")
    .select("id, code, name, status, notes")
    .order("code", { ascending: true });

  if (error) {
    throw error;
  }

  return (data ?? []).map((product) => ({
    id: product.id,
    code: product.code,
    name: product.name,
    type: product.code.startsWith("VIP") ? "VIP" : "Reguler",
    rawStatus: product.status,
    status:
      product.status === "full"
        ? "Booked"
        : product.status === "dipakai"
          ? "Dipakai"
          : product.status === "maintenance"
            ? "Maintenance"
            : "Tersedia",
    note: product.notes ?? "Belum ada catatan",
  }));
}

export async function getCustomerOptions() {
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from("customers")
    .select("id, full_name, phone")
    .order("full_name", { ascending: true });

  if (error) {
    throw error;
  }

  return data ?? [];
}

export async function getReviews() {
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from("business_reviews")
    .select("id, reviewer_name, rating, review_body, owner_reply, is_featured")
    .order("created_at", { ascending: true });

  if (error) {
    throw error;
  }

  return (data ?? []).map((review) => ({
    id: review.id,
    reviewer: review.reviewer_name,
    rating: review.rating,
    body: review.review_body,
    reply: review.owner_reply ?? "",
    isFeatured: review.is_featured,
    status: review.is_featured ? "Unggulan" : "Aktif",
  }));
}

type JsonRecord = Record<string, unknown>;

type PublicationMode = "draft" | "published";

function getDefaultHomepageContent() {
  return {
    hero: {
      eyebrow: "Game Shop & Rental PS Premium",
      headingLine1: "Pengalaman Gaming",
      headingLine2: "Premium Di Tangan Anda.",
      highlight: "Gaming",
      description:
        "Belanja gear & game original, sparepart, dan aksesoris dengan pengiriman seluruh Indonesia. Booking slot main PS juga bisa dilakukan lebih cepat dan rapi.",
      primaryCtaLabel: "Booking PS Sekarang",
      primaryCtaHref: "/rental-ps/",
      secondaryCtaLabel: "Jelajahi Toko",
      secondaryCtaHref: "/katalog/",
    },
    seo: {
      metaTitle: "Ninja388 | Rental PS, Game Shop, Aksesori & Sparepart",
      metaDescription:
        "Ninja388 menyediakan rental PS premium, game PS5, aksesoris, dan sparepart dengan pengiriman seluruh Indonesia.",
      canonicalUrl: "https://www.ninja388.com/",
      ampUrl: "https://ampninja.org/amp/",
      ogTitle: "Ninja388 | Rental PS, Game Shop, Aksesori & Sparepart",
      ogDescription:
        "Belanja gear & game original, sparepart, dan aksesoris dengan pengiriman seluruh Indonesia.",
    },
  };
}

function getDefaultBusinessSettings() {
  return {
    brandName: "Ninja388",
    domainUrl: "https://www.ninja388.com/",
    ampUrl: "https://ampninja.org/amp/",
    whatsappNumber: "6285959781473",
    phoneDisplay: "0859-5978-1473",
    addressLines:
      "Jl. Gajah Mada No.55\nBenua Melayu Darat\nPontianak Selatan\nKalimantan Barat 78124",
    mapsUrl:
      "https://www.google.com/maps/place/Ninja388/@-0.0366125,109.3395039,17z/data=!4m14!1m7!3m6!1s0x2e1d59ea1e7c79bd:0x23ab65a0802c86c6!2sNinja388!8m2!3d-0.0366179!4d109.3420788!16s%2Fg%2F11ml2n230z!3m5!1s0x2e1d59ea1e7c79bd:0x23ab65a0802c86c6!8m2!3d-0.0366179!4d109.3420788!16s%2Fg%2F11ml2n230z?entry=ttu&g_ep=EgoyMDI2MDYyOC4wIKXMDSoASAFQAw%3D%3D",
    instagramUrl: "https://instagram.com/ninja388",
    facebookUrl: "https://facebook.com/ninja388",
    tiktokUrl: "https://tiktok.com/@ninja388",
    youtubeUrl: "https://youtube.com/@ninja388",
    customHeadScripts: "",
    customFooterScripts: "",
  };
}

function mapHomepagePayload(payload: JsonRecord) {
  const defaults = getDefaultHomepageContent();
  const hero = (payload.hero ?? {}) as JsonRecord;
  const seo = (payload.seo ?? {}) as JsonRecord;

  return {
    hero: {
      eyebrow: String(hero.eyebrow ?? defaults.hero.eyebrow),
      headingLine1: String(hero.headingLine1 ?? defaults.hero.headingLine1),
      headingLine2: String(hero.headingLine2 ?? defaults.hero.headingLine2),
      highlight: String(hero.highlight ?? defaults.hero.highlight),
      description: String(hero.description ?? defaults.hero.description),
      primaryCtaLabel: String(hero.primaryCtaLabel ?? defaults.hero.primaryCtaLabel),
      primaryCtaHref: String(hero.primaryCtaHref ?? defaults.hero.primaryCtaHref),
      secondaryCtaLabel: String(
        hero.secondaryCtaLabel ?? defaults.hero.secondaryCtaLabel
      ),
      secondaryCtaHref: String(hero.secondaryCtaHref ?? defaults.hero.secondaryCtaHref),
    },
    seo: {
      metaTitle: String(seo.metaTitle ?? defaults.seo.metaTitle),
      metaDescription: String(seo.metaDescription ?? defaults.seo.metaDescription),
      canonicalUrl: String(seo.canonicalUrl ?? defaults.seo.canonicalUrl),
      ampUrl: String(seo.ampUrl ?? defaults.seo.ampUrl),
      ogTitle: String(seo.ogTitle ?? defaults.seo.ogTitle),
      ogDescription: String(seo.ogDescription ?? defaults.seo.ogDescription),
    },
  };
}

function mapBusinessPayload(payload: JsonRecord) {
  const defaults = getDefaultBusinessSettings();

  return {
    brandName: String(payload.brandName ?? defaults.brandName),
    domainUrl: String(payload.domainUrl ?? defaults.domainUrl),
    ampUrl: String(payload.ampUrl ?? defaults.ampUrl),
    whatsappNumber: String(payload.whatsappNumber ?? defaults.whatsappNumber),
    phoneDisplay: String(payload.phoneDisplay ?? defaults.phoneDisplay),
    addressLines: String(payload.addressLines ?? defaults.addressLines),
    mapsUrl: String(payload.mapsUrl ?? defaults.mapsUrl),
    instagramUrl: String(payload.instagramUrl ?? defaults.instagramUrl),
    facebookUrl: String(payload.facebookUrl ?? defaults.facebookUrl),
    tiktokUrl: String(payload.tiktokUrl ?? defaults.tiktokUrl),
    youtubeUrl: String(payload.youtubeUrl ?? defaults.youtubeUrl),
    customHeadScripts: String(payload.customHeadScripts ?? defaults.customHeadScripts),
    customFooterScripts: String(
      payload.customFooterScripts ?? defaults.customFooterScripts
    ),
  };
}

export async function getHomepageContent(mode: PublicationMode = "draft") {
  const supabase = getSupabaseAdminClient();
  if (mode === "published") {
    const { data, error } = await supabase
      .from("page_publications")
      .select("payload")
      .eq("page_key", "home")
      .maybeSingle();

    if (error) {
      throw error;
    }

    if (!data?.payload) {
      return getDefaultHomepageContent();
    }

    return mapHomepagePayload((data.payload ?? {}) as JsonRecord);
  }

  const pageKey = "home";
  const { data: page, error: pageError } = await supabase
    .from("pages")
    .select("id")
    .eq("page_key", pageKey)
    .maybeSingle();

  if (pageError) {
    throw pageError;
  }

  if (!page) {
    return getDefaultHomepageContent();
  }

  const [{ data: blocks, error: blockError }, { data: seo, error: seoError }] =
    await Promise.all([
      supabase
        .from("page_blocks")
        .select("block_key, content")
        .eq("page_id", page.id)
        .in("block_key", ["hero"]),
      supabase
        .from("page_seo")
        .select(
          "meta_title, meta_description, canonical_url, amp_url, og_title, og_description"
        )
        .eq("page_id", page.id)
        .maybeSingle(),
    ]);

  if (blockError || seoError) {
    throw blockError ?? seoError;
  }

  const blockMap = new Map(
    (blocks ?? []).map((block) => [block.block_key, (block.content ?? {}) as JsonRecord])
  );
  const hero = blockMap.get("hero") ?? {};
  return mapHomepagePayload({
    hero,
    seo: {
      metaTitle: seo?.meta_title,
      metaDescription: seo?.meta_description,
      canonicalUrl: seo?.canonical_url,
      ampUrl: seo?.amp_url,
      ogTitle: seo?.og_title,
      ogDescription: seo?.og_description,
    },
  });
}

export async function getBusinessSettings(mode: PublicationMode = "draft") {
  const supabase = getSupabaseAdminClient();
  if (mode === "published") {
    const { data, error } = await supabase
      .from("page_publications")
      .select("payload")
      .eq("page_key", "global-settings")
      .maybeSingle();

    if (error) {
      throw error;
    }

    if (!data?.payload) {
      return getDefaultBusinessSettings();
    }

    return mapBusinessPayload((data.payload ?? {}) as JsonRecord);
  }

  const pageKey = "global-settings";
  const { data: page, error: pageError } = await supabase
    .from("pages")
    .select("id")
    .eq("page_key", pageKey)
    .maybeSingle();

  if (pageError) {
    throw pageError;
  }

  if (!page) {
    return getDefaultBusinessSettings();
  }

  const { data: block, error: blockError } = await supabase
    .from("page_blocks")
    .select("content")
    .eq("page_id", page.id)
    .eq("block_key", "business")
    .maybeSingle();

  if (blockError) {
    throw blockError;
  }

  return mapBusinessPayload((block?.content ?? {}) as JsonRecord);
}

export async function getPublishedProducts() {
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from("published_products")
    .select(
      "product_id, category_id, name, slug, short_description, description, price, stock, sku, mpn, brand, status, featured_image_url, seo_title, seo_description"
    )
    .order("published_at", { ascending: false });

  if (error) {
    throw error;
  }

  return data ?? [];
}
