# Data Model: Phase 3 — UI & SEO Upgrade

**Feature**: `003-ui-seo-upgrade` | **Date**: 2026-02-28

> This feature is frontend-only. No database schema changes. No new API endpoints.
> This document captures the frontend data shapes and UI state models introduced by this feature.

---

## Existing Types (unchanged)

```ts
// frontend/types/index.ts — no changes
interface Task {
  id: number
  user_id: number
  title: string
  description: string | null
  completed: boolean
  created_at: string
  updated_at: string
}

interface User {
  id: number
  email: string
  username: string
  is_active: boolean
}
```

---

## New UI State Entities

### TaskStats (derived — no API call)

Computed client-side from `Task[]` in `StatsBar` component:

```ts
interface TaskStats {
  total: number      // tasks.length
  completed: number  // tasks.filter(t => t.completed).length
  pending: number    // tasks.filter(t => !t.completed).length
}
```

**Derivation**: Computed inline from the tasks array already loaded on the dashboard. No additional API call.

### FaqItem

Static data shape for FAQ accordion content:

```ts
interface FaqItem {
  id: string           // unique key for React list rendering
  question: string
  answer: string
}
```

**Content** (4 items minimum):
1. "Is Taskify free to use?" → "Yes, Taskify is completely free."
2. "Is my data secure?" → "Yes — your data is protected with JWT authentication and bcrypt password hashing. Only you can access your tasks."
3. "Can I access my tasks from any device?" → "Yes — Taskify is a web application accessible from any browser on any device."
4. "What happens to my data if I delete my account?" → "All your tasks and account data are permanently removed."

### FeatureCard

Static data shape for the features grid:

```ts
interface FeatureCard {
  id: string
  icon: string      // SVG path or inline SVG identifier
  title: string
  description: string
}
```

**Content** (3 items):
1. "Secure by Default" — JWT auth + bcrypt + HTTP-only cookies
2. "Fast & Simple" — No clutter, just tasks. Add, complete, delete in seconds.
3. "Your Data, Only Yours" — Every task is isolated to your account.

### HowItWorksStep

```ts
interface HowItWorksStep {
  step: number      // 1, 2, 3
  title: string
  description: string
}
```

**Content**:
1. Create an account (free, takes 30 seconds)
2. Add your tasks (title + optional description)
3. Mark done as you go (one click to complete or delete)

---

## SEO Metadata Shape (per page)

```ts
// Type from Next.js — documented here for reference
interface PageSEO {
  title: string
  description: string
  canonical: string
  openGraph: {
    title: string
    description: string
    url: string
    siteName: 'Taskify'
    type: 'website'
  }
  twitter: {
    card: 'summary_large_image'
    title: string
    description: string
  }
  robots?: {
    index: boolean
    follow: boolean
  }
}
```

**Per-page values**:

| Field | `/` | `/auth/login` | `/auth/register` | `/dashboard` |
|---|---|---|---|---|
| title | `Taskify — Smart Task Manager` | `Sign In` | `Create Account` | `Dashboard` |
| description | `Taskify helps you manage tasks...` | `Sign in to your Taskify account.` | `Join Taskify free...` | — |
| robots | index/follow | index/follow | index/follow | **noindex/nofollow** |

---

## Design Token Map

All tokens are CSS custom properties. No runtime JS objects needed.

```
Token              CSS Variable              Hex         Tailwind Class
─────────────────  ────────────────────────  ──────────  ───────────────────
Brand Background   --color-brand-bg          #0C0C0C     bg-brand-bg
Brand Deep         --color-brand-deep        #481E14     bg-brand-deep
Brand Primary      --color-brand-primary     #9B3922     border-brand-primary
Brand CTA          --color-brand-cta         #F2613F     bg-brand-cta
Brand CTA Hover    --color-brand-cta-hover   #f4784d     hover:bg-brand-cta-hover
Font Heading       --font-heading            Poppins     font-heading
Font Body          --font-body               Montserrat  font-body
Font Accent        --font-accent             Oswald      font-accent
```
