# LaunchMint - Database Schema

**Database:** PostgreSQL 16
**ORM:** Prisma 5
**Multi-tenancy:** Single DB, row-level scoping via `workspaceId` on every tenant-owned table.
**Soft deletes:** `deletedAt` on user-facing entities; hard delete via admin only after 30 days.
**ID strategy:** `cuid2` (collision-resistant, sortable, URL-safe). Never expose internal numeric IDs.

---

## Entity overview

```
User ─┬─ WorkspaceMember ─── Workspace ─┬── Product ─┬── Launch
      │                                  │            ├── Review ── ReviewReply
      │                                  │            ├── Comment
      │                                  │            ├── Upvote
      │                                  │            ├── DirectorySubmission ─ Directory
      │                                  │            ├── KeywordRanking
      │                                  │            ├── Backlink
      │                                  │            ├── SeoSnapshot
      │                                  │            └── MrrSnapshot
      │                                  ├── FounderProfile
      │                                  ├── TeamProfile
      │                                  ├── Subscription
      │                                  ├── UsageCounter
      │                                  ├── Integration (Stripe, X, LinkedIn)
      │                                  ├── Notification
      │                                  └── ApiKey (V1)
      └── AuditLog (global)
      └── AiGeneration (per workspace)
      └── Badge (issued by mod)
```

---

## Prisma schema

```prisma
// schema.prisma
generator client { provider = "prisma-client-js" }
datasource db { provider = "postgresql"; url = env("DATABASE_URL") }

// ──────────────────────────────────────────────────────────────────────────────
// Identity
// ──────────────────────────────────────────────────────────────────────────────

model User {
  id            String   @id @default(cuid())
  email         String   @unique
  emailVerified DateTime?
  name          String?
  avatarUrl     String?
  googleId      String?  @unique
  isSuperAdmin  Boolean  @default(false)
  isModerator   Boolean  @default(false)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  deletedAt     DateTime?

  memberships     WorkspaceMember[]
  founderProfile  FounderProfile?
  reviewsAuthored Review[]          @relation("ReviewAuthor")
  commentsAuthored Comment[]         @relation("CommentAuthor")
  upvotes         Upvote[]
  notifications   Notification[]
  auditLogs       AuditLog[]
  badges          Badge[]
  referralsMade   Referral[]        @relation("Referrer")
  referralsRecv   Referral[]        @relation("Referred")
  apiKeys         ApiKey[]

  @@index([email])
  @@index([googleId])
}

model Workspace {
  id            String   @id @default(cuid())
  slug          String   @unique
  name          String
  type          WorkspaceType @default(FOUNDER)
  parentId      String?  // for Agency child workspaces
  parent        Workspace? @relation("AgencyChildren", fields: [parentId], references: [id])
  children      Workspace[] @relation("AgencyChildren")
  whiteLabelLogoUrl String?
  whiteLabelColor   String?
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  deletedAt     DateTime?

  members        WorkspaceMember[]
  products       Product[]
  founderProfile FounderProfile?
  teamProfiles   TeamProfile[]
  subscription   Subscription?
  usage          UsageCounter?
  integrations   Integration[]
  notifications  Notification[]
  aiGenerations  AiGeneration[]
  apiKeys        ApiKey[]
  domains        TrackedDomain[]

  @@index([slug])
  @@index([parentId])
}

enum WorkspaceType {
  FOUNDER
  TEAM
  AGENCY
  CLIENT
}

model WorkspaceMember {
  id          String   @id @default(cuid())
  userId      String
  workspaceId String
  role        Role
  invitedBy   String?
  invitedAt   DateTime?
  joinedAt    DateTime @default(now())
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  workspace   Workspace @relation(fields: [workspaceId], references: [id], onDelete: Cascade)

  @@unique([userId, workspaceId])
  @@index([workspaceId])
  @@index([userId])
}

enum Role {
  OWNER
  FOUNDER
  TEAM_MEMBER
  AGENCY_OPERATOR
  CLIENT_VIEWER
  INVESTOR
  // SuperAdmin and Moderator are flags on User, not workspace roles
}

// ──────────────────────────────────────────────────────────────────────────────
// Founder, Team, Product
// ──────────────────────────────────────────────────────────────────────────────

model FounderProfile {
  id           String  @id @default(cuid())
  workspaceId  String  @unique
  userId       String  @unique
  slug         String  @unique
  displayName  String
  headline     String?
  bio          String?
  location     String?
  twitterUrl   String?
  linkedinUrl  String?
  websiteUrl   String?
  githubUrl    String?
  isVerified   Boolean @default(false)
  publishedAt  DateTime?
  metadata     Json?
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
  deletedAt    DateTime?

  workspace Workspace @relation(fields: [workspaceId], references: [id])
  user      User      @relation(fields: [userId], references: [id])

  @@index([slug])
  @@index([workspaceId])
}

model TeamProfile {
  id           String  @id @default(cuid())
  workspaceId  String
  slug         String  @unique
  name         String
  websiteUrl   String?
  bio          String?
  metadata     Json?
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  workspace Workspace @relation(fields: [workspaceId], references: [id])

  @@index([workspaceId])
  @@index([slug])
}

model Product {
  id           String  @id @default(cuid())
  workspaceId  String
  slug         String  @unique          // immutable post-publish
  name         String
  tagline      String
  description  String                    // long-form, markdown allowed
  websiteUrl   String
  logoUrl      String?
  ogImageUrl   String?
  category     String                    // e.g., "email-marketing"
  industry     String?                   // e.g., "saas"
  pricingModel String?                   // free|freemium|trial|paid|opensource
  status       ProductStatus @default(DRAFT)
  publishedAt  DateTime?
  metaTitle    String?
  metaDescription String?
  seoKeywords  String[]
  trustScore   Int      @default(0)      // 0-100, computed
  launchScore  Int      @default(0)      // 0-100, AI launch readiness
  metadata     Json?
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
  deletedAt    DateTime?

  workspace        Workspace @relation(fields: [workspaceId], references: [id])
  launches         Launch[]
  reviews          Review[]
  comments         Comment[]
  upvotes          Upvote[]
  screenshots      Screenshot[]
  links            ProductLink[]
  directorySubs    DirectorySubmission[]
  keywordRankings  KeywordRanking[]
  backlinks        Backlink[]
  seoSnapshots     SeoSnapshot[]
  mrrSnapshots     MrrSnapshot[]

  @@index([workspaceId])
  @@index([slug])
  @@index([category])
  @@index([publishedAt])
}

enum ProductStatus {
  DRAFT
  SCHEDULED
  LIVE
  ARCHIVED
}

model Screenshot {
  id        String  @id @default(cuid())
  productId String
  url       String
  caption   String?
  order     Int     @default(0)
  product   Product @relation(fields: [productId], references: [id], onDelete: Cascade)

  @@index([productId])
}

model ProductLink {
  id        String  @id @default(cuid())
  productId String
  type      String  // appstore | playstore | docs | github | x | linkedin
  url       String
  product   Product @relation(fields: [productId], references: [id], onDelete: Cascade)
  @@index([productId])
}

// ──────────────────────────────────────────────────────────────────────────────
// Launch event
// ──────────────────────────────────────────────────────────────────────────────

model Launch {
  id          String   @id @default(cuid())
  productId   String
  scheduledAt DateTime
  goneLiveAt  DateTime?
  endedAt     DateTime?
  timezone    String   @default("UTC")
  upvoteCount Int      @default(0)
  commentCount Int     @default(0)
  rank        Int?     // final daily rank
  status      LaunchStatus @default(SCHEDULED)
  metadata    Json?
  createdAt   DateTime @default(now())

  product Product @relation(fields: [productId], references: [id], onDelete: Cascade)

  @@index([productId])
  @@index([scheduledAt])
  @@index([status])
}

enum LaunchStatus {
  SCHEDULED
  LIVE
  ENDED
  CANCELLED
}

// ──────────────────────────────────────────────────────────────────────────────
// Reviews, comments, upvotes
// ──────────────────────────────────────────────────────────────────────────────

model Review {
  id              String  @id @default(cuid())
  productId       String
  authorId        String?              // null if anonymous (not allowed at MVP, reserved)
  authorEmail     String?              // for verification when authorId null
  rating          Int                  // 1–5
  title           String?
  body            String
  isVerified      Boolean @default(false)
  verificationMethod String?           // "magic_link" | "domain_match" | "manual"
  isFlagged       Boolean @default(false)
  fakeScore       Float?               // 0–1, 1 = highly likely fake
  status          ReviewStatus @default(PENDING)
  publishedAt     DateTime?
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  deletedAt       DateTime?

  product Product       @relation(fields: [productId], references: [id], onDelete: Cascade)
  author  User?         @relation("ReviewAuthor", fields: [authorId], references: [id])
  reply   ReviewReply?

  @@index([productId])
  @@index([authorId])
  @@index([status])
}

enum ReviewStatus {
  PENDING
  PUBLISHED
  FLAGGED
  REMOVED
}

model ReviewReply {
  id        String  @id @default(cuid())
  reviewId  String  @unique
  authorId  String
  body      String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  review Review @relation(fields: [reviewId], references: [id], onDelete: Cascade)
}

model Comment {
  id        String  @id @default(cuid())
  productId String
  authorId  String
  body      String
  parentId  String?           // threaded
  isFlagged Boolean @default(false)
  status    CommentStatus @default(PUBLISHED)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  deletedAt DateTime?

  product Product   @relation(fields: [productId], references: [id], onDelete: Cascade)
  author  User      @relation("CommentAuthor", fields: [authorId], references: [id])
  parent  Comment?  @relation("CommentReplies", fields: [parentId], references: [id])
  replies Comment[] @relation("CommentReplies")

  @@index([productId])
  @@index([authorId])
  @@index([parentId])
}

enum CommentStatus {
  PUBLISHED
  FLAGGED
  REMOVED
}

model Upvote {
  id        String  @id @default(cuid())
  productId String
  userId    String
  createdAt DateTime @default(now())

  product Product @relation(fields: [productId], references: [id], onDelete: Cascade)
  user    User    @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([productId, userId])
  @@index([productId])
  @@index([userId])
}

// ──────────────────────────────────────────────────────────────────────────────
// Directories
// ──────────────────────────────────────────────────────────────────────────────

model Directory {
  id              String  @id @default(cuid())
  slug            String  @unique
  name            String
  url             String
  submitUrl       String?
  description     String
  category        String[]                       // tags
  niche           String?
  domainRating    Int?                           // DR (cached)
  monthlyTraffic  Int?
  cost            String                         // "free" | "$X" | "free w/ paid"
  acceptanceRate  String?                        // "high" | "med" | "low"
  reviewSpeed     String?                        // "instant" | "1-3 days" | "1-2 weeks"
  hasApi          Boolean @default(false)
  apiNotes        String?
  status          DirectoryStatus @default(ACTIVE)
  metadata        Json?
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  submissions DirectorySubmission[]

  @@index([slug])
  @@index([category])
  @@index([domainRating])
  @@index([status])
}

enum DirectoryStatus {
  ACTIVE
  PAUSED
  DEAD
}

model DirectorySubmission {
  id              String   @id @default(cuid())
  productId       String
  directoryId     String
  workspaceId     String
  status          SubmissionStatus @default(PENDING)
  submittedAt     DateTime?
  livedAt         DateTime?
  rejectedAt      DateTime?
  liveUrl         String?                        // backlink URL once confirmed
  notes           String?
  generatedDescription String?                   // AI-generated, founder-edited
  metadata        Json?
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  product   Product   @relation(fields: [productId], references: [id], onDelete: Cascade)
  directory Directory @relation(fields: [directoryId], references: [id])

  @@unique([productId, directoryId])
  @@index([workspaceId])
  @@index([status])
}

enum SubmissionStatus {
  PENDING
  IN_PROGRESS
  SUBMITTED
  LIVE
  REJECTED
  EXPIRED
}

// ──────────────────────────────────────────────────────────────────────────────
// SEO + Backlinks
// ──────────────────────────────────────────────────────────────────────────────

model TrackedDomain {
  id          String  @id @default(cuid())
  workspaceId String
  productId   String?
  domain      String
  isPrimary   Boolean @default(false)
  addedAt     DateTime @default(now())
  workspace   Workspace @relation(fields: [workspaceId], references: [id], onDelete: Cascade)

  @@unique([workspaceId, domain])
  @@index([domain])
}

model SeoSnapshot {
  id              String   @id @default(cuid())
  productId       String
  domain          String
  domainRating    Int?
  organicTraffic  Int?
  organicKeywords Int?
  backlinkCount   Int?
  refDomainCount  Int?
  spamScore       Int?
  indexedPages    Int?
  source          String   @default("dataforseo")
  capturedAt      DateTime @default(now())

  product Product @relation(fields: [productId], references: [id], onDelete: Cascade)

  @@index([productId, capturedAt])
  @@index([domain])
}

model Backlink {
  id              String   @id @default(cuid())
  productId       String
  sourceUrl       String
  targetUrl       String
  anchorText      String?
  sourceDomainRating Int?
  isFollow        Boolean  @default(true)
  isLive          Boolean  @default(true)
  firstSeenAt     DateTime @default(now())
  lastSeenAt      DateTime @default(now())
  lostAt          DateTime?

  product Product @relation(fields: [productId], references: [id], onDelete: Cascade)

  @@unique([productId, sourceUrl, targetUrl])
  @@index([productId])
  @@index([isLive])
}

model KeywordRanking {
  id          String   @id @default(cuid())
  productId   String
  keyword     String
  position    Int?
  searchVolume Int?
  difficulty  Int?
  url         String?
  country     String   @default("global")
  capturedAt  DateTime @default(now())

  product Product @relation(fields: [productId], references: [id], onDelete: Cascade)

  @@index([productId, keyword])
  @@index([capturedAt])
}

// ──────────────────────────────────────────────────────────────────────────────
// MRR (verified, from Stripe)
// ──────────────────────────────────────────────────────────────────────────────

model MrrSnapshot {
  id          String   @id @default(cuid())
  productId   String
  mrrCents    Int
  currency    String   @default("USD")
  customerCount Int?
  source      String   @default("stripe")
  capturedAt  DateTime @default(now())

  product Product @relation(fields: [productId], references: [id], onDelete: Cascade)

  @@index([productId, capturedAt])
}

// ──────────────────────────────────────────────────────────────────────────────
// Integrations (per workspace)
// ──────────────────────────────────────────────────────────────────────────────

model Integration {
  id            String  @id @default(cuid())
  workspaceId   String
  type          IntegrationType
  externalId    String?
  accessToken   String?      // encrypted at rest
  refreshToken  String?
  expiresAt     DateTime?
  metadata      Json?
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  workspace Workspace @relation(fields: [workspaceId], references: [id], onDelete: Cascade)

  @@unique([workspaceId, type])
  @@index([workspaceId])
}

enum IntegrationType {
  STRIPE        // for MRR pull
  X
  LINKEDIN
  GITHUB
  GOOGLE_SEARCH_CONSOLE   // V1
}

// ──────────────────────────────────────────────────────────────────────────────
// AI usage / billing
// ──────────────────────────────────────────────────────────────────────────────

model AiGeneration {
  id            String   @id @default(cuid())
  workspaceId   String
  userId        String?
  type          String   // "product_description" | "meta" | "social_post" | ...
  model         String   // "gemini-1.5-pro" | "gemini-1.5-flash"
  promptTokens  Int
  outputTokens  Int
  costCents     Int
  creditsCharged Int
  status        String   // "ok" | "blocked_safety" | "error"
  prompt        String   @db.Text
  output        String?  @db.Text
  latencyMs     Int?
  createdAt     DateTime @default(now())

  workspace Workspace @relation(fields: [workspaceId], references: [id], onDelete: Cascade)

  @@index([workspaceId, createdAt])
  @@index([type])
}

model UsageCounter {
  id                   String  @id @default(cuid())
  workspaceId          String  @unique
  periodStart          DateTime
  periodEnd            DateTime
  aiCreditsUsed        Int     @default(0)
  seoChecksUsed        Int     @default(0)
  directorySubmissions Int     @default(0)
  reviewInvitesSent    Int     @default(0)
  reportsExported      Int     @default(0)
  updatedAt            DateTime @updatedAt

  workspace Workspace @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
}

// ──────────────────────────────────────────────────────────────────────────────
// Billing
// ──────────────────────────────────────────────────────────────────────────────

model Subscription {
  id                String   @id @default(cuid())
  workspaceId       String   @unique
  plan              Plan     @default(FREE)
  status            SubscriptionStatus @default(ACTIVE)
  razorpaySubId     String?  @unique
  razorpayCustomerId String?
  currentPeriodStart DateTime?
  currentPeriodEnd   DateTime?
  cancelAtPeriodEnd Boolean  @default(false)
  trialEndsAt       DateTime?
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt

  workspace Workspace @relation(fields: [workspaceId], references: [id], onDelete: Cascade)

  @@index([razorpaySubId])
}

enum Plan {
  FREE
  STARTER
  GROWTH
  PRO
  AGENCY
}

enum SubscriptionStatus {
  ACTIVE
  PAST_DUE
  CANCELED
  TRIALING
  PAUSED
}

// ──────────────────────────────────────────────────────────────────────────────
// Notifications, badges, audit
// ──────────────────────────────────────────────────────────────────────────────

model Notification {
  id          String   @id @default(cuid())
  workspaceId String?
  userId      String
  type        String
  title       String
  body        String?
  link        String?
  readAt      DateTime?
  createdAt   DateTime @default(now())

  user      User       @relation(fields: [userId], references: [id], onDelete: Cascade)
  workspace Workspace? @relation(fields: [workspaceId], references: [id])

  @@index([userId, readAt])
}

model Badge {
  id        String   @id @default(cuid())
  userId    String
  type      String   // "verified_founder" | "verified_customer" | "early_supporter"
  issuedAt  DateTime @default(now())
  issuedBy  String?  // moderator userId
  metadata  Json?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
  @@index([userId, type])
}

model AuditLog {
  id          String   @id @default(cuid())
  actorId     String?            // null for system
  workspaceId String?
  action      String             // "review.delete" | "user.suspend" | ...
  target      String?            // resource id
  metadata    Json?
  ipAddress   String?
  userAgent   String?
  createdAt   DateTime @default(now())

  actor User? @relation(fields: [actorId], references: [id])

  @@index([workspaceId, createdAt])
  @@index([action])
}

// ──────────────────────────────────────────────────────────────────────────────
// Referrals + Affiliates (V1)
// ──────────────────────────────────────────────────────────────────────────────

model Referral {
  id          String   @id @default(cuid())
  referrerId  String
  referredId  String?            // null until signup
  code        String   @unique
  signedUpAt  DateTime?
  convertedAt DateTime?
  rewardCents Int      @default(0)
  status      String   @default("PENDING") // PENDING | CONVERTED | PAID | EXPIRED
  createdAt   DateTime @default(now())

  referrer User  @relation("Referrer", fields: [referrerId], references: [id])
  referred User? @relation("Referred", fields: [referredId], references: [id])

  @@index([referrerId])
}

model Affiliate {
  id              String   @id @default(cuid())
  userId          String   @unique
  payoutEmail     String
  totalEarnedCents Int     @default(0)
  totalPaidCents  Int      @default(0)
  status          String   @default("ACTIVE")
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}

// ──────────────────────────────────────────────────────────────────────────────
// API keys (V1)
// ──────────────────────────────────────────────────────────────────────────────

model ApiKey {
  id           String   @id @default(cuid())
  userId       String
  workspaceId  String
  name         String
  keyHash      String   @unique
  prefix       String   // visible 6-char prefix
  lastUsedAt   DateTime?
  expiresAt    DateTime?
  revokedAt    DateTime?
  createdAt    DateTime @default(now())

  user      User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  workspace Workspace @relation(fields: [workspaceId], references: [id], onDelete: Cascade)

  @@index([keyHash])
  @@index([workspaceId])
}

// ──────────────────────────────────────────────────────────────────────────────
// Waitlist (pre-launch)
// ──────────────────────────────────────────────────────────────────────────────

model WaitlistEntry {
  id        String   @id @default(cuid())
  email     String   @unique
  source    String?
  metadata  Json?
  createdAt DateTime @default(now())
  invitedAt DateTime?
}
```

---

## Index strategy

- All `slug` fields uniquely indexed.
- Composite indexes on `(workspaceId, createdAt)` for time-range queries.
- `(productId, capturedAt)` on time-series tables (`SeoSnapshot`, `MrrSnapshot`, `KeywordRanking`).
- Partial indexes considered for `WHERE deletedAt IS NULL` if soft-deletes balloon.

---

## Data retention

| Data | Retention |
|------|-----------|
| Active products / profiles | Forever (until soft-deleted) |
| Deleted user data | 30 days then hard delete |
| `SeoSnapshot` daily | 90 days, then aggregate to weekly |
| `KeywordRanking` | 180 days |
| `Backlink` historical | Forever (lost backlinks marked, not deleted) |
| `AiGeneration` | 90 days for output, forever for prompt + cost metadata |
| `AuditLog` | 1 year |
| `Notification` | 90 days after read |

---

## Migrations strategy

- **All schema changes via Prisma migrations** (`prisma migrate dev` locally → committed → applied via CI in production).
- **Never destructive in prod without explicit confirm.** Drop-column migrations split: ship deprecation marker first, drop after 2 weeks.
- **Backfills as separate scripts**, not in the migration. Run idempotently from `scripts/backfills/`.

---

## Seed data (`pnpm db:seed`)

- 1 SuperAdmin user (`admin@launchmint.com`)
- 1 Moderator user
- 5 founder users with profiles
- 200 directories scraped + curated
- 10 products across categories
- 30 reviews (mix of verified + flagged for testing)
- 100 backlinks (mocked)
- 50 keyword rankings (mocked)

Seed file: [scripts/seed.ts](../scripts/seed.ts).
