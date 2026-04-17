import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-8 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <p>© {new Date().getFullYear()} LaunchMint. Turn visibility into velocity.</p>
        <nav className="flex flex-wrap gap-4">
          <Link href="/about" className="hover:text-foreground">About</Link>
          <Link href="/pricing" className="hover:text-foreground">Pricing</Link>
          <Link href="/contact" className="hover:text-foreground">Contact</Link>
          <Link href="/changelog" className="hover:text-foreground">Changelog</Link>
        </nav>
      </div>
    </footer>
  );
}
