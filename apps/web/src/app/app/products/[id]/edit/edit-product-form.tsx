"use client";

import { useState, useTransition } from "react";
import type { Product } from "@launchmint/db";
import { Button, Input, Label, Textarea } from "@launchmint/ui";
import {
  aiPrefillAction,
  deleteProductAction,
  updateProductAction,
} from "../../actions";

export function EditProductForm({
  product,
  mode,
}: {
  product: Product;
  mode: "basics" | "seo";
}) {
  const [name, setName] = useState(product.name);
  const [tagline, setTagline] = useState(product.tagline);
  const [description, setDescription] = useState(product.description ?? "");
  const [websiteUrl, setWebsiteUrl] = useState(product.websiteUrl);
  const [metaTitle, setMetaTitle] = useState(product.metaTitle ?? "");
  const [metaDescription, setMetaDescription] = useState(
    product.metaDescription ?? "",
  );
  const [pending, start] = useTransition();
  const [aiPending, startAi] = useTransition();
  const [savedAt, setSavedAt] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

  function save() {
    setError(null);
    start(async () => {
      try {
        await updateProductAction({
          id: product.id,
          name,
          tagline,
          description,
          websiteUrl,
          metaTitle,
          metaDescription,
        });
        setSavedAt(new Date());
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not save");
      }
    });
  }

  function publish() {
    setError(null);
    start(async () => {
      try {
        await updateProductAction({
          id: product.id,
          name,
          tagline,
          description,
          websiteUrl,
          metaTitle,
          metaDescription,
          status: "LIVE",
        });
        setSavedAt(new Date());
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not publish");
      }
    });
  }

  function aiPrefill() {
    startAi(async () => {
      try {
        const res = await aiPrefillAction(product.id);
        setDescription(res.description);
        setMetaTitle(res.metaTitle);
        setMetaDescription(res.metaDescription);
      } catch (err) {
        setError(err instanceof Error ? err.message : "AI prefill failed");
      }
    });
  }

  function destroy() {
    if (!confirm(`Delete "${product.name}"? This cannot be undone.`)) return;
    start(async () => {
      await deleteProductAction(product.id);
    });
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        save();
      }}
      className="space-y-4"
    >
      {mode === "basics" ? (
        <>
          <div>
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="tagline">Tagline</Label>
            <Input
              id="tagline"
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              maxLength={160}
              required
            />
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={6}
              required
            />
          </div>
          <div>
            <Label htmlFor="websiteUrl">Website URL</Label>
            <Input
              id="websiteUrl"
              value={websiteUrl}
              onChange={(e) => setWebsiteUrl(e.target.value)}
              required
            />
          </div>
        </>
      ) : (
        <>
          <div className="flex items-center justify-end">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={aiPrefill}
              disabled={aiPending}
            >
              {aiPending ? "Generating..." : "AI prefill"}
            </Button>
          </div>
          <div>
            <Label htmlFor="metaTitle">Meta title</Label>
            <Input
              id="metaTitle"
              value={metaTitle}
              onChange={(e) => setMetaTitle(e.target.value)}
              maxLength={60}
            />
            <p className="mt-1 text-xs text-muted-foreground">
              {metaTitle.length}/60
            </p>
          </div>
          <div>
            <Label htmlFor="metaDescription">Meta description</Label>
            <Textarea
              id="metaDescription"
              value={metaDescription}
              onChange={(e) => setMetaDescription(e.target.value)}
              maxLength={160}
              rows={3}
            />
            <p className="mt-1 text-xs text-muted-foreground">
              {metaDescription.length}/160
            </p>
          </div>
        </>
      )}
      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}
      <div className="flex items-center justify-between border-t pt-4">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={destroy}
          disabled={pending}
        >
          Delete
        </Button>
        <div className="flex items-center gap-3">
          {savedAt ? (
            <span className="text-xs text-muted-foreground">Saved</span>
          ) : null}
          <Button type="submit" variant="outline" disabled={pending}>
            {pending ? "Saving..." : "Save draft"}
          </Button>
          <Button type="button" onClick={publish} disabled={pending}>
            {product.status === "LIVE" ? "Update" : "Publish"}
          </Button>
        </div>
      </div>
    </form>
  );
}
