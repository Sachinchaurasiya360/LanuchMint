import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@launchmint/db";
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@launchmint/ui";
import { requireSession } from "@/lib/session";
import { EditProductForm } from "./edit-product-form";

export const dynamic = "force-dynamic";

export default async function EditProductPage({
  params,
}: {
  params: { id: string };
}) {
  const { workspaceId } = await requireSession();
  const product = await db.product.findFirst({
    where: { id: params.id, workspaceId, deletedAt: null },
  });
  if (!product) notFound();

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <header className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{product.name}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Status: {product.status}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild variant="outline">
            <Link href={`/app/products/${product.id}/reviews`}>Reviews</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href={`/app/products/${product.id}/directories`}>Directories</Link>
          </Button>
          {product.status === "LIVE" ? (
            <Button asChild variant="outline">
              <Link href={`/products/${product.slug}`}>View public page</Link>
            </Button>
          ) : null}
        </div>
      </header>

      <Tabs defaultValue="basics" className="mt-8">
        <TabsList>
          <TabsTrigger value="basics">Basics</TabsTrigger>
          <TabsTrigger value="seo">SEO</TabsTrigger>
        </TabsList>
        <TabsContent value="basics">
          <Card className="mt-4">
            <CardHeader>
              <CardTitle>Product details</CardTitle>
              <CardDescription>
                Public on your product page once published.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <EditProductForm product={product} mode="basics" />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="seo">
          <Card className="mt-4">
            <CardHeader>
              <CardTitle>SEO</CardTitle>
              <CardDescription>
                Meta title and description for search engines. Use AI prefill to
                generate first drafts.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <EditProductForm product={product} mode="seo" />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
