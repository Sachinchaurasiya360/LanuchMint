"use client";

import { useState, useTransition } from "react";
import { Button, Input, Label, Textarea } from "@launchmint/ui";
import { createProductAction, scrapeUrlAction } from "../actions";

const CATEGORIES = [
  "Productivity",
  "Developer Tools",
  "Marketing",
  "Sales",
  "Analytics",
  "Design",
  "AI",
  "SaaS",
  "Other",
];

export function NewProductForm() {
  const [url, setUrl] = useState("");
  const [name, setName] = useState("");
  const [tagline, setTagline] = useState("");
  const [category, setCategory] = useState("SaaS");
  const [industry, setIndustry] = useState("");
  const [scraping, setScraping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  async function onScrape() {
    if (!url) return;
    setScraping(true);
    setError(null);
    try {
      const meta = await scrapeUrlAction(url);
      if (meta.title) setName(meta.title);
      if (meta.description) setTagline(meta.description.slice(0, 140));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not fetch the URL");
    } finally {
      setScraping(false);
    }
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name || !tagline || !url) return;
    start(async () => {
      try {
        await createProductAction({
          name,
          tagline,
          websiteUrl: url,
          category,
          industry: industry || undefined,
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not create product");
      }
    });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <Label htmlFor="url">Website URL</Label>
        <div className="mt-1 flex gap-2">
          <Input
            id="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://yourproduct.com"
            required
          />
          <Button
            type="button"
            variant="outline"
            onClick={onScrape}
            disabled={!url || scraping}
          >
            {scraping ? "Fetching..." : "Prefill"}
          </Button>
        </div>
      </div>
      <div>
        <Label htmlFor="name">Product name</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>
      <div>
        <Label htmlFor="tagline">Tagline</Label>
        <Textarea
          id="tagline"
          value={tagline}
          onChange={(e) => setTagline(e.target.value)}
          maxLength={160}
          required
        />
        <p className="mt-1 text-xs text-muted-foreground">
          {tagline.length}/160
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="category">Category</Label>
          <select
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <div>
          <Label htmlFor="industry">Industry (optional)</Label>
          <Input
            id="industry"
            value={industry}
            onChange={(e) => setIndustry(e.target.value)}
            placeholder="e.g. Fintech"
          />
        </div>
      </div>
      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}
      <div className="flex justify-end">
        <Button type="submit" disabled={pending}>
          {pending ? "Creating..." : "Create product"}
        </Button>
      </div>
    </form>
  );
}
