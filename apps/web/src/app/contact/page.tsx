import Link from "next/link";
import { Mail, MessageCircle, LifeBuoy, Briefcase } from "lucide-react";
import { buildMetadata } from "@launchmint/seo-meta";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { ContactForm } from "./contact-form";

export const metadata = buildMetadata({
  title: "Contact — LaunchMint",
  description:
    "Get in touch with the LaunchMint team. Support, partnerships, press, and general inquiries.",
  path: "/contact",
});

const CHANNELS = [
  {
    icon: LifeBuoy,
    title: "Support",
    body: "Account issues, bugs, or stuck submissions. We reply within one business day.",
    href: "mailto:support@launchmint.com",
    cta: "support@launchmint.com",
  },
  {
    icon: Briefcase,
    title: "Partnerships",
    body: "Directory operators, integration partners, and affiliate programs.",
    href: "mailto:partners@launchmint.com",
    cta: "partners@launchmint.com",
  },
  {
    icon: MessageCircle,
    title: "Press",
    body: "Quotes, interviews, and data about the indie launch landscape.",
    href: "mailto:press@launchmint.com",
    cta: "press@launchmint.com",
  },
];

export default function ContactPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden border-b">
          <div
            aria-hidden
            className="pointer-events-none absolute -top-32 left-1/2 -z-10 h-[460px] w-[1100px] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,theme(colors.yellow.200/0.4),transparent_70%)] blur-2xl"
          />
          <div className="mx-auto max-w-4xl px-4 py-20 text-center">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
              Contact
            </p>
            <h1 className="mt-5 text-5xl font-semibold leading-[1.02] tracking-tight sm:text-6xl">
              We read every message.
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-base text-muted-foreground">
              Whether you&apos;re stuck on a directory submission or want to
              pitch a partnership — drop us a line. Real humans, reasonable
              response times.
            </p>
          </div>
        </section>

        {/* Channels + form */}
        <section className="mx-auto max-w-6xl px-4 py-20">
          <div className="grid gap-12 lg:grid-cols-[1fr_1.2fr]">
            {/* Channels */}
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                Pick a channel
              </p>
              <h2 className="mt-4 text-2xl font-semibold tracking-tight">
                Get the right pair of eyes.
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Route your message to the person who can actually help.
              </p>

              <ul className="mt-8 space-y-4">
                {CHANNELS.map((c) => (
                  <li key={c.title}>
                    <a
                      href={c.href}
                      className="group flex items-start gap-4 rounded-2xl border p-5 transition-colors hover:border-foreground/20 hover:bg-muted/30"
                    >
                      <span
                        aria-hidden
                        className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-foreground text-background"
                      >
                        <c.icon className="h-5 w-5" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-base font-semibold tracking-tight">
                          {c.title}
                        </p>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {c.body}
                        </p>
                        <p className="mt-2 flex items-center gap-1 text-sm font-medium text-foreground">
                          <Mail className="h-3.5 w-3.5" aria-hidden />
                          {c.cta}
                        </p>
                      </div>
                    </a>
                  </li>
                ))}
              </ul>

              <div className="mt-8 rounded-2xl border bg-muted/20 p-5 text-sm">
                <p className="font-medium">Already a customer?</p>
                <p className="mt-1 text-muted-foreground">
                  Faster replies via the in-app help button.{" "}
                  <Link
                    href="/signin"
                    className="font-medium text-foreground underline-offset-4 hover:underline"
                  >
                    Sign in
                  </Link>
                  .
                </p>
              </div>
            </div>

            {/* Form */}
            <div className="rounded-2xl border bg-background p-6 shadow-sm sm:p-8">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                Or just send us a note
              </p>
              <h2 className="mt-3 text-2xl font-semibold tracking-tight">
                Write us anything.
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                We&apos;ll reply from a real email address, not a no-reply.
              </p>

              <div className="mt-6">
                <ContactForm />
              </div>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
