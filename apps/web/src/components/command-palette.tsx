"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Package, Search, User as UserIcon, Building2 } from "lucide-react";
import { Input } from "@launchmint/ui";

interface Hit {
  kind: "products" | "founders" | "directories";
  id: string;
  title: string;
  subtitle?: string;
  href: string;
}

const ICONS = {
  products: Package,
  founders: UserIcon,
  directories: Building2,
};

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [hits, setHits] = useState<Hit[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      } else if (e.key === "Escape") {
        setOpen(false);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => inputRef.current?.focus(), 20);
    return () => clearTimeout(t);
  }, [open]);

  useEffect(() => {
    if (!open || !q.trim()) {
      setHits([]);
      return;
    }
    let cancelled = false;
    setLoading(true);
    const t = setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/v1/search?q=${encodeURIComponent(q.trim())}&limit=5`,
        );
        const data = (await res.json()) as { hits: Hit[] };
        if (!cancelled) setHits(data.hits);
      } catch {
        if (!cancelled) setHits([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, 180);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [q, open]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 p-4 pt-[10vh]"
      onClick={() => setOpen(false)}
    >
      <div
        className="w-full max-w-xl overflow-hidden rounded-lg border bg-background shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2 border-b px-3 py-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            ref={inputRef}
            placeholder="Search products, founders, directories"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="border-0 shadow-none focus-visible:ring-0"
          />
        </div>
        <ul className="max-h-80 divide-y overflow-y-auto">
          {loading && q.trim() ? (
            <li className="px-4 py-3 text-sm text-muted-foreground">
              Searching…
            </li>
          ) : null}
          {!loading && q.trim() && hits.length === 0 ? (
            <li className="px-4 py-3 text-sm text-muted-foreground">
              No matches for "{q}"
            </li>
          ) : null}
          {hits.map((h) => {
            const Icon = ICONS[h.kind];
            return (
              <li key={`${h.kind}:${h.id}`}>
                <Link
                  href={h.href}
                  className="flex items-start gap-3 px-4 py-3 hover:bg-secondary/50"
                  onClick={() => setOpen(false)}
                >
                  <Icon className="mt-0.5 h-4 w-4 text-muted-foreground" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{h.title}</p>
                    {h.subtitle ? (
                      <p className="line-clamp-1 text-xs text-muted-foreground">
                        {h.subtitle}
                      </p>
                    ) : null}
                  </div>
                  <span className="text-xs uppercase text-muted-foreground">
                    {h.kind}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
        <div className="flex items-center justify-between border-t px-3 py-2 text-xs text-muted-foreground">
          <span>
            <kbd className="rounded border px-1">↵</kbd> open ·{" "}
            <kbd className="rounded border px-1">Esc</kbd> close
          </span>
          <span>Cmd+K</span>
        </div>
      </div>
    </div>
  );
}
