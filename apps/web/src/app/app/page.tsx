import Link from "next/link";
import { Rocket } from "lucide-react";
import { db } from "@launchmint/db";
import { Button, EmptyState, Kpi } from "@launchmint/ui";
import { requireSession } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const { workspaceId } = await requireSession();

  const [productCount, reviewCount] = await Promise.all([
    db.product.count({ where: { workspaceId, deletedAt: null } }),
    db.review.count({ where: { product: { workspaceId } } }),
  ]);

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Your launch and growth at a glance.
        </p>
      </header>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi
          label="Products"
          value={productCount}
          hint={productCount === 0 ? "Add your first product" : undefined}
        />
        <Kpi label="Reviews" value={reviewCount} />
        <Kpi label="Backlinks" value={0} hint="Connect a domain" />
        <Kpi label="Verified MRR" value="$0" hint="Connect Stripe" />
      </div>

      {productCount === 0 ? (
        <div className="mt-10">
          <EmptyState
            icon={Rocket}
            title="No products yet"
            description="Add a product, drop in screenshots, and pick a launch day. We'll handle SEO and the launch checklist for you."
            action={
              <Button asChild>
                <Link href="/app/products/new">Add product</Link>
              </Button>
            }
          />
        </div>
      ) : null}
    </div>
  );
}
