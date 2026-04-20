import Link from "next/link";
import { Suspense } from "react";
import { buildMetadata } from "@launchmint/seo-meta";
import { SignInForm } from "./signin-form";

export const metadata = buildMetadata({
  title: "Sign in — LaunchMint",
  description: "Sign in to LaunchMint to manage your launches, reviews, and directory submissions.",
  path: "/signin",
});

export default function SignInPage() {
  return (
    <div className="relative flex min-h-screen flex-col lg:flex-row">
      {/* Left panel: form */}
      <div className="relative flex flex-1 items-center justify-center px-4 py-16">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,theme(colors.yellow.100/0.5),transparent_60%)]"
        />
        <div className="w-full max-w-sm">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-base font-semibold tracking-tight"
          >
            <span
              aria-hidden
              className="relative grid h-7 w-7 place-items-center overflow-hidden rounded-md bg-foreground text-background"
            >
              <span className="text-[13px] font-bold leading-none">L</span>
              <span className="absolute inset-x-0 bottom-0 h-[2px] bg-yellow-400" />
            </span>
            LaunchMint<span className="text-yellow-500">.</span>
          </Link>

          <h1 className="mt-10 text-3xl font-semibold tracking-tight">
            Welcome back.
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Sign in to keep turning visibility into velocity.
          </p>

          <div className="mt-8">
            <Suspense fallback={null}>
              <SignInForm />
            </Suspense>
          </div>

          <p className="mt-8 text-sm text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link
              href="/signup"
              className="font-medium text-foreground underline-offset-4 hover:underline"
            >
              Create one free
            </Link>
          </p>

          <p className="mt-10 text-xs text-muted-foreground">
            By continuing you agree to our{" "}
            <Link href="/terms" className="underline-offset-4 hover:underline">
              Terms
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="underline-offset-4 hover:underline">
              Privacy Policy
            </Link>
            .
          </p>
        </div>
      </div>

      {/* Right panel: brand showcase */}
      <aside className="relative hidden flex-1 overflow-hidden bg-foreground text-background lg:block">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-32 -right-24 h-[520px] w-[520px] rounded-full bg-[radial-gradient(closest-side,theme(colors.yellow.300/0.35),transparent_70%)] blur-2xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-40 -left-16 h-[420px] w-[420px] rounded-full bg-[radial-gradient(closest-side,theme(colors.sky.300/0.25),transparent_70%)] blur-2xl"
        />

        <div className="relative flex h-full flex-col justify-between p-12">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-background/60">
            Turn visibility into velocity.
          </p>

          <blockquote className="max-w-md">
            <p className="text-2xl font-medium leading-snug tracking-tight">
              &ldquo;LaunchMint got us to #1 in our category, 47 verified
              reviews, and 4 AI citations in the first month. Nothing else
              compares.&rdquo;
            </p>
            <footer className="mt-6 flex items-center gap-3">
              <span
                aria-hidden
                className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-orange-400 to-pink-500 text-sm font-semibold text-white"
              >
                AK
              </span>
              <div className="text-sm">
                <p className="font-semibold">Ankit K.</p>
                <p className="text-background/60">Founder, Relay AI</p>
              </div>
            </footer>
          </blockquote>

          <ul className="grid gap-2 text-sm">
            {[
              "Launch page that ranks from day one",
              "Verified reviews with schema markup",
              "Auto-submit to 200+ directories",
              "Cited by ChatGPT, Claude & Perplexity",
            ].map((item) => (
              <li key={item} className="flex items-center gap-2">
                <span
                  aria-hidden
                  className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-yellow-300 text-foreground"
                >
                  <svg
                    viewBox="0 0 20 20"
                    className="h-3 w-3"
                    fill="currentColor"
                  >
                    <path d="M8.5 13.5 5 10l1.4-1.4 2.1 2.1 5.1-5.1L15 7z" />
                  </svg>
                </span>
                <span className="text-background/85">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </aside>
    </div>
  );
}
