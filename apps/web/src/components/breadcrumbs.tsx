import Link from "next/link";
import { ChevronRight } from "lucide-react";

export interface BreadcrumbItem {
  name: string;
  url: string;
}

/**
 * Visible breadcrumb UI. Pair with `breadcrumbJsonLd()` for the schema -
 * search engines treat visible + schema'd breadcrumbs as the strongest
 * hierarchy signal.
 *
 * The Home root is prepended automatically; pass only the tail segments.
 */
export function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  const chain: BreadcrumbItem[] = [{ name: "Home", url: "/" }, ...items];
  return (
    <nav
      aria-label="Breadcrumb"
      className="text-xs text-muted-foreground"
    >
      <ol className="flex flex-wrap items-center gap-1">
        {chain.map((item, i) => {
          const isLast = i === chain.length - 1;
          return (
            <li key={item.url} className="flex items-center gap-1">
              {isLast ? (
                <span aria-current="page" className="text-foreground">
                  {item.name}
                </span>
              ) : (
                <Link href={item.url} className="hover:underline">
                  {item.name}
                </Link>
              )}
              {!isLast ? (
                <ChevronRight className="h-3 w-3" aria-hidden />
              ) : null}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
