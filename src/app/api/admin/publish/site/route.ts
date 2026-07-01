import { NextResponse } from "next/server";

import { getHomepageContent, getBusinessSettings } from "@/lib/admin-queries";
import { getSupabaseAdminClient } from "@/lib/supabase-admin";
import { getSupabaseServerClient } from "@/lib/supabase-server";

async function requireUser() {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user;
}

async function triggerGitHubDeploy(userEmail: string | null) {
  const owner = process.env.GITHUB_REPO_OWNER?.trim();
  const repo = process.env.GITHUB_REPO_NAME?.trim();
  const workflowFile = process.env.GITHUB_DEPLOY_WORKFLOW_FILE?.trim();
  const ref = process.env.GITHUB_DEPLOY_REF?.trim() || "main";
  const token = process.env.GITHUB_ACTIONS_DEPLOY_TOKEN?.trim();

  if (!owner || !repo || !workflowFile || !token) {
    return {
      queued: false,
      configured: false,
      message:
        "Versi publish database sudah diperbarui, tetapi otomatisasi deploy belum dikonfigurasi di environment admin panel.",
    };
  }

  const response = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/actions/workflows/${workflowFile}/dispatches`,
    {
      method: "POST",
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        "User-Agent": "ninja388-admin-panel",
      },
      body: JSON.stringify({
        ref,
        inputs: {
          trigger_source: "admin-panel",
          actor_email: userEmail || "unknown",
        },
      }),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Gagal memicu GitHub Actions deploy. Status ${response.status}: ${errorText}`
    );
  }

  return {
    queued: true,
    configured: true,
    message:
      "Versi publish berhasil diperbarui dan deploy website publik sudah masuk antrean GitHub Actions.",
  };
}

export async function POST() {
  const user = await requireUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = getSupabaseAdminClient();

  try {
    const [homeDraft, businessDraft, { data: productDrafts, error: productError }] =
      await Promise.all([
        getHomepageContent("draft"),
        getBusinessSettings("draft"),
        supabase
          .from("products")
          .select(
            "id, category_id, name, slug, short_description, description, price, stock, sku, mpn, brand, status, featured_image_url, seo_title, seo_description"
          )
          .order("created_at", { ascending: false }),
      ]);

    if (productError) {
      throw productError;
    }

    const now = new Date().toISOString();
    const { error: homePublishError } = await supabase.from("page_publications").upsert(
      {
        page_key: "home",
        title: "Homepage Ninja388",
        payload: homeDraft,
        published_at: now,
        updated_at: now,
      },
      { onConflict: "page_key" }
    );

    if (homePublishError) {
      throw homePublishError;
    }

    const { error: businessPublishError } = await supabase.from("page_publications").upsert(
      {
        page_key: "global-settings",
        title: "Global Settings",
        payload: businessDraft,
        published_at: now,
        updated_at: now,
      },
      { onConflict: "page_key" }
    );

    if (businessPublishError) {
      throw businessPublishError;
    }

    const drafts = productDrafts ?? [];
    const { data: existingPublished, error: existingPublishedError } = await supabase
      .from("published_products")
      .select("product_id");

    if (existingPublishedError) {
      throw existingPublishedError;
    }

    const draftIds = new Set(drafts.map((product) => product.id));
    const staleIds = (existingPublished ?? [])
      .map((product) => product.product_id)
      .filter((productId) => !draftIds.has(productId));

    if (staleIds.length > 0) {
      const { error: deleteError } = await supabase
        .from("published_products")
        .delete()
        .in("product_id", staleIds);

      if (deleteError) {
        throw deleteError;
      }
    }

    if (drafts.length > 0) {
      const { error: upsertProductsError } = await supabase
        .from("published_products")
        .upsert(
          drafts.map((product) => ({
            product_id: product.id,
            category_id: product.category_id,
            name: product.name,
            slug: product.slug,
            short_description: product.short_description,
            description: product.description,
            price: product.price,
            stock: product.stock,
            sku: product.sku,
            mpn: product.mpn,
            brand: product.brand,
            status: product.status,
            featured_image_url: product.featured_image_url,
            seo_title: product.seo_title,
            seo_description: product.seo_description,
            published_at: now,
            updated_at: now,
          })),
          { onConflict: "product_id" }
        );

      if (upsertProductsError) {
        throw upsertProductsError;
      }
    }

    const deployStatus = await triggerGitHubDeploy(user.email ?? null);

    return NextResponse.json({
      success: true,
      deployQueued: deployStatus.queued,
      deployConfigured: deployStatus.configured,
      message: deployStatus.queued
        ? deployStatus.message
        : `${deployStatus.message} Untuk sekarang, lanjutkan dengan npm run publish-public lalu firebase deploy --only hosting.`,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Gagal mempublish perubahan.",
      },
      { status: 400 }
    );
  }
}
