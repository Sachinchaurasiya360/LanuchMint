import Link from "next/link";
import { notFound } from "next/navigation";
import { FileClock, Shield } from "lucide-react";
import { can } from "@launchmint/auth";
import { requireSession } from "@/lib/session";

const NAV = [
  { href: "/app/admin/moderation", label: "Moderation", icon: Shield },
  { href: "/app/admin/audit", label: "Audit log", icon: FileClock },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { ctx } = await requireSession();
  // Staff-only surface - hide it entirely from non-mods rather than showing a
  // 403 page, so its existence isn't broadcast to unauthorized users.
  if (!can(ctx, "moderation.queue")) notFound();

  return (
    <div>
      <div className="border-b bg-secondary/30">
        <div className="mx-auto flex max-w-6xl items-center gap-4 px-6 py-3">
          <Shield className="h-4 w-4" />
          <span className="text-sm font-medium">Admin</span>
          <nav className="ml-6 flex items-center gap-4 text-sm">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="inline-flex items-center gap-1.5 text-muted-foreground hover:text-foreground"
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
      {children}
    </div>
  );
}
