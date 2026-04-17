# LaunchMint

> **Turn visibility into velocity.**

The all-in-one launch, SEO, review, backlink, founder identity, and startup growth platform. Replace 8 tools with one.

---

## What is LaunchMint?

LaunchMint is a SEO-first, web-based platform that combines what founders today get from Product Hunt, Peerlist, Trustpilot, RankInPublic, Ahrefs-lite, Indie Hackers, and G2 — into a single dashboard with an AI assistant powered by Google Gemini.

A solo SaaS founder can:
- **Launch a product** with a permanent, SEO-indexed page (not a one-day Product Hunt window).
- **Collect reviews** with verified-customer badges and AI-detected fake-review filtering.
- **Submit to 200+ startup directories** in hours instead of weeks, with AI-generated descriptions per directory.
- **Track SEO** — DR, backlinks, organic traffic, keyword rankings, spam score.
- **Compare against competitors** side-by-side.
- **Show verified MRR** pulled directly from Stripe.
- **Build a founder identity** at `launchmint.com/founder/yourname`.
- **Get AI help** with descriptions, meta tags, social posts, cold emails, launch readiness.

All from one subscription, $29–$299/mo (free tier available).

---

## Quick links

| Resource | Path |
|----------|------|
| Full PRD | [docs/PRD.md](./PRD.md) |
| Roadmap & 12-week sprint | [docs/ROADMAP.md](./ROADMAP.md) |
| Database schema | [docs/DATABASE.md](./DATABASE.md) |
| API reference | [docs/API.md](./API.md) |
| Architecture | [docs/ARCHITECTURE.md](./ARCHITECTURE.md) |
| Design system | [docs/DESIGN.md](./DESIGN.md) |
| SEO strategy | [docs/SEO.md](./SEO.md) |
| Monetization | [docs/MONETIZATION.md](./MONETIZATION.md) |
| Marketing | [docs/MARKETING.md](./MARKETING.md) |
| Onboarding & checklists | [docs/ONBOARDING.md](./ONBOARDING.md) |

---

## Tech stack

| Layer | Tool |
|-------|------|
| Frontend | Next.js 14 (App Router) + TypeScript + Tailwind + Shadcn |
| Icons | Lucide |
| Backend | Node.js 20 (Next API routes + standalone worker) |
| Database | PostgreSQL 16 (AWS RDS) |
| ORM | Prisma 5 |
| Cache + Queue | Redis 7 (ElastiCache) + BullMQ |
| Search | Typesense |
| Auth | NextAuth.js (Google OAuth) |
| AI | Google Gemini (1.5 Pro + Flash) |
| Email | Resend |
| Storage | AWS S3 + CloudFront |
| Billing | Razorpay (primary), Stripe (read-only for MRR) |
| SEO data | DataForSEO API |
| Analytics | PostHog |
| Errors | Sentry |
| CDN | Cloudflare |
| Infra | AWS EC2 + RDS + ElastiCache + S3, Docker Compose (no Kubernetes) |
| CI/CD | GitHub Actions |

---

## Brand

- Colors: **white** (#FFFFFF) and **yellow** (#FACC15 primary, #FEF3C7 accent), plus neutrals (zinc).
- **No gradients.**
- **No emojis** anywhere in product UI, copy, or docs.
- **Standard icons only** (Lucide).
- Typography: Inter for UI, JetBrains Mono for code/data.

Full brand & UI guide: [docs/DESIGN.md](./DESIGN.md).

---

## Repo structure

```
launchmint/
├── apps/
│   ├── web/              # Next.js 14 — public site + dashboard
│   └── worker/           # Node worker — BullMQ consumers
├── packages/
│   ├── ui/               # Shared Shadcn components
│   ├── db/               # Prisma schema + client
│   ├── auth/             # NextAuth config + RBAC
│   ├── ai/               # Gemini wrapper + prompts
│   ├── email/            # Resend templates + sender
│   ├── queue/            # BullMQ producers + job types
│   ├── seo-meta/         # JSON-LD + meta tag builders
│   ├── seo-data/         # DataForSEO wrapper
│   ├── storage/          # S3 wrapper
│   ├── billing/          # Razorpay + Stripe wrappers
│   ├── analytics/        # PostHog wrapper
│   ├── search/           # Typesense wrapper
│   └── config/           # Shared eslint, tsconfig, tailwind preset
├── docs/                 # PRD + supporting docs
├── scripts/              # Seed, migrate, scrape scripts
├── docker-compose.yml
├── pnpm-workspace.yaml
└── turbo.json
```

**DRY mandate:** All shared concerns live in `packages/`. App code in `apps/web` and `apps/worker` must never duplicate logic for AI, email, queue, DB, storage, billing, search, SEO, or auth. Build the shared packages **first** before any app feature (Sprint 1).

---

## Local development

### Prereqs

- Node 20+
- pnpm 9+
- Docker + Docker Compose
- A Google Cloud project with OAuth client (web)
- Gemini API key
- Resend API key
- DataForSEO sandbox credentials (or real)
- Razorpay test keys
- AWS S3 bucket (or LocalStack for dev)
- PostHog project (or skip in dev)

### Setup

```bash
# 1. Clone and install
git clone https://github.com/Sachinchaurasiya360/LanuchMint
cd launchmint
pnpm install

# 2. Boot local services (Postgres, Redis, Typesense)
docker compose up -d

# 3. Configure environment
cp .env.example .env
# Edit .env with your keys

# 4. Database
pnpm db:migrate
pnpm db:seed

# 5. Run web + worker (in two terminals)
pnpm --filter web dev
pnpm --filter worker dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Environment variables

See [.env.example](../.env.example). Required keys:

```
# Core
DATABASE_URL=postgresql://...
REDIS_URL=redis://localhost:6379
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Auth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# AI
GEMINI_API_KEY=
GEMINI_MODEL_PRO=gemini-1.5-pro
GEMINI_MODEL_FLASH=gemini-1.5-flash

# Email
RESEND_API_KEY=
RESEND_FROM=hello@launchmint.com

# Storage
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
S3_BUCKET=launchmint-uploads
S3_PUBLIC_URL=https://cdn.launchmint.com

# Search
TYPESENSE_HOST=localhost
TYPESENSE_PORT=8108
TYPESENSE_API_KEY=

# Billing
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
RAZORPAY_WEBHOOK_SECRET=
STRIPE_CLIENT_ID=        # Stripe Connect (read-only MRR)
STRIPE_CLIENT_SECRET=

# SEO data
DATAFORSEO_LOGIN=
DATAFORSEO_PASSWORD=

# Analytics & monitoring
POSTHOG_KEY=
POSTHOG_HOST=https://us.posthog.com
SENTRY_DSN=

# Misc
INDEXNOW_KEY=
CRON_SECRET=
```

---

## Database

```bash
# Create migration
pnpm db:migrate:dev --name add_x

# Apply pending migrations
pnpm db:migrate

# Seed dev data (1 admin, 5 founders, 200 directories, 10 products)
pnpm db:seed

# Open Prisma Studio
pnpm db:studio
```

Schema: [docs/DATABASE.md](./DATABASE.md).

---

## Running tests

```bash
pnpm test                # all unit tests
pnpm --filter web test   # web app only
pnpm test:e2e            # Playwright e2e
pnpm test:integration    # against test DB
```

---

## Deployment

### Production (MVP)

- Single AWS region (us-east-1).
- Web: deployed to **Vercel** (or EC2 with Docker if Vercel costs grow).
- Worker: **Docker Compose on a t3.large EC2** (private subnet).
- DB: **RDS Postgres 16** (db.t3.medium, multi-AZ).
- Redis: **ElastiCache** (cache.t4g.small).
- Search: **Typesense** in same EC2 Docker Compose.
- Storage: **S3 + CloudFront**.
- DNS + CDN: **Cloudflare**.

### CI/CD (GitHub Actions)

```
on push to main:
  - lint, typecheck, test
  - build apps/web (next build)
  - build apps/worker (tsc + bundle)
  - on success:
    - deploy web to Vercel
    - SSH deploy worker to EC2 (docker compose pull && up -d)
    - run pending Prisma migrations (with confirm gate for destructive)
    - notify Slack / email via Resend
```

### Rollback

- Web: redeploy previous Vercel deployment (one-click).
- Worker: SSH and `docker compose up -d --no-deps worker:previous-tag`.
- DB: PITR via RDS console.

---

## Contributing

Internal repo, but house style:

- **TypeScript** strict mode everywhere.
- **ESLint** + **Prettier**, autoformat on save.
- **Conventional commits** (`feat:`, `fix:`, `chore:`, `docs:`).
- **Branches:** `main` (production), `develop` (staging), feature branches `feat/<short-name>`.
- **PRs:** require 1 review, all CI checks green.
- **No code without tests** for shared `packages/*`. App-level UI tests via Playwright.
- **DRY mandate:** if you write the same thing twice across apps, extract to `packages/`.

---

## Status & support

- Production: [https://launchmint.com](https://launchmint.com)
- Docs: this folder
- Status page: [https://status.launchmint.com](https://status.launchmint.com) (V1)
- Internal Slack: #launchmint
- Customer email: hello@launchmint.com (delivered via Resend)

---

## License

Proprietary. Copyright LaunchMint, all rights reserved.
