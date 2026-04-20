import { auth } from "./auth.js";

const PUBLIC_PATHS = new Set([
  "/",
  "/signin",
  "/signup",
  "/pricing",
  "/changelog",
  "/about",
  "/contact",
  "/terms",
  "/privacy",
  "/today",
  "/directories",
  "/categories",
  "/founders",
  "/sitemap.xml",
  "/robots.txt",
]);

const PUBLIC_PREFIXES = [
  "/api",
  "/_next",
  "/favicon",
  "/brand",
  "/og",
  "/p/",
  "/u/",
  "/dir/",
  "/products/",
  "/founders/",
  "/launches/",
  "/review/",
  "/directories/",
  "/categories/",
  "/best/",
  "/compare/",
  "/sitemap",
];

export default auth((req) => {
  const { pathname } = req.nextUrl;

  if (
    PUBLIC_PATHS.has(pathname) ||
    PUBLIC_PREFIXES.some((p) => pathname.startsWith(p))
  ) {
    return;
  }

  if (!req.auth) {
    const url = new URL("/signin", req.url);
    url.searchParams.set("from", pathname);
    return Response.redirect(url);
  }
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|brand|og).*)"],
};
