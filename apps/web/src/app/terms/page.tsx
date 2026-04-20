import Link from "next/link";
import { buildMetadata } from "@launchmint/seo-meta";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export const metadata = buildMetadata({
  title: "Terms of Service — LaunchMint",
  description:
    "The terms governing your use of LaunchMint. Please read carefully.",
  path: "/terms",
});

const LAST_UPDATED = "April 20, 2026";

const SECTIONS = [
  {
    id: "acceptance",
    heading: "1. Acceptance of terms",
    body: [
      "By creating an account, signing in, or using any part of LaunchMint (the \"Service\"), you agree to be bound by these Terms of Service (\"Terms\"). If you're using LaunchMint on behalf of an organization, you represent that you have authority to bind that organization.",
      "If you don't agree to these Terms, you must not use the Service.",
    ],
  },
  {
    id: "account",
    heading: "2. Your account",
    body: [
      "You must provide accurate information when creating your account and keep it up to date. You're responsible for activity under your account and for safeguarding your credentials.",
      "Accounts are personal. You may add team members through workspace memberships, but you may not share a single credential with multiple people.",
    ],
  },
  {
    id: "acceptable-use",
    heading: "3. Acceptable use",
    body: [
      "You agree not to misuse the Service. That includes (but isn't limited to): scraping beyond documented API limits, attempting to gain unauthorized access, posting unlawful or harmful content, impersonating others, and submitting fake reviews or misleading metrics.",
      "We reserve the right to suspend or terminate accounts that violate these rules, with or without notice in cases of abuse.",
    ],
  },
  {
    id: "content",
    heading: "4. Your content",
    body: [
      "You retain ownership of the content you submit to LaunchMint (product copy, screenshots, reviews you author, etc.). You grant us a non-exclusive, worldwide, royalty-free license to host, display, and distribute that content as necessary to operate the Service — including indexing it for search and AI discovery.",
      "You're responsible for ensuring you have the rights to everything you upload.",
    ],
  },
  {
    id: "billing",
    heading: "5. Billing and cancellation",
    body: [
      "Paid plans are billed monthly or annually in advance. You can cancel anytime from your billing page. Paid features remain active through the end of the current billing period.",
      "We offer a 14-day refund on any charge — email support@launchmint.com from the account's email address.",
    ],
  },
  {
    id: "ip",
    heading: "6. Our intellectual property",
    body: [
      "The LaunchMint name, logo, software, and site (excluding your content) are owned by us. You may not copy, modify, or create derivative works from the Service without our written permission.",
    ],
  },
  {
    id: "warranty",
    heading: "7. Warranty disclaimer",
    body: [
      "The Service is provided \"as is\" and \"as available\" without warranties of any kind — express or implied. We don't guarantee particular search rankings, directory acceptance, review counts, or traffic outcomes.",
    ],
  },
  {
    id: "liability",
    heading: "8. Limitation of liability",
    body: [
      "To the maximum extent permitted by law, LaunchMint's total liability arising out of or related to these Terms will not exceed the amount you paid us in the 12 months preceding the event giving rise to the claim, or USD 100, whichever is greater.",
      "We are not liable for indirect, incidental, special, consequential, or punitive damages.",
    ],
  },
  {
    id: "termination",
    heading: "9. Termination",
    body: [
      "You can close your account at any time. We can terminate or suspend your access for violations of these Terms or where required by law.",
      "On termination, we'll delete your personal data on the timeline described in our Privacy Policy.",
    ],
  },
  {
    id: "changes",
    heading: "10. Changes to these terms",
    body: [
      "We may update these Terms as the Service evolves. Material changes will be announced via email or in-app notice at least 30 days before they take effect. Continued use of the Service after changes constitutes acceptance.",
    ],
  },
  {
    id: "contact",
    heading: "11. Contact",
    body: [
      "Questions about these Terms? Email legal@launchmint.com.",
    ],
  },
];

export default function TermsPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-16">
        <header className="border-b pb-10">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
            Legal
          </p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
            Terms of Service
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
                Need to get in touch?
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
                  href="mailto:legal@launchmint.com"
                  className="font-medium text-foreground underline-offset-4 hover:underline"
                >
                  legal@launchmint.com
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
