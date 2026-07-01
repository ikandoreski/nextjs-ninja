import { NextResponse } from "next/server";

import { getHomepageContent, getBusinessSettings } from "@/lib/admin-queries";

export async function GET() {
  try {
    const [home, business] = await Promise.all([
      getHomepageContent("published"),
      getBusinessSettings("published"),
    ]);

    return NextResponse.json(
      {
        hero: home.hero,
        seo: home.seo,
        business,
      },
      {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Cache-Control": "no-store",
        },
      }
    );
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Gagal memuat konten home." },
      {
        status: 500,
        headers: {
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  }
}
