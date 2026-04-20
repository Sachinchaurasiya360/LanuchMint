import Link from "next/link";

const SECTIONS: Array<{
  title: string;
  links: Array<{ label: string; href: string }>;
}> = [
  {
    title: "Product",
    links: [
      { label: "Pricing", href: "/pricing" },
      { label: "Launching today", href: "/today" },
      { label: "Directories", href: "/directories" },
      { label: "Changelog", href: "/changelog" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "Contact", href: "/contact" },
      { label: "Terms", href: "/terms" },
      { label: "Privacy", href: "/privacy" },
    ],
  },
];

const SOCIALS: Array<{ label: string; href: string; icon: React.ReactNode }> = [
  {
    label: "X",
    href: "https://x.com/launchmint",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
        <path d="M18.244 2H21.5l-7.5 8.574L23 22h-6.844l-5.356-6.99L4.7 22H1.44l8.02-9.17L1 2h6.99l4.84 6.39L18.244 2Zm-1.2 18h1.874L7.03 4H5.02l12.024 16Z" />
      </svg>
    ),
  },
  {
    label: "GitHub",
    href: "https://github.com/launchmint",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
        <path d="M12 .5C5.7.5.5 5.7.5 12a11.5 11.5 0 0 0 7.86 10.92c.57.1.78-.25.78-.55v-2.1c-3.2.7-3.87-1.37-3.87-1.37-.52-1.33-1.28-1.68-1.28-1.68-1.05-.72.08-.7.08-.7 1.16.08 1.77 1.2 1.77 1.2 1.03 1.76 2.7 1.25 3.36.96.1-.75.4-1.25.73-1.54-2.55-.3-5.24-1.28-5.24-5.7 0-1.26.45-2.3 1.2-3.1-.12-.3-.52-1.48.1-3.08 0 0 .98-.3 3.2 1.18a11 11 0 0 1 5.82 0c2.22-1.48 3.2-1.18 3.2-1.18.62 1.6.22 2.78.1 3.08.75.8 1.2 1.84 1.2 3.1 0 4.43-2.7 5.4-5.27 5.68.42.36.78 1.07.78 2.16v3.2c0 .3.2.66.8.55A11.5 11.5 0 0 0 23.5 12C23.5 5.7 18.3.5 12 .5Z" />
      </svg>
    ),
  },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/company/launchmint",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
        <path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5ZM3 9h4v12H3V9Zm7 0h3.8v1.7h.06c.53-1 1.83-2.07 3.77-2.07 4.03 0 4.77 2.66 4.77 6.12V21h-4v-5.3c0-1.27-.02-2.9-1.77-2.9-1.77 0-2.04 1.38-2.04 2.8V21h-4V9Z" />
      </svg>
    ),
  },
];

export function SiteFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t">
      <div className="mx-auto max-w-6xl px-4 py-12">
        <div className="grid gap-10 md:grid-cols-[1.5fr_1fr_1fr] md:gap-8">
          <div className="max-w-sm">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-base font-semibold tracking-tight"
            >
              <span
                aria-hidden
                className="relative grid h-7 w-7 place-items-center overflow-hidden rounded-md bg-foreground text-background"
              >
                <span className="text-[13px] font-bold leading-none">L</span>
                <span className="absolute inset-x-0 bottom-0 h-[2px] bg-yellow-400" />
              </span>
              LaunchMint<span className="text-yellow-500">.</span>
            </Link>
            <p className="mt-3 text-sm text-muted-foreground">
              Turn visibility into velocity. The launch platform for indie
              founders.
            </p>
          </div>

          {SECTIONS.map((sec) => (
            <nav key={sec.title} aria-label={sec.title}>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {sec.title}
              </p>
              <ul className="mt-3 space-y-2 text-sm">
                {sec.links.map((l) => (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      className="text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="mt-10 flex flex-col-reverse gap-4 border-t pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-muted-foreground">
            © {year} LaunchMint. All rights reserved.
          </p>
          <ul className="flex items-center gap-2">
            {SOCIALS.map((s) => (
              <li key={s.label}>
                <a
                  href={s.href}
                  aria-label={s.label}
                  target={s.href.startsWith("http") ? "_blank" : undefined}
                  rel={
                    s.href.startsWith("http") ? "noopener noreferrer" : undefined
                  }
                  className="grid h-8 w-8 place-items-center rounded-md border text-muted-foreground transition-colors hover:border-foreground/20 hover:text-foreground"
                >
                  {s.icon}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}
