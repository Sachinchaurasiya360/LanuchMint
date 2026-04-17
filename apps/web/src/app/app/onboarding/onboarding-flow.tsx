"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check } from "lucide-react";
import { Button, Input, Label, Textarea } from "@launchmint/ui";
import { upsertFounderProfileAction } from "../profile/actions";
import { createProductAction, scrapeUrlAction } from "../products/actions";

const STEPS = [
  "Welcome",
  "Founder profile",
  "Connect socials",
  "Add product",
  "SEO basics",
  "Done",
];

export function OnboardingFlow({
  initial,
}: {
  initial: { hasProfile: boolean; displayName: string; hasProduct: boolean };
}) {
  const router = useRouter();
  const [step, setStep] = useState(initial.hasProduct ? 5 : initial.hasProfile ? 3 : 1);
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  // step 1+2 state
  const [displayName, setDisplayName] = useState(initial.displayName);
  const [headline, setHeadline] = useState("");
  const [bio, setBio] = useState("");
  const [twitterUrl, setTwitterUrl] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");

  // step 3 state
  const [url, setUrl] = useState("");
  const [name, setName] = useState("");
  const [tagline, setTagline] = useState("");

  function next() {
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  }
  function back() {
    setStep((s) => Math.max(s - 1, 0));
  }

  async function saveProfile(publish: boolean) {
    setError(null);
    return new Promise<void>((resolve) => {
      start(async () => {
        try {
          await upsertFounderProfileAction({
            displayName,
            headline,
            bio,
            twitterUrl,
            linkedinUrl,
            publish,
          });
          resolve();
        } catch (err) {
          setError(err instanceof Error ? err.message : "Could not save");
          resolve();
        }
      });
    });
  }

  async function prefillFromUrl() {
    if (!url) return;
    try {
      const meta = await scrapeUrlAction(url);
      if (meta.title) setName(meta.title);
      if (meta.description) setTagline(meta.description.slice(0, 140));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not fetch URL");
    }
  }

  async function createProduct() {
    setError(null);
    start(async () => {
      try {
        await createProductAction({
          name,
          tagline,
          websiteUrl: url,
          category: "SaaS",
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not create");
      }
    });
  }

  return (
    <div>
      <ol className="mb-6 grid grid-cols-6 gap-1">
        {STEPS.map((label, i) => (
          <li
            key={label}
            className={`h-1 rounded-full ${i <= step ? "bg-primary" : "bg-secondary"}`}
            aria-label={label}
          />
        ))}
      </ol>

      {step === 0 ? (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Welcome aboard</h2>
          <p className="text-sm text-muted-foreground">
            We'll set up your founder profile, connect your socials, and add
            your first product. Takes about 4 minutes.
          </p>
          <div className="flex justify-end">
            <Button onClick={next}>Get started</Button>
          </div>
        </div>
      ) : null}

      {step === 1 ? (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Tell us about yourself</h2>
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
              placeholder="Founder of AcmeApp"
            />
          </div>
          <div>
            <Label htmlFor="bio">Short bio</Label>
            <Textarea
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={4}
              maxLength={500}
            />
          </div>
          <Footer
            onBack={back}
            onNext={async () => {
              await saveProfile(false);
              next();
            }}
            pending={pending}
          />
        </div>
      ) : null}

      {step === 2 ? (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Connect your socials</h2>
          <div>
            <Label htmlFor="twitter">Twitter / X URL</Label>
            <Input
              id="twitter"
              value={twitterUrl}
              onChange={(e) => setTwitterUrl(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="linkedin">LinkedIn URL</Label>
            <Input
              id="linkedin"
              value={linkedinUrl}
              onChange={(e) => setLinkedinUrl(e.target.value)}
            />
          </div>
          <Footer
            onBack={back}
            onNext={async () => {
              await saveProfile(true);
              next();
            }}
            pending={pending}
            nextLabel="Save and continue"
          />
        </div>
      ) : null}

      {step === 3 ? (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Add your first product</h2>
          <div>
            <Label htmlFor="url">Product URL</Label>
            <div className="mt-1 flex gap-2">
              <Input
                id="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://yourproduct.com"
              />
              <Button type="button" variant="outline" onClick={prefillFromUrl}>
                Prefill
              </Button>
            </div>
          </div>
          <div>
            <Label htmlFor="name">Name</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="tagline">Tagline</Label>
            <Textarea
              id="tagline"
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              maxLength={160}
            />
          </div>
          <Footer
            onBack={back}
            onNext={async () => {
              await createProduct();
              next();
            }}
            pending={pending}
            nextLabel="Create product"
            disabled={!name || !tagline || !url}
          />
        </div>
      ) : null}

      {step === 4 ? (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">SEO basics</h2>
          <p className="text-sm text-muted-foreground">
            We'll auto-generate meta tags from your tagline and category. You
            can edit them anytime from the product's SEO tab.
          </p>
          <Footer onBack={back} onNext={next} pending={pending} />
        </div>
      ) : null}

      {step === 5 ? (
        <div className="space-y-4 text-center">
          <Check className="mx-auto h-10 w-10 text-foreground" aria-hidden />
          <h2 className="text-lg font-semibold">You're all set</h2>
          <p className="text-sm text-muted-foreground">
            Your workspace is ready. Head to the dashboard to launch your product.
          </p>
          {error ? (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          ) : null}
          <Button onClick={() => router.push("/app")} disabled={pending}>
            Go to dashboard
          </Button>
        </div>
      ) : null}

      {error && step !== 5 ? (
        <p className="mt-4 text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

function Footer({
  onBack,
  onNext,
  pending,
  nextLabel = "Continue",
  disabled,
}: {
  onBack: () => void;
  onNext: () => void | Promise<void>;
  pending: boolean;
  nextLabel?: string;
  disabled?: boolean;
}) {
  return (
    <div className="flex justify-between border-t pt-4">
      <Button type="button" variant="ghost" onClick={onBack} disabled={pending}>
        Back
      </Button>
      <Button type="button" onClick={onNext} disabled={pending || disabled}>
        {pending ? "Working..." : nextLabel}
      </Button>
    </div>
  );
}
