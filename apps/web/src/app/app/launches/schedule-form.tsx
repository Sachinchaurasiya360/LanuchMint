"use client";

import { useState, useTransition } from "react";
import {
  Button,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@launchmint/ui";
import { scheduleLaunchAction } from "./actions";

interface ScheduleLaunchFormProps {
  products: { id: string; name: string }[];
}

export function ScheduleLaunchForm({ products }: ScheduleLaunchFormProps) {
  const [productId, setProductId] = useState(products[0]?.id ?? "");
  const [scheduledAt, setScheduledAt] = useState(defaultDateTime());
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    startTransition(async () => {
      try {
        const iso = new Date(scheduledAt).toISOString();
        await scheduleLaunchAction({ productId, scheduledAt: iso });
        setSuccess(true);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to schedule");
      }
    });
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-4 sm:grid-cols-3">
      <div className="sm:col-span-1">
        <Label htmlFor="launch-product">Product</Label>
        <Select value={productId} onValueChange={setProductId}>
          <SelectTrigger id="launch-product" className="mt-1">
            <SelectValue placeholder="Pick a product" />
          </SelectTrigger>
          <SelectContent>
            {products.map((p) => (
              <SelectItem key={p.id} value={p.id}>
                {p.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="sm:col-span-1">
        <Label htmlFor="launch-when">Launch at (UTC)</Label>
        <Input
          id="launch-when"
          type="datetime-local"
          value={scheduledAt}
          onChange={(e) => setScheduledAt(e.target.value)}
          className="mt-1"
          required
        />
      </div>
      <div className="flex items-end">
        <Button type="submit" disabled={isPending || !productId}>
          {isPending ? "Scheduling..." : "Schedule launch"}
        </Button>
      </div>
      {error ? (
        <p className="sm:col-span-3 text-sm text-red-600">{error}</p>
      ) : null}
      {success ? (
        <p className="sm:col-span-3 text-sm text-green-700">
          Scheduled. Readiness scoring is running in the background.
        </p>
      ) : null}
    </form>
  );
}

function defaultDateTime() {
  const d = new Date(Date.now() + 24 * 60 * 60 * 1000);
  d.setUTCMinutes(0, 0, 0);
  return d.toISOString().slice(0, 16);
}
