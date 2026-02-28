# Research: Phase 3 — UI & SEO Upgrade

**Feature**: `003-ui-seo-upgrade` | **Date**: 2026-02-28

---

## R-001: Tailwind CSS v4 Custom Token System

**Question**: How are custom colors and fonts registered in Tailwind v4?

**Decision**: Use `@theme {}` block in `globals.css`

**Rationale**:
Tailwind v4 replaced `tailwind.config.js` with a CSS-first configuration model. All design tokens are declared as CSS custom properties inside `@theme {}`. The `@tailwindcss/postcss` plugin reads this block and generates the corresponding utility classes automatically.

```css
@theme {
  --color-brand-bg: #0C0C0C;    /* → bg-brand-bg, text-brand-bg, border-brand-bg */
  --color-brand-cta: #F2613F;   /* → bg-brand-cta, text-brand-cta, etc. */
  --font-heading: var(--font-poppins); /* → font-heading */
}
```

**Alternatives Rejected**:
- `tailwind.config.js` — does not exist in v4, would be ignored
- Arbitrary values `bg-[#F2613F]` — works but not enforceable as design tokens

---

## R-002: next/font Google Fonts Self-Hosting

**Question**: How to load Poppins, Montserrat, Oswald via next/font without CDN calls?

**Decision**: Import from `next/font/google`, declare CSS variables, register in `@theme`

**Rationale**:
`next/font` downloads and self-hosts Google Fonts at build time. No external network requests at runtime. Eliminates render-blocking font CDN calls that hurt Lighthouse Performance.

```ts
// app/layout.tsx
import { Poppins, Montserrat, Oswald } from 'next/font/google'

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  variable: '--font-poppins',
})
const montserrat = Montserrat({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-montserrat',
})
const oswald = Oswald({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-oswald',
})

// Apply on <html>:
// className={`${poppins.variable} ${montserrat.variable} ${oswald.variable}`}
```

**Alternatives Rejected**:
- `<link>` to Google Fonts CDN — blocks render, violates `next/font` best practice
- Local font files — requires manual download + `next/font/local`; Google Fonts via `next/font/google` is equivalent and simpler

---

## R-003: Next.js App Router Metadata API

**Question**: How to implement per-page metadata, OG tags, Twitter cards, canonical URLs?

**Decision**: Export `metadata` const from each page/layout; use `metadataBase` in root layout

**Rationale**:
Next.js App Router merges metadata from layout → page. Root layout sets `metadataBase`, title template, and defaults. Each page overrides with specific values.

```ts
// app/layout.tsx
export const metadata: Metadata = {
  metadataBase: new URL('https://todo-hackathonphase2.vercel.app'),
  title: { default: 'Taskify', template: '%s | Taskify' },
  description: 'Smart task manager with secure authentication.',
}

// app/page.tsx
export const metadata: Metadata = {
  title: 'Taskify — Smart Task Manager',
  description: 'Manage your tasks securely...',
  openGraph: { title: '...', description: '...', url: '/', siteName: 'Taskify', type: 'website' },
  twitter: { card: 'summary_large_image', title: '...', description: '...' },
  alternates: { canonical: '/' },
}
```

**Note**: Pages using `'use client'` directive **cannot** export `metadata`. Auth pages currently use client components because they call `useAuth()`. Solution: Move the metadata export to a Server Component wrapper page and render the client form as a child — or add metadata directly to the page before the 'use client' directive by refactoring to a server page with a client-only form component (already the case: login/page.tsx is a client wrapper, LoginForm is the client component). The page itself can be converted to a server component that passes no props.

---

## R-004: sitemap.ts and robots.ts in App Router

**Question**: How to generate /sitemap.xml and /robots.txt in Next.js App Router?

**Decision**: Create `app/sitemap.ts` and `app/robots.ts` as typed route handlers

**Rationale**:
Next.js has built-in support for both. They export a default function returning a typed object that Next.js serialises to the correct format automatically.

```ts
// app/sitemap.ts
import { MetadataRoute } from 'next'
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: 'https://todo-hackathonphase2.vercel.app', changeFrequency: 'monthly', priority: 1 },
    { url: 'https://todo-hackathonphase2.vercel.app/auth/login', changeFrequency: 'yearly', priority: 0.8 },
    { url: 'https://todo-hackathonphase2.vercel.app/auth/register', changeFrequency: 'yearly', priority: 0.8 },
  ]
}

// app/robots.ts
import { MetadataRoute } from 'next'
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: '*', allow: ['/', '/auth/login', '/auth/register'], disallow: ['/dashboard', '/api', '/auth'] }],
    sitemap: 'https://todo-hackathonphase2.vercel.app/sitemap.xml',
  }
}
```

---

## R-005: JSON-LD Structured Data in Next.js

**Question**: How to embed JSON-LD without a library?

**Decision**: Inline `<script type="application/ld+json">` in root layout using `dangerouslySetInnerHTML`

**Rationale**:
No library needed. Next.js renders this server-side, making it visible to crawlers without JS execution. `@graph` array allows both `WebApplication` and `Organization` in a single script tag.

```tsx
// app/layout.tsx
const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebApplication',
      name: 'Taskify',
      url: 'https://todo-hackathonphase2.vercel.app',
      applicationCategory: 'ProductivityApplication',
      operatingSystem: 'Web',
      description: 'Smart task manager with JWT authentication.',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
    {
      '@type': 'Organization',
      name: 'Taskify',
      url: 'https://todo-hackathonphase2.vercel.app',
    },
  ],
}

// In RootLayout return:
// <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
```

---

## R-006: Client Component Constraint on Metadata Export

**Question**: `app/page.tsx` currently uses `'use client'` — can it export `metadata`?

**Decision**: Convert `app/page.tsx` to a Server Component; move client logic to `LandingNav` (which already needs `useAuth` for the authenticated-user redirect case)

**Rationale**:
Server Components can export `metadata`. The landing page itself is purely presentational (static content). The only client logic needed is:
1. Auth redirect (authenticated users → `/dashboard`)
2. FAQ accordion interactivity

Solution: `app/page.tsx` becomes a Server Component that renders landing sections. `LandingNav` is a Client Component that checks auth and redirects. `FaqAccordion` is a Client Component. All others are Server Components.

**Impact on auth pages**: `app/auth/login/page.tsx` and `app/auth/register/page.tsx` also use `'use client'`. These must be refactored: the page file becomes a Server Component (can export metadata), renders the `LoginForm`/`RegisterForm` as its only client child.

---

## R-007: Glassmorphism Implementation

**Question**: What Tailwind v4 classes achieve the glass card effect on auth pages?

**Decision**: `backdrop-blur-md bg-brand-deep/10 border border-brand-primary/20 rounded-2xl`

**Rationale**:
- `backdrop-blur-md` — blurs content behind the card (requires the parent to have a gradient background)
- `bg-brand-deep/10` — `#481E14` at 10% opacity (within FR-002's 8-12% range)
- `border border-brand-primary/20` — `#9B3922` at 20% opacity (FR-003 ≤30%)
- `rounded-2xl` — modern card corner radius

The parent page background (`bg-gradient-to-br from-brand-deep to-brand-bg`) provides the coloured layer that the glass effect blurs.

---

## R-008: Metadata Export for Client Auth Pages

**Question**: Auth pages use `'use client'` but need SEO metadata. How to resolve?

**Decision**: Promote page files to Server Components; isolate client code in form components

**Refactoring pattern**:
```tsx
// app/auth/login/page.tsx  ← SERVER COMPONENT (no 'use client')
import type { Metadata } from 'next'
import { LoginForm } from '@/components/auth/login-form'  // ← client component

export const metadata: Metadata = {
  title: 'Sign In',
  description: 'Sign in to your Taskify account.',
  alternates: { canonical: '/auth/login' },
}

export default function LoginPage() {
  // No hooks — server component renders static layout + client form
  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-deep to-brand-bg ...">
      <div className="... glass-card">
        <LoginForm />  {/* client component handles useAuth + form state */}
      </div>
    </div>
  )
}
```

`LoginForm` already handles `useAuth()` and `useRouter()` — the page wrapper just provides layout and metadata.

---

## Summary Table

| Research Item | Decision | Risk |
|---|---|---|
| R-001: Tailwind v4 tokens | `@theme {}` in globals.css | Low — well-documented v4 pattern |
| R-002: Font self-hosting | `next/font/google` CSS variables | Low — standard Next.js pattern |
| R-003: Metadata API | Per-page `metadata` exports | Low |
| R-004: sitemap + robots | App Router route handlers | Low |
| R-005: JSON-LD | Inline `<script>` in layout | Low |
| R-006: Server vs Client pages | Promote pages to Server Components | Medium — requires refactor of login/register pages |
| R-007: Glass card | Tailwind opacity modifiers + backdrop-blur | Low |
| R-008: Metadata on auth pages | Server page wrapper + client form child | Medium — existing code needs restructuring |
