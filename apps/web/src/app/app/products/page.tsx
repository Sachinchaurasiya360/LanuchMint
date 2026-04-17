import Link from "next/link";
import { Plus, Rocket } from "lucide-react";
import { db } from "@launchmint/db";
import {
  Badge,
  Button,
  EmptyState,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@launchmint/ui";
import { requireSession } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function ProductsPage() {
  const { workspaceId } = await requireSession();
  const products = await db.product.findMany({
    where: { workspaceId, deletedAt: null },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <header className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Products</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Everything you've added to your workspace.
          </p>
        </div>
        <Button asChild>
          <Link href="/app/products/new">
            <Plus className="h-4 w-4" /> New product
          </Link>
        </Button>
      </header>

      <div className="mt-8">
        {products.length === 0 ? (
          <EmptyState
            icon={Rocket}
            title="No products yet"
            description="Add a product to start building your launch page."
            action={
              <Button asChild>
                <Link href="/app/products/new">Add product</Link>
              </Button>
            }
          />
        ) : (
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell>
                      <div className="font-medium">{p.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {p.tagline}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={p.status === "LIVE" ? "default" : "secondary"}
                      >
                        {p.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">{p.category}</TableCell>
                    <TableCell className="text-right">
                      <Button asChild size="sm" variant="outline">
                        <Link href={`/app/products/${p.id}/edit`}>Edit</Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
}
