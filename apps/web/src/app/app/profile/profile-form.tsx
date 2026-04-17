"use client";

import { useState, useTransition } from "react";
import type { FounderProfile } from "@launchmint/db";
import { Button, Input, Label, Textarea } from "@launchmint/ui";
import { upsertFounderProfileAction } from "./actions";

export function ProfileForm({ initial }: { initial: FounderProfile | null }) {
  const [displayName, setDisplayName] = useState(initial?.displayName ?? "");
  const [headline, setHeadline] = useState(initial?.headline ?? "");
  const [bio, setBio] = useState(initial?.bio ?? "");
  const [location, setLocation] = useState(initial?.location ?? "");
  const [twitterUrl, setTwitterUrl] = useState(initial?.twitterUrl ?? "");
  const [linkedinUrl, setLinkedinUrl] = useState(initial?.linkedinUrl ?? "");
  const [websiteUrl, setWebsiteUrl] = useState(initial?.websiteUrl ?? "");
  const [githubUrl, setGithubUrl] = useState(initial?.githubUrl ?? "");
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<Date | null>(null);

  function submit(publish: boolean) {
    setError(null);
    start(async () => {
      try {
        await upsertFounderProfileAction({
          displayName,
          headline,
          bio,
          location,
          twitterUrl,
          linkedinUrl,
          websiteUrl,
          githubUrl,
          publish,
        });
        setSavedAt(new Date());
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not save");
      }
    });
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        submit(false);
      }}
      className="space-y-4"
    >
      <div>
        <Label htmlFor="displayName">Display name</Label>
        <Input
          id="displayName"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          required
        />
      </div>
      <div>
        <Label htmlFor="headline">Headline</Label>
        <Input
          id="headline"
          value={headline}
          onChange={(e) => setHeadline(e.target.value)}
          maxLength={120}
          placeholder="Founder of AcmeApp · ex-Stripe"
        />
      </div>
      <div>
        <Label htmlFor="bio">Bio</Label>
        <Textarea
          id="bio"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          rows={5}
          maxLength={1_000}
        />
      </div>
      <div>
        <Label htmlFor="location">Location</Label>
        <Input
          id="location"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="Bengaluru, India"
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="websiteUrl">Website</Label>
          <Input
            id="websiteUrl"
            value={websiteUrl}
            onChange={(e) => setWebsiteUrl(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="twitterUrl">Twitter / X</Label>
          <Input
            id="twitterUrl"
            value={twitterUrl}
            onChange={(e) => setTwitterUrl(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="linkedinUrl">LinkedIn</Label>
          <Input
            id="linkedinUrl"
            value={linkedinUrl}
            onChange={(e) => setLinkedinUrl(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="githubUrl">GitHub</Label>
          <Input
            id="githubUrl"
            value={githubUrl}
            onChange={(e) => setGithubUrl(e.target.value)}
          />
        </div>
      </div>
      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}
      <div className="flex items-center justify-between border-t pt-4">
        {savedAt ? (
          <span className="text-xs text-muted-foreground">Saved</span>
        ) : <span />}
        <div className="flex gap-3">
          <Button type="submit" variant="outline" disabled={pending}>
            {pending ? "Saving..." : "Save"}
          </Button>
          <Button type="button" onClick={() => submit(true)} disabled={pending}>
            {initial?.publishedAt ? "Update public page" : "Publish profile"}
          </Button>
        </div>
      </div>
    </form>
  );
}
