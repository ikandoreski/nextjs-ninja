import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { resolve } from "node:path";

import { createClient } from "@supabase/supabase-js";
import ws from "ws";

function loadEnv() {
  const envPath = resolve(process.cwd(), ".env.local");
  if (!existsSync(envPath)) {
    throw new Error(".env.local tidak ditemukan.");
  }

  const content = readFileSync(envPath, "utf8");
  const lines = content.split(/\r?\n/);

  for (const line of lines) {
    if (!line || line.trim().startsWith("#")) continue;
    const separatorIndex = line.indexOf("=");
    if (separatorIndex < 0) continue;
    const key = line.slice(0, separatorIndex).trim();
    const value = line.slice(separatorIndex + 1).trim();
    if (key && value && !process.env[key]) {
      process.env[key] = value;
    }
  }
}

function createSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Konfigurasi Supabase belum lengkap di .env.local.");
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
    realtime: {
      transport: ws,
    },
  });
}

function ensureTrailingSlash(value, fallback) {
  const nextValue = String(value || fallback || "").trim();
  if (!nextValue) {
    return "";
  }

  return nextValue.endsWith("/") ? nextValue : `${nextValue}/`;
}

function normalizeAbsoluteUrl(value, fallback) {
  const safeFallback = String(fallback || "https://www.ninja388.com/").trim();
  const nextValue = String(value || "").trim();

  if (!nextValue) {
    return safeFallback;
  }

  try {
    return new URL(nextValue, safeFallback).toString();
  } catch {
    return safeFallback;
  }
}

function normalizeCanonicalUrl(value, fallback) {
  const normalized = normalizeAbsoluteUrl(value, fallback);
  return normalized.endsWith("/") ? normalized : `${normalized}/`;
}

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function replaceTagTextById(html, tagName, id, value) {
  const pattern = new RegExp(
    `(<${tagName}\\b[^>]*\\bid="${escapeRegex(id)}"[^>]*>)([\\s\\S]*?)(</${tagName}>)`,
    "i"
  );

  return html.replace(pattern, `$1${escapeHtml(value)}$3`);
}

function replaceAttributeById(html, tagName, id, attributeName, value) {
  const pattern = new RegExp(
    `(<${tagName}\\b[^>]*\\bid="${escapeRegex(id)}"[^>]*\\b${attributeName}=")([^"]*)(")`,
    "i"
  );

  return html.replace(pattern, `$1${escapeHtml(value)}$3`);
}

function replaceJsonScriptById(html, id, data) {
  const pattern = new RegExp(
    `(<script\\b[^>]*\\bid="${escapeRegex(id)}"[^>]*type="application/ld\\+json"[^>]*>)([\\s\\S]*?)(</script>)`,
    "i"
  );

  return html.replace(pattern, `$1\n${JSON.stringify(data, null, 2)}\n    $3`);
}

function replaceOrInsertBetweenMarkers(html, startMarker, endMarker, content, closingTag) {
  const normalizedContent = String(content || "").trim();
  const block = normalizedContent
    ? `${startMarker}\n${normalizedContent}\n${endMarker}`
    : `${startMarker}\n${endMarker}`;

  if (html.includes(startMarker) && html.includes(endMarker)) {
    const pattern = new RegExp(
      `${escapeRegex(startMarker)}[\\s\\S]*?${escapeRegex(endMarker)}`,
      "i"
    );
    return html.replace(pattern, block);
  }

  return html.replace(closingTag, `${block}\n${closingTag}`);
}

function injectCustomScripts(html, business) {
  let nextHtml = html;
  nextHtml = replaceOrInsertBetweenMarkers(
    nextHtml,
    "<!-- CUSTOM_HEAD_SCRIPTS_START -->",
    "<!-- CUSTOM_HEAD_SCRIPTS_END -->",
    business?.customHeadScripts || "",
    "</head>"
  );
  nextHtml = replaceOrInsertBetweenMarkers(
    nextHtml,
    "<!-- CUSTOM_FOOTER_SCRIPTS_START -->",
    "<!-- CUSTOM_FOOTER_SCRIPTS_END -->",
    business?.customFooterScripts || "",
    "</body>"
  );

  return nextHtml;
}

function setProductSlugInHtml(html, slug) {
  return html.replace(/data-product-slug="[^"]*"/i, `data-product-slug="${escapeHtml(slug)}"`);
}

function listHtmlFiles(rootPath) {
  const entries = readdirSync(rootPath, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    if (entry.name === "node_modules" || entry.name === ".trae" || entry.name === ".git") {
      continue;
    }

    const entryPath = resolve(rootPath, entry.name);
    if (entry.isDirectory()) {
      files.push(...listHtmlFiles(entryPath));
      continue;
    }

    if (entry.isFile() && entry.name.toLowerCase().endsWith(".html")) {
      files.push(entryPath);
    }
  }

  return files;
}

function ensureProductTemplate(publicRoot, slug) {
  const productPath = resolve(publicRoot, "produk", slug, "index.html");
  if (existsSync(productPath)) {
    return productPath;
  }

  const productRoot = resolve(publicRoot, "produk");
  const templateDir = readdirSync(productRoot, { withFileTypes: true }).find(
    (entry) => entry.isDirectory() && existsSync(resolve(productRoot, entry.name, "index.html"))
  );

  if (!templateDir) {
    throw new Error("Template halaman produk tidak ditemukan di app/public/produk.");
  }

  const templatePath = resolve(productRoot, templateDir.name, "index.html");
  mkdirSync(resolve(publicRoot, "produk", slug), { recursive: true });
  const templateHtml = readFileSync(templatePath, "utf8");
  writeFileSync(productPath, setProductSlugInHtml(templateHtml, slug), "utf8");

  return productPath;
}

function cleanupStaleProductPages(publicRoot, activeSlugs) {
  const productRoot = resolve(publicRoot, "produk");
  if (!existsSync(productRoot)) {
    return;
  }

  const entries = readdirSync(productRoot, { withFileTypes: true });
  for (const entry of entries) {
    if (!entry.isDirectory()) {
      continue;
    }

    if (!activeSlugs.has(entry.name)) {
      rmSync(resolve(productRoot, entry.name), { recursive: true, force: true });
      console.log(`Produk statis dihapus: ${resolve(productRoot, entry.name)}`);
    }
  }
}

function readJsonScriptById(html, id) {
  const pattern = new RegExp(
    `<script\\b[^>]*\\bid="${escapeRegex(id)}"[^>]*type="application/ld\\+json"[^>]*>([\\s\\S]*?)</script>`,
    "i"
  );
  const match = html.match(pattern);

  if (!match) {
    throw new Error(`Script JSON-LD dengan id ${id} tidak ditemukan.`);
  }

  return JSON.parse(match[1].trim());
}

function getPublicRoot() {
  return resolve(process.cwd(), "public-site");
}

async function getPageId(supabase, pageKey) {
  const { data, error } = await supabase
    .from("pages")
    .select("id")
    .eq("page_key", pageKey)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data?.id ?? null;
}

async function getHomepageContent(supabase) {
  const { data: publishedPage, error: publishedError } = await supabase
    .from("page_publications")
    .select("payload")
    .eq("page_key", "home")
    .maybeSingle();

  if (publishedError) {
    throw publishedError;
  }

  const pageId = await getPageId(supabase, "home");

  const defaults = {
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

  if (publishedPage?.payload) {
    const payload = publishedPage.payload ?? {};
    const hero = payload.hero ?? {};
    const seo = payload.seo ?? {};

    return {
      hero: {
        ...defaults.hero,
        ...hero,
      },
      seo: {
        ...defaults.seo,
        ...seo,
      },
    };
  }

  if (!pageId) {
    return defaults;
  }

  const [{ data: blocks, error: blockError }, { data: seo, error: seoError }] =
    await Promise.all([
      supabase
        .from("page_blocks")
        .select("block_key, content")
        .eq("page_id", pageId)
        .in("block_key", ["hero"]),
      supabase
        .from("page_seo")
        .select(
          "meta_title, meta_description, canonical_url, amp_url, og_title, og_description"
        )
        .eq("page_id", pageId)
        .maybeSingle(),
    ]);

  if (blockError || seoError) {
    throw blockError ?? seoError;
  }

  const heroBlock = (blocks ?? []).find((block) => block.block_key === "hero")?.content ?? {};

  return {
    hero: {
      ...defaults.hero,
      ...heroBlock,
    },
    seo: {
      metaTitle: seo?.meta_title ?? defaults.seo.metaTitle,
      metaDescription: seo?.meta_description ?? defaults.seo.metaDescription,
      canonicalUrl: seo?.canonical_url ?? defaults.seo.canonicalUrl,
      ampUrl: seo?.amp_url ?? defaults.seo.ampUrl,
      ogTitle: seo?.og_title ?? defaults.seo.ogTitle,
      ogDescription: seo?.og_description ?? defaults.seo.ogDescription,
    },
  };
}

async function getBusinessSettings(supabase) {
  const { data: publishedPage, error: publishedError } = await supabase
    .from("page_publications")
    .select("payload")
    .eq("page_key", "global-settings")
    .maybeSingle();

  if (publishedError) {
    throw publishedError;
  }

  const pageId = await getPageId(supabase, "global-settings");

  const defaults = {
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

  if (publishedPage?.payload) {
    return {
      ...defaults,
      ...(publishedPage.payload ?? {}),
    };
  }

  if (!pageId) {
    return defaults;
  }

  const { data, error } = await supabase
    .from("page_blocks")
    .select("content")
    .eq("page_id", pageId)
    .eq("block_key", "business")
    .maybeSingle();

  if (error) {
    throw error;
  }

  return {
    ...defaults,
    ...(data?.content ?? {}),
  };
}

async function getProducts(supabase) {
  const { data, error } = await supabase
    .from("published_products")
    .select(
      "product_id, name, slug, short_description, description, price, stock, sku, mpn, brand, status, featured_image_url, seo_title, seo_description"
    )
    .eq("status", "active")
    .order("published_at", { ascending: false });

  if (error) {
    throw error;
  }

  return data ?? [];
}

async function getFeaturedReviews(supabase) {
  const { data, error } = await supabase
    .from("business_reviews")
    .select("reviewer_name, rating, review_body, owner_reply, is_featured")
    .order("created_at", { ascending: true });

  if (error) {
    throw error;
  }

  const reviews = data ?? [];
  const featured = reviews.filter((item) => item.is_featured);
  return (featured.length > 0 ? featured : reviews).slice(0, 3);
}

function getPhoneNumber(business) {
  const whatsappNumber = String(business?.whatsappNumber || "").replace(/\D/g, "");
  if (whatsappNumber) {
    return whatsappNumber.startsWith("62") ? `+${whatsappNumber}` : `+62${whatsappNumber}`;
  }

  return String(business?.phoneDisplay || "").trim() || "+6285959781473";
}

function buildCatalogMeta(products, business) {
  const brandName = String(business?.brandName || "Ninja388");
  const domainUrl = ensureTrailingSlash(business?.domainUrl || "https://www.ninja388.com/");
  const siteOrigin = new URL(domainUrl).origin;
  const canonicalUrl = `${siteOrigin}/katalog/`;
  const ampBase = ensureTrailingSlash(business?.ampUrl || "https://ampninja.org/amp/");
  const ampOrigin = new URL(ampBase).origin;
  const ampPrefixPath = ampBase.replace(ampOrigin, "").replace(/\/$/, "");
  const ampUrl = `${ampOrigin}${ampPrefixPath || "/amp"}/katalog/`;
  const productCount = Array.isArray(products) ? products.length : 0;
  const featuredNames = (products || [])
    .slice(0, 3)
    .map((product) => product.name)
    .filter(Boolean)
    .join(", ");
  const metaTitle =
    productCount > 0
      ? `Katalog ${brandName} | ${productCount} Produk Game, Gear & Konsol`
      : `Katalog Gear & Game Original | ${brandName}`;
  const metaDescription = featuredNames
    ? `Jelajahi katalog ${brandName} berisi ${featuredNames}, serta gear, sparepart, dan konsol original untuk pengiriman seluruh Indonesia.`
    : `Jelajahi katalog gear, game, sparepart, dan konsol PlayStation original di ${brandName}. Belanja online untuk pengiriman seluruh Indonesia dengan layanan cepat dan rapi.`;

  return {
    brandName,
    siteOrigin,
    canonicalUrl,
    ampUrl,
    metaTitle,
    metaDescription,
    ogTitle: metaTitle,
    ogDescription: metaDescription,
    ogImage: `${siteOrigin}/assets/banner.jpg`,
  };
}

function buildProductMeta(product, business) {
  const brandName = String(business?.brandName || "Ninja388");
  const domainUrl = ensureTrailingSlash(business?.domainUrl || "https://www.ninja388.com/");
  const siteOrigin = new URL(domainUrl).origin;
  const canonicalUrl = `${siteOrigin}/produk/${product.slug}/`;
  const ampBase = ensureTrailingSlash(business?.ampUrl || "https://ampninja.org/amp/");
  const ampOrigin = new URL(ampBase).origin;
  const ampPrefixPath = ampBase.replace(ampOrigin, "").replace(/\/$/, "");
  const ampUrl = `${ampOrigin}${ampPrefixPath || "/amp"}/produk/${product.slug}/`;
  const imageUrl = normalizeAbsoluteUrl(
    product.featured_image_url || `${siteOrigin}/assets/banner.jpg`,
    `${siteOrigin}/`
  );
  const metaTitle = String(product.seo_title || `${product.name} | ${brandName}`);
  const metaDescription = String(
    product.seo_description ||
      product.short_description ||
      product.description ||
      `Beli ${product.name} di ${brandName}.`
  );

  return {
    brandName,
    siteOrigin,
    canonicalUrl,
    ampUrl,
    imageUrl,
    metaTitle,
    metaDescription,
  };
}

function buildItemListSchema(name, products, limit) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name,
    itemListElement: products.slice(0, limit).map((product, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: `https://www.ninja388.com/produk/${product.slug}/`,
      item: {
        "@type": "Product",
        name: product.name,
        image: product.featured_image_url || "https://www.ninja388.com/assets/banner.jpg",
        sku: product.sku || undefined,
        offers: {
          "@type": "Offer",
          price: String(product.price || 0),
          priceCurrency: "IDR",
          availability:
            Number(product.stock || 0) > 0
              ? "https://schema.org/InStock"
              : "https://schema.org/OutOfStock",
        },
      },
    })),
  };
}

function mapReviewsForSchema(reviews) {
  return reviews.map((review) => ({
    "@type": "Review",
    author: {
      "@type": "Person",
      name: review.reviewer_name,
    },
    reviewRating: {
      "@type": "Rating",
      ratingValue: String(review.rating || 5),
      bestRating: "5",
    },
    reviewBody: review.review_body,
  }));
}

function updateHomePageHtml(html, payload) {
  const business = payload.business;
  const seo = payload.seo;
  const brandName = String(business.brandName || "Ninja388");
  const canonicalUrl = normalizeCanonicalUrl(
    seo.canonicalUrl || business.domainUrl,
    "https://www.ninja388.com/"
  );
  const ampUrl = normalizeAbsoluteUrl(seo.ampUrl || business.ampUrl, "https://ampninja.org/amp/");
  const metaTitle = String(seo.metaTitle || "Ninja388");
  const metaDescription = String(
    seo.metaDescription ||
      "Ninja388 adalah game shop & rental PlayStation premium. Belanja konsol, game, sparepart, dan aksesoris dengan pengiriman seluruh Indonesia. Booking slot main lebih cepat dan rapi."
  );
  const ogTitle = String(seo.ogTitle || metaTitle);
  const ogDescription = String(seo.ogDescription || metaDescription);
  const siteOrigin = new URL(canonicalUrl).origin;
  const bannerUrl = `${siteOrigin}/assets/banner.jpg`;
  const phoneNumber = getPhoneNumber(business);
  const sameAs = [
    business.facebookUrl,
    business.instagramUrl,
    business.tiktokUrl,
    business.youtubeUrl,
  ].filter(Boolean);

  let nextHtml = html;
  nextHtml = replaceTagTextById(nextHtml, "title", "home-page-title", metaTitle);
  nextHtml = replaceAttributeById(nextHtml, "link", "home-canonical-link", "href", canonicalUrl);
  nextHtml = replaceAttributeById(nextHtml, "link", "home-amphtml-link", "href", ampUrl);
  nextHtml = replaceAttributeById(
    nextHtml,
    "meta",
    "home-meta-description",
    "content",
    metaDescription
  );
  nextHtml = replaceAttributeById(nextHtml, "meta", "home-og-site-name", "content", brandName);
  nextHtml = replaceAttributeById(nextHtml, "meta", "home-og-title", "content", ogTitle);
  nextHtml = replaceAttributeById(
    nextHtml,
    "meta",
    "home-og-description",
    "content",
    ogDescription
  );
  nextHtml = replaceAttributeById(nextHtml, "meta", "home-og-url", "content", canonicalUrl);
  nextHtml = replaceAttributeById(nextHtml, "meta", "home-og-image", "content", bannerUrl);
  nextHtml = replaceAttributeById(nextHtml, "meta", "home-twitter-title", "content", ogTitle);
  nextHtml = replaceAttributeById(
    nextHtml,
    "meta",
    "home-twitter-description",
    "content",
    ogDescription
  );
  nextHtml = replaceAttributeById(
    nextHtml,
    "meta",
    "home-twitter-image",
    "content",
    bannerUrl
  );

  const schema = readJsonScriptById(nextHtml, "home-primary-schema");
  const graph = Array.isArray(schema["@graph"]) ? schema["@graph"] : [];

  graph.forEach((item) => {
    if (!item || typeof item !== "object") {
      return;
    }

    if (item["@type"] === "LocalBusiness") {
      item.name = brandName;
      item.url = canonicalUrl;
      item.telephone = phoneNumber;
      item.image = [`${siteOrigin}/assets/logo.png`, bannerUrl];
      item.review = mapReviewsForSchema(payload.reviews);
      item.aggregateRating = {
        "@type": "AggregateRating",
        ratingValue: payload.reviews.length > 0 ? "5" : "4.8",
        reviewCount: String(payload.reviews.length || 5),
        bestRating: "5",
      };
    }

    if (item["@type"] === "Organization") {
      item.name = brandName;
      item.url = canonicalUrl;
      item.logo = `${siteOrigin}/assets/logo.png`;
      item.sameAs = sameAs;
      item.aggregateRating = {
        "@type": "AggregateRating",
        ratingValue: payload.reviews.length > 0 ? "5" : "4.8",
        reviewCount: String(payload.reviews.length || 5),
        bestRating: "5",
      };
      item.contactPoint = [
        {
          "@type": "ContactPoint",
          telephone: phoneNumber,
          contactType: "customer support",
          areaServed: "ID",
          availableLanguage: ["id"],
        },
      ];
    }

    if (item["@type"] === "WebSite") {
      item.name = brandName;
      item.url = canonicalUrl;
      item.publisher = {
        "@type": "Organization",
        name: brandName,
        url: canonicalUrl,
      };
    }
  });

  nextHtml = replaceJsonScriptById(nextHtml, "home-primary-schema", schema);
  nextHtml = replaceJsonScriptById(
    nextHtml,
    "home-dynamic-itemlist",
    buildItemListSchema("Produk homepage live Ninja388", payload.products, 4)
  );

  return nextHtml;
}

function updateCatalogPageHtml(html, payload) {
  const meta = buildCatalogMeta(payload.products, payload.business);

  let nextHtml = html;
  nextHtml = replaceTagTextById(nextHtml, "title", "catalog-page-title", meta.metaTitle);
  nextHtml = replaceAttributeById(
    nextHtml,
    "meta",
    "catalog-meta-description",
    "content",
    meta.metaDescription
  );
  nextHtml = replaceAttributeById(
    nextHtml,
    "link",
    "catalog-canonical-link",
    "href",
    meta.canonicalUrl
  );
  nextHtml = replaceAttributeById(
    nextHtml,
    "link",
    "catalog-amphtml-link",
    "href",
    meta.ampUrl
  );
  nextHtml = replaceAttributeById(nextHtml, "meta", "catalog-og-site-name", "content", meta.brandName);
  nextHtml = replaceAttributeById(nextHtml, "meta", "catalog-og-title", "content", meta.ogTitle);
  nextHtml = replaceAttributeById(
    nextHtml,
    "meta",
    "catalog-og-description",
    "content",
    meta.ogDescription
  );
  nextHtml = replaceAttributeById(nextHtml, "meta", "catalog-og-url", "content", meta.canonicalUrl);
  nextHtml = replaceAttributeById(nextHtml, "meta", "catalog-og-image", "content", meta.ogImage);
  nextHtml = replaceAttributeById(
    nextHtml,
    "meta",
    "catalog-twitter-title",
    "content",
    meta.ogTitle
  );
  nextHtml = replaceAttributeById(
    nextHtml,
    "meta",
    "catalog-twitter-description",
    "content",
    meta.ogDescription
  );
  nextHtml = replaceAttributeById(
    nextHtml,
    "meta",
    "catalog-twitter-image",
    "content",
    meta.ogImage
  );

  const schema = readJsonScriptById(nextHtml, "catalog-primary-schema");
  const graph = Array.isArray(schema["@graph"]) ? schema["@graph"] : [];
  const sameAs = [
    payload.business.facebookUrl,
    payload.business.instagramUrl,
    payload.business.tiktokUrl,
    payload.business.youtubeUrl,
  ].filter(Boolean);

  graph.forEach((item) => {
    if (!item || typeof item !== "object") {
      return;
    }

    if (item["@type"] === "CollectionPage") {
      item.name = `Katalog Gear & Game ${meta.brandName}`;
      item.url = meta.canonicalUrl;
      item.description = meta.metaDescription;
      item.publisher = {
        "@type": "Organization",
        name: meta.brandName,
        url: `${meta.siteOrigin}/`,
      };
    }

    if (item["@type"] === "Organization") {
      item.name = meta.brandName;
      item.url = `${meta.siteOrigin}/`;
      item.logo = `${meta.siteOrigin}/assets/logo.png`;
      item.sameAs = sameAs;
      item.review = mapReviewsForSchema(payload.reviews);
      item.aggregateRating = {
        "@type": "AggregateRating",
        ratingValue: payload.reviews.length > 0 ? "5" : "4.8",
        reviewCount: String(payload.reviews.length || 5),
        bestRating: "5",
      };
    }

    if (item["@type"] === "BreadcrumbList") {
      item.itemListElement = [
        { "@type": "ListItem", position: 1, name: "Beranda", item: `${meta.siteOrigin}/` },
        { "@type": "ListItem", position: 2, name: "Katalog", item: meta.canonicalUrl },
      ];
    }
  });

  nextHtml = replaceJsonScriptById(nextHtml, "catalog-primary-schema", schema);
  nextHtml = replaceJsonScriptById(
    nextHtml,
    "catalog-dynamic-itemlist",
    buildItemListSchema("Produk katalog live Ninja388", payload.products, 12)
  );

  return nextHtml;
}

function updateProductPageHtml(html, product, payload) {
  const meta = buildProductMeta(product, payload.business);

  let nextHtml = html;
  nextHtml = replaceTagTextById(nextHtml, "title", "product-page-title", meta.metaTitle);
  nextHtml = replaceAttributeById(
    nextHtml,
    "meta",
    "product-meta-description",
    "content",
    meta.metaDescription
  );
  nextHtml = replaceAttributeById(
    nextHtml,
    "link",
    "product-canonical-link",
    "href",
    meta.canonicalUrl
  );
  nextHtml = replaceAttributeById(nextHtml, "link", "product-amphtml-link", "href", meta.ampUrl);
  nextHtml = replaceAttributeById(nextHtml, "meta", "product-og-site-name", "content", meta.brandName);
  nextHtml = replaceAttributeById(nextHtml, "meta", "product-og-title", "content", meta.metaTitle);
  nextHtml = replaceAttributeById(
    nextHtml,
    "meta",
    "product-og-description",
    "content",
    meta.metaDescription
  );
  nextHtml = replaceAttributeById(nextHtml, "meta", "product-og-url", "content", meta.canonicalUrl);
  nextHtml = replaceAttributeById(nextHtml, "meta", "product-og-image", "content", meta.imageUrl);
  nextHtml = replaceAttributeById(
    nextHtml,
    "meta",
    "product-twitter-title",
    "content",
    meta.metaTitle
  );
  nextHtml = replaceAttributeById(
    nextHtml,
    "meta",
    "product-twitter-description",
    "content",
    meta.metaDescription
  );
  nextHtml = replaceAttributeById(
    nextHtml,
    "meta",
    "product-twitter-image",
    "content",
    meta.imageUrl
  );

  const schema = readJsonScriptById(nextHtml, "product-primary-schema");
  const graph = Array.isArray(schema["@graph"]) ? schema["@graph"] : [];
  const sameAs = [
    payload.business.facebookUrl,
    payload.business.instagramUrl,
    payload.business.tiktokUrl,
    payload.business.youtubeUrl,
  ].filter(Boolean);

  graph.forEach((item) => {
    if (!item || typeof item !== "object") {
      return;
    }

    if (item["@type"] === "BreadcrumbList") {
      item.itemListElement = [
        { "@type": "ListItem", position: 1, name: "Beranda", item: `${meta.siteOrigin}/` },
        { "@type": "ListItem", position: 2, name: "Katalog", item: `${meta.siteOrigin}/katalog/` },
        { "@type": "ListItem", position: 3, name: product.name, item: meta.canonicalUrl },
      ];
    }

    if (item["@type"] === "Organization") {
      item.name = meta.brandName;
      item.url = `${meta.siteOrigin}/`;
      item.logo = `${meta.siteOrigin}/assets/logo.png`;
      item.sameAs = sameAs;
      item.review = mapReviewsForSchema(payload.reviews);
      item.aggregateRating = {
        "@type": "AggregateRating",
        ratingValue: payload.reviews.length > 0 ? "5" : "4.8",
        reviewCount: String(payload.reviews.length || 5),
        bestRating: "5",
      };
    }

    if (item["@type"] === "Product") {
      item.name = product.name;
      item.image = [meta.imageUrl];
      item.description = product.description || product.short_description || item.description;
      item.sku = product.sku || item.sku;
      item.mpn = product.mpn || item.mpn;
      item.brand = { "@type": "Brand", name: product.brand || meta.brandName };
      item.offers = {
        "@type": "Offer",
        url: meta.canonicalUrl,
        priceCurrency: "IDR",
        price: String(product.price || 0),
        availability:
          Number(product.stock || 0) > 0
            ? "https://schema.org/InStock"
            : "https://schema.org/OutOfStock",
        seller: {
          "@type": "Organization",
          name: meta.brandName,
        },
      };
    }
  });

  nextHtml = replaceJsonScriptById(nextHtml, "product-primary-schema", schema);
  return nextHtml;
}

function writeFile(filePath, content) {
  writeFileSync(filePath, content, "utf8");
  console.log(`HTML statis diperbarui: ${filePath}`);
}

async function publishPublicPages() {
  loadEnv();

  const supabase = createSupabaseAdmin();
  const [home, business, products, reviews] = await Promise.all([
    getHomepageContent(supabase),
    getBusinessSettings(supabase),
    getProducts(supabase),
    getFeaturedReviews(supabase),
  ]);

  const payload = { hero: home.hero, seo: home.seo, business, products, reviews };
  const publicRoot = getPublicRoot();

  const homePath = resolve(publicRoot, "index.html");
  const catalogPath = resolve(publicRoot, "katalog", "index.html");

  writeFile(homePath, updateHomePageHtml(readFileSync(homePath, "utf8"), payload));
  writeFile(catalogPath, updateCatalogPageHtml(readFileSync(catalogPath, "utf8"), payload));

  for (const product of products) {
    const productPath = ensureProductTemplate(publicRoot, product.slug);

    writeFile(
      productPath,
      updateProductPageHtml(
        setProductSlugInHtml(readFileSync(productPath, "utf8"), product.slug),
        product,
        payload
      )
    );
  }

  const activeSlugs = new Set(products.map((product) => product.slug).filter(Boolean));
  cleanupStaleProductPages(publicRoot, activeSlugs);

  for (const htmlFile of listHtmlFiles(publicRoot)) {
    writeFile(htmlFile, injectCustomScripts(readFileSync(htmlFile, "utf8"), business));
  }

  console.log("Publish statis SEO selesai. Lanjutkan dengan deploy Firebase Hosting.");
}

publishPublicPages().catch((error) => {
  console.error(error);
  process.exit(1);
});
