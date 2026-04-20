"use client";

import { useState, useTransition } from "react";
import { Button, Input, Label } from "@launchmint/ui";
import { addTrackedDomainAction, removeTrackedDomainAction } from "./actions";

interface Product {
  id: string;
  name: string;
}

export function AddDomainForm({ products }: { products: Product[] }) {
  const [domain, setDomain] = useState("");
  const [productId, setProductId] = useState(products[0]?.id ?? "");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  if (products.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Create a product first to track its domain.
      </p>
    );
  }

  return (
    <form
      className="grid gap-3 sm:grid-cols-[1fr_220px_auto]"
      onSubmit={(e) => {
        e.preventDefault();
        setError(null);
        startTransition(async () => {
          try {
            await addTrackedDomainAction({ domain, productId });
            setDomain("");
          } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to add domain");
          }
        });
      }}
    >
      <div>
        <Label htmlFor="domain">Domain</Label>
        <Input
          id="domain"
          placeholder="example.com"
          value={domain}
          onChange={(e) => setDomain(e.target.value)}
          required
        />
      </div>
      <div>
        <Label htmlFor="product">Product</Label>
        <select
          id="product"
          className="flex h-9 w-full rounded-md border bg-background px-3 text-sm"
          value={productId}
          onChange={(e) => setProductId(e.target.value)}
        >
          {products.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </div>
      <div className="self-end">
        <Button type="submit" disabled={pending || !domain || !productId}>
          {pending ? "Adding..." : "Add"}
        </Button>
      </div>
      {error ? (
        <p className="col-span-full text-sm text-red-600">{error}</p>
      ) : null}
    </form>
  );
}

export function RemoveDomainButton({ id }: { id: string }) {
  const [pending, startTransition] = useTransition();
  return (
    <button
      type="button"
      className="text-xs text-muted-foreground hover:text-red-600 disabled:opacity-50"
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          await removeTrackedDomainAction(id).catch(() => {});
        })
      }
    >
      {pending ? "..." : "Remove"}
    </button>
  );
}
