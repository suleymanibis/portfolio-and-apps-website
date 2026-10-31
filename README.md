# suleymanibis.dev — Bilingual Developer Portfolio, App Showcase & Technical Blog

[![CI/CD Pipeline](https://github.com/suleymanibis/potfolio-and-apps-website/actions/workflows/ci-cd.yml/badge.svg)](https://github.com/suleymanibis/potfolio-and-apps-website/actions/workflows/ci-cd.yml)

A full-stack, security-hardened personal portfolio, application showcase, and technical blog platform built with **Next.js 15 (App Router)**, **React 19**, **TypeScript**, and **Tailwind CSS v4**.

Live Website: **[https://suleymanibis.dev](https://suleymanibis.dev)** (English: **[https://suleymanibis.dev/en](https://suleymanibis.dev/en)**)

---

## Key Features

- **Bilingual Architecture (`TR` & `EN`) with Auto-Translation**
  - Deterministic, crawlable URL routing: Turkish at `/...` and English at `/en/...` powered by Next.js Middleware (`Content-Language`, `hreflang`, and zero-cookie crawler support).
  - Content authored once in Turkish via `/admin` is automatically translated into English on save—preserving Markdown formatting, fenced code blocks, inline code, and URLs.

- **Applications Showcase (`/apps` & `/apps/[slug]`)**
  - Searchable, category-filterable software showcase with status badges (`Live`, `Open Source`, `Beta`, `In Progress`), tech-stack tags, version metadata, live demo links, source repository links, release download links, and full Markdown project documentation.

- **Pinned GitHub Repositories (`/repos` & Homepage Showcase)**
  - Automatically syncs pinned repositories from the configured GitHub profile and enriches them via the GitHub REST API (stars, forks, programming language colors, topics, homepage links, and last push timestamps) with 15-minute ISR caching.

- **Technical Blog & Markdown Engine (`/articles` & `/articles/[slug]`)**
  - GitHub-Flavored Markdown (`remark-gfm`) rendering with copy-to-clipboard code blocks, automatic reading-time calculation, tag filtering, draft preview support for authenticated admins, and one-click link sharing.

- **Dedicated Editable About Page (`/about` & `/en/about`)**
  - Standalone developer profile page featuring engineering story (Markdown), current focus callout, academic timeline cards, categorized languages/IDEs/tools, optional profile photo upload, and an optional resume/CV link (automatically hidden until configured).

- **Built-in Admin CMS (`/admin`) & Dual Persistence Layer**
  - Browser-based management dashboard with overview metrics, application CRUD, split-screen live Markdown article editor, About page editor, and site/social profile settings (GitHub, X/Twitter, LinkedIn, Instagram, MicUp, Discord, and Email).
  - **Dual Storage Engine:** Writes atomically to local `data/db.json` & `public/uploads/` in local development, and commits seamlessly via the **GitHub Contents API** when deployed on serverless platforms like Vercel.

- **Technical SEO & Structured Data**
  - Dynamic bilingual `sitemap.xml` (`tr-TR`, `en-US`, `x-default` alternates) and `robots.txt` (`Disallow: /admin`, `/api`, plus `X-Robots-Tag: noindex` headers).
  - Per-page canonical URLs, OpenGraph (`website`, `profile`, `article`), and Twitter Cards.
  - XSS-safe Schema.org `JSON-LD` graphs: `WebSite` + `Person`, `ProfilePage`, `TechArticle`, `SoftwareApplication`, and `BreadcrumbList`.

- **Defense-in-Depth Security**
  - `scrypt` password hashing (`N=16384`) and constant-time (`crypto.timingSafeEqual`) verification with fail-closed production secret checks.
  - Stateless `HMAC-SHA256` signed session tokens stored in `HttpOnly`, `SameSite=Strict`, `__Host-` prefixed cookies (in production).
  - Multi-layer CSRF validation (`Origin`, `Referer`, and `Sec-Fetch-Site`), IP brute-force login lockout (`Retry-After`), mutation rate limiting, bounded prototype-safe JSON parsing, binary magic-byte image verification (blocking SVG/HTML XSS uploads), and strict CSP / HSTS headers.

---

## Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Framework** | Next.js 15 (App Router, Server Components, Middleware, ISR) |
| **UI & Styling** | React 19, TypeScript 5, Tailwind CSS v4, Lucide Icons |
| **Markdown** | `react-markdown`, `remark-gfm` (raw HTML disabled for XSS safety) |
| **Persistence** | Local atomic JSON (`data/db.json`) + GitHub Contents REST API |
| **Testing & CI/CD** | Node.js native test runner, GitHub Actions, Dependabot, Vercel |

---

## Project Structure

```text
portfolio-hub/
├── .github/
│   ├── dependabot.yml             # Weekly npm & GitHub Actions security updates
│   └── workflows/ci-cd.yml        # Automated CI/CD pipeline (audit, tests, build, E2E smoke & live check)
├── data/
│   └── db.json                    # Content store (profile, about, apps, articles)
├── public/                        # Brand assets, favicons, and local image uploads
├── src/
│   ├── app/
│   │   ├── about/                 # Dedicated About page (/about & /en/about)
│   │   ├── admin/                 # Protected Admin CMS route (/admin)
│   │   ├── api/                   # REST endpoints (auth, profile, about, apps, articles, upload)
│   │   ├── apps/                  # App showcase list & detail pages
│   │   ├── articles/              # Technical blog list & article detail pages
│   │   ├── repos/                 # Pinned GitHub repositories page
│   │   ├── layout.tsx             # Root layout, metadata & theme initialization
│   │   ├── page.tsx               # Homepage showcase
│   │   ├── robots.ts              # Dynamic robots.txt
│   │   └── sitemap.ts             # Dynamic bilingual sitemap.xml
│   ├── components/
│   │   ├── admin/                 # Modular Admin CMS tabs (Login, Overview, Apps, Articles, About, Profile)
│   │   └── ...                    # Public UI components (Navbar, LanguageToggle, MarkdownRenderer, JsonLd, etc.)
│   ├── lib/
│   │   ├── api-guards.ts          # Reusable CSRF, rate-limit, auth & cache revalidation helpers
│   │   ├── auth.ts                # scrypt password verification & HMAC session tokens
│   │   ├── db.ts                  # Normalized CRUD repository (local FS + GitHub fallback)
│   │   ├── github-storage.ts      # GitHub Contents API client for serverless persistence
│   │   ├── github.ts              # Pinned repositories parser & GitHub REST enricher
│   │   ├── i18n.ts                # TR/EN UI dictionaries & locale URL helpers
│   │   ├── security.ts            # Sanitizers, rate limiters, CSRF & binary image magic-byte checks
│   │   ├── seed-data.ts           # Default seed data for initial setup
│   │   ├── seo.ts                 # Canonical/hreflang builders & XSS-safe JSON-LD generators
│   │   ├── translator.ts          # Markdown-aware TR -> EN translation pipeline
│   │   ├── utils.ts               # Slugify, unique slug resolver, reading time & date formatters
│   │   └── validators.ts          # Pure input validators/normalizers for all domain entities
│   ├── middleware.ts              # /en subpath routing, Content-Language & X-Robots-Tag headers
│   └── types/index.ts             # Shared TypeScript interfaces
└── tests/
    ├── check-db.mjs               # Validates data/db.json schema & JSON syntax
    ├── domain-and-seo.test.mts    # Validators, GitHub parser, DB normalizer & JSON-LD schema tests
    ├── register-alias.mjs         # Node test loader resolving @/* TypeScript imports
    ├── security.test.mts          # Security, auth, CSRF, image magic-byte & i18n tests
    └── smoke-e2e.mjs              # Live production HTTP, SEO & security smoke suite
```

---

## Getting Started Locally

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env.local` and adjust values as needed:

```bash
cp .env.example .env.local
```

| Variable | Required | Description |
| :--- | :---: | :--- |
| `ADMIN_PASSWORD_HASH` | **Production** | `scrypt:<saltHex>:<hashHex>` hash of the admin password |
| `ADMIN_PASSWORD` | Dev only | Plaintext fallback password for local development (`NODE_ENV !== "production"`) |
| `AUTH_SECRET` | **Production** | Random secret (`>= 32` chars) used to sign `HMAC-SHA256` admin session tokens |
| `GITHUB_TOKEN` | Optional | Fine-grained GitHub PAT (`Contents: Read & Write`) for serverless persistence on Vercel |
| `GITHUB_REPO` | Optional | Target repository in `owner/repo` format for `data/db.json` & uploaded images |
| `GITHUB_BRANCH` | Optional | Target branch name (defaults to `main`) |

Generate a production `ADMIN_PASSWORD_HASH` and `AUTH_SECRET` locally with Node.js:

```bash
node -e 'const c=require("crypto"),s=c.randomBytes(16).toString("hex");console.log("ADMIN_PASSWORD_HASH=scrypt:"+s+":"+c.scryptSync("YOUR_STRONG_PASSWORD",s,64).toString("hex"));console.log("AUTH_SECRET="+c.randomBytes(32).toString("hex"));'
```

### 3. Run the Development Server

```bash
npm run dev
```

- Public Website (TR): `http://localhost:3000`
- Public Website (EN): `http://localhost:3000/en`
- Admin Dashboard: `http://localhost:3000/admin`

---

## Testing & CI/CD Pipeline

Run the full local CI verification pipeline (DB check, strict TypeScript typecheck, 15 unit tests, production build, and live E2E HTTP smoke suite) with a single command:

```bash
npm run ci
```

Individual commands:

```bash
npm run check:db     # Validate data/db.json integrity
npm run typecheck    # Run tsc --noEmit
npm test             # Run unit tests (security, domain, i18n, SEO)
npm run build        # Build production Next.js bundle
npm run test:smoke   # Boot production server & run E2E HTTP/CSRF/SEO checks
```

### GitHub Actions + Vercel Workflow (`.github/workflows/ci-cd.yml`)

1. **`quality-and-security`:** Runs `npm ci`, `npm audit --omit=dev --audit-level=high`, `npm run check:db`, `npm run typecheck`, and `npm test`.
2. **`build-and-smoke`:** Caches `.next/cache`, builds the production Next.js bundle, boots `next start`, and runs the automated E2E smoke test across 15 routes, SEO metadata, and CSRF/auth guards.
3. **`post-deploy-verification` (`main` pushes):** Supports optional Vercel CLI deployment (if `VERCEL_TOKEN`, `VERCEL_ORG_ID`, and `VERCEL_PROJECT_ID` secrets are configured) alongside Vercel's native GitHub integration, then verifies live HTTP `200` health on `https://suleymanibis.dev`, `/en`, `/robots.txt`, and `/sitemap.xml`.
4. **Content-Commit Aware:** Commits that only touch `data/**`, `public/uploads/**`, or `*.md` (such as publishing articles from `/admin`) skip redundant CI runs to conserve GitHub Actions minutes while still triggering instant Vercel updates.

---

## License

Copyright © Süleyman İbiş. All rights reserved.
