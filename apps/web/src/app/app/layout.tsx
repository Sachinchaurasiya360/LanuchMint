import Link from "next/link";
import {
  BarChart3,
  Building2,
  LayoutDashboard,
  Package,
  Rocket,
  Settings,
  User,
} from "lucide-react";
import { auth, signOut } from "@/auth";

const NAV = [
  { href: "/app", label: "Dashboard", icon: LayoutDashboard },
  { href: "/app/products", label: "Products", icon: Package },
  { href: "/app/launches", label: "Launches", icon: Rocket },
  { href: "/app/profile", label: "Founder profile", icon: User },
  { href: "/app/seo", label: "SEO", icon: BarChart3 },
  { href: "/app/workspace", label: "Workspace", icon: Building2 },
  { href: "/app/settings", label: "Settings", icon: Settings },
];

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  return (
    <div className="flex min-h-screen">
      <aside className="hidden w-60 shrink-0 border-r bg-secondary/30 sm:flex sm:flex-col">
        <Link
          href="/app"
          className="flex h-14 items-center border-b px-4 text-base font-semibold"
        >
          LaunchMint
        </Link>
        <nav className="flex-1 space-y-1 p-3">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-background hover:text-foreground"
            >
              <item.icon className="h-4 w-4" aria-hidden />
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="border-t p-3">
          <p className="truncate text-xs text-muted-foreground">
            {session?.user?.email}
          </p>
          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/" });
            }}
          >
            <button
              type="submit"
              className="mt-2 text-xs text-muted-foreground hover:text-foreground"
            >
              Sign out
            </button>
          </form>
        </div>
      </aside>
      <main className="flex-1">{children}</main>
    </div>
  );
}
