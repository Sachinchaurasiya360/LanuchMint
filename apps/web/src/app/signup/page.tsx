import Link from "next/link";
import { buildMetadata } from "@launchmint/seo-meta";
import { SignUpForm } from "./signup-form";

export const metadata = buildMetadata({
  title: "Create your LaunchMint account",
  description:
    "Create a free LaunchMint account. Ship a launch page, collect verified reviews, and get cited by AI search engines.",
  path: "/signup",
});

export default function SignUpPage() {
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
            Create your account.
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Free forever plan. Ship your first launch in under 30 minutes.
          </p>

          <div className="mt-8">
            <SignUpForm />
          </div>

          <p className="mt-8 text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link
              href="/signin"
              className="font-medium text-foreground underline-offset-4 hover:underline"
            >
              Sign in
            </Link>
          </p>

          <p className="mt-10 text-xs text-muted-foreground">
            By signing up you agree to our{" "}
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

      {/* Right panel: value prop */}
      <aside className="relative hidden flex-1 overflow-hidden bg-foreground text-background lg:block">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-32 -right-24 h-[520px] w-[520px] rounded-full bg-[radial-gradient(closest-side,theme(colors.yellow.300/0.35),transparent_70%)] blur-2xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-40 -left-16 h-[420px] w-[420px] rounded-full bg-[radial-gradient(closest-side,theme(colors.fuchsia.300/0.22),transparent_70%)] blur-2xl"
        />

        <div className="relative flex h-full flex-col justify-between p-12">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-background/60">
            Turn visibility into velocity.
          </p>

          <div className="max-w-md">
            <h2 className="text-4xl font-semibold leading-[1.05] tracking-tight">
              Ship a launch that
              <br />
              keeps earning traffic{" "}
              <span className="relative inline-block">
                <span className="relative z-10 text-foreground">forever</span>
                <span
                  aria-hidden
                  className="absolute inset-x-[-4px] bottom-1 z-0 h-[12px] -rotate-1 bg-yellow-300"
                />
              </span>
              .
            </h2>
            <p className="mt-5 text-base text-background/70">
              Most launches go quiet after launch day. LaunchMint keeps the
              flywheel turning — SEO, reviews, directories, AI citations.
            </p>
          </div>

          <div className="grid gap-3 text-sm">
            {[
              { k: "200+", v: "Directories we auto-submit to" },
              { k: "4 steps", v: "From sign-up to live launch" },
              { k: "Daily", v: "Keyword rank & backlink tracking" },
            ].map((s) => (
              <div
                key={s.v}
                className="flex items-center justify-between rounded-xl border border-background/10 bg-background/5 px-4 py-3 backdrop-blur"
              >
                <span className="text-background/75">{s.v}</span>
                <span className="font-mono text-sm font-semibold">{s.k}</span>
              </div>
            ))}
          </div>
        </div>
      </aside>
    </div>
  );
}
