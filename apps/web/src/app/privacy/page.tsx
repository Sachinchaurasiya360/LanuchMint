import Link from "next/link";
import { buildMetadata } from "@launchmint/seo-meta";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export const metadata = buildMetadata({
  title: "Privacy Policy — LaunchMint",
  description:
    "How LaunchMint collects, uses, and protects your personal data.",
  path: "/privacy",
});

const LAST_UPDATED = "April 20, 2026";

const SECTIONS = [
  {
    id: "intro",
    heading: "1. Who we are",
    body: [
      "LaunchMint (\"we\", \"us\", \"our\") operates launchmint.com and the associated launch platform for indie founders. This Privacy Policy explains what personal data we collect, why we collect it, and what you can do about it.",
    ],
  },
  {
    id: "collect",
    heading: "2. What we collect",
    body: [
      "Account data: your name, email, hashed password (when using email sign-up), and OAuth provider ID (when using Google sign-in).",
      "Product content: the information you add to your workspace — product pages, founder profiles, reviews you author, directory submissions.",
      "Usage data: pages viewed, features used, approximate geolocation, device and browser information, and referrer URLs. We use this to improve the Service.",
      "Billing data: processed by our payment provider (Razorpay). We store only the billing metadata needed to manage your subscription, not card numbers.",
    ],
  },
  {
    id: "use",
    heading: "3. How we use it",
    body: [
      "To operate the Service — authenticate you, store your workspace, submit your product to directories, track your rankings, and display your pages publicly.",
      "To communicate with you about account activity, product updates, and support requests.",
      "To improve the Service through aggregated analytics and usage insights.",
      "To comply with legal obligations and prevent abuse.",
    ],
  },
  {
    id: "share",
    heading: "4. Who we share it with",
    body: [
      "Service providers that host, monitor, or support LaunchMint (hosting, email delivery, error monitoring, analytics). They process data on our behalf under contractual obligations.",
      "Public pages: information you choose to publish (product pages, founder profiles, reviews) is publicly visible and may be indexed by search engines and AI crawlers.",
      "Legal requirements: we may disclose data when required by law or to protect rights, safety, and the integrity of the Service.",
      "We do not sell your personal data.",
    ],
  },
  {
    id: "cookies",
    heading: "5. Cookies and tracking",
    body: [
      "We use first-party cookies for authentication and to remember your preferences. We use privacy-respecting analytics to understand usage patterns in aggregate.",
      "You can control cookies through your browser settings. Disabling essential cookies will prevent you from signing in.",
    ],
  },
  {
    id: "retention",
    heading: "6. Data retention",
    body: [
      "We retain your account data while your account is active and for a reasonable period after closure to handle disputes, prevent fraud, and comply with legal obligations (typically up to 12 months).",
      "Public product pages and reviews may persist after account deletion if the content was published and relied upon by others — we'll anonymize the author where feasible.",
    ],
  },
  {
    id: "rights",
    heading: "7. Your rights",
    body: [
      "Depending on your jurisdiction, you may have the right to access, correct, export, or delete your personal data, and to object to or restrict certain processing.",
      "To exercise any of these rights, email privacy@launchmint.com from the email on your account. We'll respond within 30 days.",
    ],
  },
  {
    id: "security",
    heading: "8. Security",
    body: [
      "Passwords are hashed with bcrypt. Data in transit is encrypted via TLS. Production data is encrypted at rest by our hosting providers.",
      "No system is perfectly secure. If we ever discover a breach affecting your data, we'll notify you without undue delay.",
    ],
  },
  {
    id: "children",
    heading: "9. Children",
    body: [
      "LaunchMint is not intended for children under 16. We don't knowingly collect personal data from children under 16. If we learn that we have, we'll delete it.",
    ],
  },
  {
    id: "international",
    heading: "10. International transfers",
    body: [
      "We may process data in countries other than the one you live in. When we transfer data internationally, we rely on appropriate safeguards, including standard contractual clauses.",
    ],
  },
  {
    id: "changes",
    heading: "11. Changes to this policy",
    body: [
      "We may update this Policy as our practices evolve. Material changes will be announced via email or in-app notice at least 30 days before they take effect.",
    ],
  },
  {
    id: "contact",
    heading: "12. Contact",
    body: [
      "Questions or requests related to privacy? Email privacy@launchmint.com.",
    ],
  },
];

export default function PrivacyPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-16">
        <header className="border-b pb-10">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
            Legal
          </p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
            Privacy Policy
          </h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Last updated: {LAST_UPDATED}
          </p>
        </header>

        <div className="mt-12 grid gap-12 lg:grid-cols-[220px_1fr]">
          <aside className="hidden lg:block">
            <div className="sticky top-24">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                On this page
              </p>
              <nav className="mt-4">
                <ul className="space-y-2 text-sm">
                  {SECTIONS.map((s) => (
                    <li key={s.id}>
                      <a
                        href={`#${s.id}`}
                        className="text-muted-foreground transition-colors hover:text-foreground"
                      >
                        {s.heading}
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>
            </div>
          </aside>

          <article className="max-w-2xl space-y-10 text-[15px] leading-relaxed text-muted-foreground">
            {SECTIONS.map((s) => (
              <section key={s.id} id={s.id} className="scroll-mt-24">
                <h2 className="text-xl font-semibold tracking-tight text-foreground">
                  {s.heading}
                </h2>
                {s.body.map((p, i) => (
                  <p key={i} className="mt-3">
                    {p}
                  </p>
                ))}
              </section>
            ))}

            <div className="rounded-2xl border bg-muted/30 p-5 text-sm">
              <p className="font-medium text-foreground">
                Privacy question or data request?
              </p>
              <p className="mt-1">
                Head to the{" "}
                <Link
                  href="/contact"
                  className="font-medium text-foreground underline-offset-4 hover:underline"
                >
                  contact page
                </Link>{" "}
                or email{" "}
                <a
                  href="mailto:privacy@launchmint.com"
                  className="font-medium text-foreground underline-offset-4 hover:underline"
                >
                  privacy@launchmint.com
                </a>
                .
              </p>
            </div>
          </article>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
