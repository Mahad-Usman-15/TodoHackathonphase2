# SEO Contracts: Phase 3 — UI & SEO Upgrade

**Feature**: `003-ui-seo-upgrade` | **Date**: 2026-02-28

> No new API endpoints. This file documents the SEO "contracts" — the exact content and HTTP response contracts for SEO-related routes.

---

## Contract 1: /sitemap.xml

**Method**: GET
**Path**: `/sitemap.xml`
**Handler**: `app/sitemap.ts`
**Content-Type**: `application/xml`
**Status**: 200

**Required URLs**:

| URL | changeFrequency | priority |
|---|---|---|
| `https://todo-hackathonphase2.vercel.app` | `monthly` | `1.0` |
| `https://todo-hackathonphase2.vercel.app/auth/login` | `yearly` | `0.8` |
| `https://todo-hackathonphase2.vercel.app/auth/register` | `yearly` | `0.8` |

**Excluded URLs** (must NOT appear):
- `/dashboard`
- `/api/*`
- `/auth` (parent path)

**Validation**: Navigate to `/sitemap.xml` in browser → valid XML with exactly 3 `<url>` entries.

---

## Contract 2: /robots.txt

**Method**: GET
**Path**: `/robots.txt`
**Handler**: `app/robots.ts`
**Content-Type**: `text/plain`
**Status**: 200

**Required content**:
```
User-agent: *
Allow: /
Allow: /auth/login
Allow: /auth/register
Disallow: /dashboard
Disallow: /api
Disallow: /auth

Sitemap: https://todo-hackathonphase2.vercel.app/sitemap.xml
```

**Validation**: Navigate to `/robots.txt` → disallow rules present, Sitemap directive present.

---

## Contract 3: Page `<head>` Metadata

### Landing Page (/)

```html
<title>Taskify — Smart Task Manager</title>
<meta name="description" content="Taskify helps you manage tasks securely with JWT authentication and a clean, fast interface. Free forever." />
<link rel="canonical" href="https://todo-hackathonphase2.vercel.app/" />
<meta property="og:title" content="Taskify — Smart Task Manager" />
<meta property="og:description" content="Taskify helps you manage tasks securely..." />
<meta property="og:url" content="https://todo-hackathonphase2.vercel.app/" />
<meta property="og:site_name" content="Taskify" />
<meta property="og:type" content="website" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="Taskify — Smart Task Manager" />
<meta name="twitter:description" content="Taskify helps you manage tasks securely..." />
```

### Login Page (/auth/login)

```html
<title>Sign In | Taskify</title>
<meta name="description" content="Sign in to your Taskify account and manage your tasks." />
<link rel="canonical" href="https://todo-hackathonphase2.vercel.app/auth/login" />
<meta property="og:title" content="Sign In | Taskify" />
<meta property="og:url" content="https://todo-hackathonphase2.vercel.app/auth/login" />
```

### Register Page (/auth/register)

```html
<title>Create Account | Taskify</title>
<meta name="description" content="Join Taskify for free. Create an account and start managing your tasks today." />
<link rel="canonical" href="https://todo-hackathonphase2.vercel.app/auth/register" />
```

### Dashboard (/dashboard)

```html
<title>Dashboard | Taskify</title>
<meta name="robots" content="noindex, nofollow" />
```

---

## Contract 4: JSON-LD Structured Data

**Location**: Root layout `<head>`
**Type**: `application/ld+json`

```json
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebApplication",
      "name": "Taskify",
      "url": "https://todo-hackathonphase2.vercel.app",
      "applicationCategory": "ProductivityApplication",
      "operatingSystem": "Web",
      "description": "Smart task manager with JWT authentication and a clean interface.",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD"
      }
    },
    {
      "@type": "Organization",
      "name": "Taskify",
      "url": "https://todo-hackathonphase2.vercel.app"
    }
  ]
}
```

**Validation**: View page source of `/` → find `<script type="application/ld+json">` in `<head>` with both `WebApplication` and `Organization` nodes.

---

## Contract 5: Heading Hierarchy (per page)

| Page | H1 | H2 sections | H3 sections |
|---|---|---|---|
| `/` | "Manage Your Tasks, Effortlessly" (hero) | Features, How It Works, Security, FAQ | Individual feature titles, FAQ questions |
| `/auth/login` | "Welcome back" | — | — |
| `/auth/register` | "Create your account" | — | — |
| `/dashboard` | "Taskify" (brand in header, visually) or greeting | Account Details, Tasks | — |

**Rule**: Exactly one `<h1>` per page. No H3 before H2 on the same page.
