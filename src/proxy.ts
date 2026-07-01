import { NextResponse, type NextRequest } from "next/server";

import { updateSession } from "@/lib/supabase-middleware";

const protectedPaths = [
  "/dashboard",
  "/produk",
  "/order",
  "/booking",
  "/station",
  "/review",
  "/konten",
  "/pengaturan",
  "/keamanan",
];

export async function proxy(request: NextRequest) {
  const { supabase, response } = updateSession(request);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isProtectedPath = protectedPaths.some((path) =>
    request.nextUrl.pathname.startsWith(path)
  );

  if (isProtectedPath && !user) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/login";
    redirectUrl.searchParams.set("redirectedFrom", request.nextUrl.pathname);
    return NextResponse.redirect(redirectUrl);
  }

  if (request.nextUrl.pathname === "/login" && user) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/dashboard";
    redirectUrl.search = "";
    return NextResponse.redirect(redirectUrl);
  }

  return response;
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/produk/:path*",
    "/order/:path*",
    "/booking/:path*",
    "/station/:path*",
    "/review/:path*",
    "/konten/:path*",
    "/pengaturan/:path*",
    "/keamanan/:path*",
    "/login",
  ],
};
