import Link from "next/link";
import { Button } from "@launchmint/ui";
import { auth } from "@/auth";

const NAV_LINKS = [
  { href: "/today", label: "Today" },
  { href: "/directories", label: "Directories" },
  { href: "/pricing", label: "Pricing" },
  { href: "/changelog", label: "Changelog" },
];

export async function SiteHeader() {
  const session = await auth();
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/70 backdrop-blur-xl supports-[backdrop-filter]:bg-background/50">
      <a
        href="#page-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-2 focus:z-50 focus:rounded focus:bg-yellow-400 focus:px-3 focus:py-1 focus:text-sm focus:font-medium focus:text-black focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2"
      >
        Skip to content
      </a>

      {/* thin gradient accent line */}
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-yellow-400/60 to-transparent"
      />

      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-6 px-4">
        <Link
          href="/"
          className="group flex items-center gap-2.5 text-base font-semibold tracking-tight"
        >
          <span
            aria-hidden
            className="relative grid h-8 w-8 place-items-center overflow-hidden rounded-lg bg-foreground text-background ring-1 ring-foreground/10 transition-transform group-hover:scale-105"
          >
            <span className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,theme(colors.yellow.300/0.55),transparent_60%)]" />
            <span className="relative text-sm font-bold leading-none">L</span>
            <span className="absolute bottom-1 left-1 h-1 w-1 rounded-full bg-yellow-400" />
          </span>
          <span className="flex items-baseline">
            LaunchMint
            <span className="text-yellow-500">.</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-0.5 rounded-full border border-border/50 bg-background/40 p-1 text-sm shadow-sm md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-full px-3.5 py-1.5 text-muted-foreground transition-colors hover:bg-muted/70 hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          {session?.user ? (
            <Button asChild size="sm" className="h-9 px-4">
              <Link href="/app">Open dashboard</Link>
            </Button>
          ) : (
            <>
              <Link
                href="/signin"
                className="hidden text-sm text-muted-foreground transition-colors hover:text-foreground sm:inline-flex"
              >
                Sign in
              </Link>
              <Button
                asChild
                size="sm"
                className="group h-9 gap-1.5 px-4 shadow-[0_6px_20px_-8px_theme(colors.foreground/0.5)]"
              >
                <Link href="/signin">
                  Launch free
                  <span
                    aria-hidden
                    className="transition-transform group-hover:translate-x-0.5"
                  >
                    →
                  </span>
                </Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
