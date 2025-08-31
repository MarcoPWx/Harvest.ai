import { NextResponse } from "next/server";

export const config = {
  // Run middleware on all routes so we can optionally protect the main site,
  // plus keep existing Storybook/MSW handling
  matcher: ["/:path*"],
};

function unauthorized(realm: string) {
  return new NextResponse("Authentication required", {
    status: 401,
    headers: {
      "WWW-Authenticate": `Basic realm="${realm}"`,
    },
  });
}

export default function middleware(req) {
  const url = new URL(req.url);
  const pathname = url.pathname || "";

  // Allow MSW worker regardless
  if (pathname === "/mockServiceWorker.js") {
    return NextResponse.next();
  }

  // Storybook protection (optional)
  const sbCred = process.env.STORYBOOK_BASIC_AUTH; // expected format: username:password
  if (pathname.startsWith("/storybook") && sbCred) {
    const auth = req.headers.get("authorization") || "";
    if (!auth.startsWith("Basic ")) return unauthorized("Storybook");
    try {
      const b64 = auth.slice(6).trim();
      const plain = Buffer.from(b64, "base64").toString("utf8");
      if (plain !== sbCred) return unauthorized("Storybook");
      return NextResponse.next();
    } catch {
      return unauthorized("Storybook");
    }
  }

  // Optional cookie-based login gate for the main site
  const useLogin = process.env.SITE_USE_LOGIN === "1";
  if (useLogin && !pathname.startsWith("/storybook")) {
    // Allow login and assets without auth
    const isPublicAsset =
      pathname.startsWith("/_next") ||
      pathname.startsWith("/favicon") ||
      pathname.startsWith("/assets") ||
      pathname.startsWith("/public") ||
      pathname.startsWith("/images") ||
      pathname.endsWith(".css") ||
      pathname.endsWith(".js") ||
      pathname.endsWith(".map") ||
      pathname.endsWith(".json") ||
      pathname.endsWith(".svg") ||
      pathname.endsWith(".png") ||
      pathname.endsWith(".jpg") ||
      pathname.endsWith(".jpeg") ||
      pathname.endsWith(".ico");

    if (
      pathname === "/login" ||
      pathname === "/api/demo-login" ||
      pathname === "/_health" ||
      isPublicAsset
    ) {
      return NextResponse.next();
    }

    const cookie = req.cookies.get("demo_auth");
    if (!cookie || cookie.value !== "1") {
      const to = new URL("/login", req.url);
      return NextResponse.redirect(to);
    }
    // Cookie present, continue
    return NextResponse.next();
  }

  // Main site HTTP Basic (fallback) — only when login gate is not used
  const siteCred = process.env.SITE_BASIC_AUTH; // expected format: username:password
  if (!useLogin && siteCred && !pathname.startsWith("/storybook")) {
    // Exempt health checks if needed
    if (pathname === "/_health") return NextResponse.next();

    const auth = req.headers.get("authorization") || "";
    if (!auth.startsWith("Basic ")) return unauthorized("Site");
    try {
      const b64 = auth.slice(6).trim();
      const plain = Buffer.from(b64, "base64").toString("utf8");
      if (plain !== siteCred) return unauthorized("Site");
      // Auth ok, continue
      return NextResponse.next();
    } catch {
      return unauthorized("Site");
    }
  }

  return NextResponse.next();
}

