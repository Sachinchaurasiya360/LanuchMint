import Link from "next/link";
import { Button } from "@launchmint/ui";
import { auth } from "@/auth";

export async function SiteHeader() {
  const session = await auth();
  return (
    <header className="border-b">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="text-base font-semibold tracking-tight">
          LaunchMint
        </Link>
        <nav className="flex items-center gap-2">
          <Link
            href="/today"
            className="px-3 text-sm text-muted-foreground hover:text-foreground"
          >
            Today
          </Link>
          <Link
            href="/directories"
            className="px-3 text-sm text-muted-foreground hover:text-foreground"
          >
            Directories
          </Link>
          <Link
            href="/pricing"
            className="px-3 text-sm text-muted-foreground hover:text-foreground"
          >
            Pricing
          </Link>
          <Link
            href="/changelog"
            className="px-3 text-sm text-muted-foreground hover:text-foreground"
          >
            Changelog
          </Link>
          {session?.user ? (
            <Button asChild size="sm">
              <Link href="/app">Dashboard</Link>
            </Button>
          ) : (
            <Button asChild size="sm">
              <Link href="/signin">Sign in</Link>
            </Button>
          )}
        </nav>
      </div>
    </header>
  );
}
