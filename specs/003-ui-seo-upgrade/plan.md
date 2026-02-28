# Implementation Plan: Phase 3 — UI & SEO Upgrade

**Branch**: `main` | **Date**: 2026-02-28 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `specs/003-ui-seo-upgrade/spec.md`

---

## Summary

Upgrade the existing Next.js frontend with a premium dark-theme design system (palette: `#0C0C0C` / `#481E14` / `#9B3922` / `#F2613F`), a full marketing landing page replacing the current auth-redirect root, dashboard enhancements (stats bar, skeleton loaders, completed-card dimming, header redesign), auth page glassmorphism, and hackathon-level SEO (metadata, sitemap, robots, JSON-LD). Backend is untouched. All changes are frontend-only.

---

## Technical Context

**Language/Version**: TypeScript 5 / Node 18+
**Primary Dependencies**: Next.js 16.1.6, React 19, **Tailwind CSS v4** (PostCSS plugin), `next/font` (Google Fonts)
**Storage**: N/A — frontend-only feature
**Testing**: Visual inspection + Lighthouse audit + browser devtools
**Target Platform**: Vercel (production), localhost:3000 (development)
**Project Type**: Web application — frontend only
**Performance Goals**: Lighthouse SEO ≥ 95; Lighthouse Performance drop ≤ 5 pts vs baseline
**Constraints**: No new npm packages; no UI libraries; no animation libraries; Tailwind v4 only; all colors from 4-color palette
**Scale/Scope**: ~15 files modified, ~12 new components created

### Critical Technical Note — Tailwind v4

The project uses **Tailwind CSS v4** (`@tailwindcss/postcss: ^4`). Tailwind v4 has a fundamentally different configuration model:

- ❌ No `tailwind.config.js` — this file does NOT exist and must NOT be created
- ✅ Custom design tokens are defined as CSS variables inside an `@theme {}` block in `globals.css`
- ✅ Custom colors registered as `--color-{name}: {value}` become available as `bg-{name}`, `text-{name}`, `border-{name}` utility classes
- ✅ Custom fonts registered as `--font-{name}: var(--font-{var})` become available as `font-{name}` utilities

Example:
```css
@theme {
  --color-brand-bg: #0C0C0C;
  --color-brand-deep: #481E14;
  --color-brand-primary: #9B3922;
  --color-brand-cta: #F2613F;
  --font-heading: var(--font-poppins);
  --font-body: var(--font-montserrat);
  --font-accent: var(--font-oswald);
}
```
Then use: `bg-brand-bg`, `text-brand-cta`, `font-heading`, etc.

---

## Constitution Check

*GATE: Must pass before Phase 0 research.*

| Principle | Status | Notes |
|---|---|---|
| Spec-Driven Development | ✅ PASS | spec.md + clarifications complete |
| Agentic Development Workflow | ✅ PASS | All code generated via Claude Code |
| Architecture Simplicity | ✅ PASS | Frontend-only, no new libraries |
| Technology Adherence | ✅ PASS | Next.js + Tailwind + next/font only |
| Security-First | ✅ PASS | No auth changes, no new data flows |
| No Inline Styles | ✅ PASS | All styling via Tailwind utility classes |
| No API Calls Outside lib/api.ts | ✅ PASS | No new API calls introduced |
| No Business Logic in Frontend | ✅ PASS | Task stats computed from existing task array |

**GATE RESULT: ALL PASS — proceed to Phase 0.**

---

## Project Structure

### Documentation (this feature)

```text
specs/003-ui-seo-upgrade/
├── plan.md              ← this file
├── research.md          ← Phase 0 output
├── data-model.md        ← Phase 1 output
├── quickstart.md        ← Phase 1 output
├── contracts/           ← Phase 1 output (SEO contracts)
└── tasks.md             ← Phase 2 output (/sp.tasks — not created here)
```

### Source Code (repository)

```text
frontend/
├── app/
│   ├── globals.css                    ← MODIFY: brand palette @theme, font vars, base styles
│   ├── layout.tsx                     ← MODIFY: Poppins/Montserrat/Oswald fonts, full SEO metadata, JSON-LD
│   ├── page.tsx                       ← MODIFY: replace redirect with full landing page
│   ├── sitemap.ts                     ← CREATE: /sitemap.xml generator
│   ├── robots.ts                      ← CREATE: /robots.txt generator
│   ├── auth/
│   │   ├── login/page.tsx             ← MODIFY: dark glass card, gradient bg, SEO metadata
│   │   └── register/page.tsx          ← MODIFY: dark glass card, gradient bg, SEO metadata
│   └── dashboard/
│       └── page.tsx                   ← MODIFY: dark theme, stats bar, new header, skeleton loader
│
├── components/
│   ├── landing/                       ← CREATE (new directory)
│   │   ├── LandingNav.tsx             ← CREATE: sticky header (brand + Sign In + Get Started)
│   │   ├── HeroSection.tsx            ← CREATE: H1 + subheadline + CTA button
│   │   ├── FeaturesGrid.tsx           ← CREATE: 3+ feature cards with icons
│   │   ├── HowItWorks.tsx             ← CREATE: numbered steps section
│   │   ├── SecuritySection.tsx        ← CREATE: security highlight
│   │   ├── FaqAccordion.tsx           ← CREATE: interactive accordion (client component)
│   │   └── LandingFooter.tsx          ← CREATE: footer with links + copyright
│   │
│   ├── dashboard/                     ← CREATE (new directory)
│   │   ├── DashboardHeader.tsx        ← CREATE: brand + "Hi, username" + Sign Out
│   │   ├── StatsBar.tsx               ← CREATE: Total / Completed / Pending counters
│   │   ├── SkeletonCard.tsx           ← CREATE: animated loading placeholder card
│   │   └── EmptyState.tsx             ← CREATE: styled empty state with icon + message
│   │
│   ├── auth/
│   │   ├── login-form.tsx             ← MODIFY: dark inputs, #F2613F focus ring, loading state
│   │   └── register-form.tsx          ← MODIFY: dark inputs, #F2613F focus ring, loading state
│   │
│   ├── tasks/
│   │   ├── TaskItem.tsx               ← MODIFY: dark card, hover animation, completed opacity/dim
│   │   ├── TaskList.tsx               ← MODIFY: dark bg wrapper
│   │   ├── TaskForm.tsx               ← MODIFY: dark inputs, CTA button #F2613F
│   │   ├── EditTaskModal.tsx          ← MODIFY: dark modal card, dark inputs
│   │   └── DeleteConfirmDialog.tsx    ← MODIFY: dark dialog card
│   │
│   └── ui/
│       └── Toast.tsx                  ← MODIFY: dark toast with coloured left border
```

---

## Complexity Tracking

No constitution violations. No complexity justification required.

---

## Phase 0: Research

*See: [research.md](./research.md)*

### Key Decisions

**D-001: Tailwind v4 Color Registration**
- Decision: Define all brand colors as CSS custom properties in `globals.css` under `@theme {}` block
- Rationale: Tailwind v4 reads design tokens from CSS `@theme` — no `tailwind.config.js` exists or is needed
- Alternatives considered: Inline styles (rejected — violates constitution), arbitrary values like `bg-[#F2613F]` (rejected — not maintainable, violates palette-enforcement)

**D-002: Font Loading Strategy**
- Decision: Load Poppins, Montserrat, Oswald via `next/font/google` in `layout.tsx`; expose as CSS variables; register in `@theme` as `--font-heading`, `--font-body`, `--font-accent`
- Rationale: `next/font` self-hosts fonts at build time — zero runtime CDN requests, no FOUT, optimal LCP
- Alternatives considered: `<link>` tags to Google Fonts CDN (rejected — adds render-blocking request, hurts Lighthouse Performance)

**D-003: Landing Page Auth Check**
- Decision: Keep `app/page.tsx` as a client component; retain existing `useAuth()` + `useEffect` redirect logic for authenticated users (→ `/dashboard`); render marketing landing page JSX for unauthenticated users
- Rationale: Auth state lives in React context (in-memory JWT), not accessible server-side; client component is the only viable pattern without a server-side session cookie
- Alternatives considered: Server component with middleware redirect (rejected — would require reading the HTTP-only cookie server-side, adding backend coupling)

**D-004: Gradient Implementation**
- Decision: Use Tailwind v4 `bg-gradient-to-br` with `from-[#481E14]` and `to-[#0C0C0C]` for auth page backgrounds; use inline gradient via Tailwind gradient utilities, not CSS `background:` property
- Rationale: Tailwind v4 supports arbitrary gradient color stops; keeps code within utility class pattern
- Alternatives considered: CSS custom property gradients (viable fallback if Tailwind v4 utilities insufficient)

**D-005: Card Glass Effect**
- Decision: Auth page cards use `backdrop-blur-md bg-[#481E14]/10 border border-[#9B3922]/20` — 10% opacity `#481E14` background + medium blur + low-opacity border
- Rationale: Achieves warm dark glassmorphism without extra dependencies; 10% opacity satisfies FR-002 (8-12% range)

**D-006: SEO Metadata Architecture**
- Decision: `metadataBase` + title template set in root `layout.tsx`; each public page exports its own `metadata` object; `sitemap.ts` + `robots.ts` as App Router route handlers
- Rationale: Next.js App Router metadata API is the canonical approach; automatic merging from layout → page; no runtime overhead
- Site name for metadata: **Taskify**

**D-007: Sticky Nav Scroll Behaviour**
- Decision: Landing nav uses `position: sticky top-0` with `z-50 backdrop-blur-md bg-brand-bg/90` — 90% opaque background on scroll for legibility
- Rationale: Pure CSS sticky (no scroll listener), performant, consistent with modern SaaS landing pages

**D-008: Skeleton Loader Style**
- Decision: Skeleton cards use CSS `animate-pulse` (built into Tailwind) with brand palette — `bg-[#481E14]/20` on `#0C0C0C` background
- Rationale: `animate-pulse` is a native Tailwind animation requiring zero extra packages

**D-009: JSON-LD Structured Data**
- Decision: Single `<script type="application/ld+json">` in root `layout.tsx` with `@graph` containing both `WebApplication` and `Organization` nodes
- Rationale: A single script reduces HTML overhead; `@graph` is the standard multi-entity pattern

---

## Phase 1: Design & Contracts

*See: [data-model.md](./data-model.md), [contracts/](./contracts/), [quickstart.md](./quickstart.md)*

### Design Token Map

| Token Name | CSS Variable | Hex Value | Tailwind Class |
|---|---|---|---|
| Brand Background | `--color-brand-bg` | `#0C0C0C` | `bg-brand-bg` |
| Brand Deep | `--color-brand-deep` | `#481E14` | `bg-brand-deep` |
| Brand Primary | `--color-brand-primary` | `#9B3922` | `border-brand-primary` |
| Brand CTA | `--color-brand-cta` | `#F2613F` | `bg-brand-cta` |
| Font Heading | `--font-heading` | Poppins | `font-heading` |
| Font Body | `--font-body` | Montserrat | `font-body` |
| Font Accent | `--font-accent` | Oswald | `font-accent` |

### Component Responsibility Map

| Component | Type | Responsibility |
|---|---|---|
| `LandingNav` | Client | Sticky header — brand, Sign In link, Get Started CTA; reads auth to show "Dashboard" link if authed |
| `HeroSection` | Server | H1 headline, subheadline, primary CTA → /auth/register |
| `FeaturesGrid` | Server | 3 feature cards with SVG icons (inline) |
| `HowItWorks` | Server | 3-step numbered flow |
| `SecuritySection` | Server | Security highlight with icon + copy |
| `FaqAccordion` | Client | 4 Q&A items, one open at a time, `useState` |
| `LandingFooter` | Server | Brand name, nav links, copyright |
| `DashboardHeader` | Client | Brand, "Hi {username}", Sign Out — consumes `useAuth` |
| `StatsBar` | Client | Total / Completed / Pending counts derived from tasks array prop |
| `SkeletonCard` | Server | Animated `animate-pulse` placeholder; rendered N times during load |
| `EmptyState` | Server | SVG icon + heading + CTA text for zero-tasks state |

### Page-Level Changes Summary

| Page | Change Type | Key Additions |
|---|---|---|
| `app/page.tsx` | Rewrite | Full landing page; auth redirect preserved; imports all landing components |
| `app/layout.tsx` | Modify | 3 fonts, full metadata (title template, description, OG, Twitter, canonical), JSON-LD |
| `app/auth/login/page.tsx` | Modify | SEO metadata export, dark gradient bg, glass card, import updated LoginForm |
| `app/auth/register/page.tsx` | Modify | SEO metadata export, dark gradient bg, glass card, import updated RegisterForm |
| `app/dashboard/page.tsx` | Modify | DashboardHeader replaces inline header; StatsBar added; SkeletonCard replaces spinner; EmptyState replaces text |
| `app/sitemap.ts` | Create | 3 public URLs with changeFrequency + priority |
| `app/robots.ts` | Create | Disallow /dashboard, /api, /auth + Sitemap directive |

### SEO Metadata Per Page

| Page | Title | Description | Robots |
|---|---|---|---|
| `/` | `Taskify — Smart Task Manager` | `Taskify helps you manage tasks securely with JWT authentication and a clean, fast interface.` | index, follow |
| `/auth/login` | `Sign In \| Taskify` | `Sign in to your Taskify account and manage your tasks.` | index, follow |
| `/auth/register` | `Create Account \| Taskify` | `Join Taskify for free. Create an account and start managing your tasks today.` | index, follow |
| `/dashboard` | `Dashboard \| Taskify` | — | **noindex, nofollow** |

### globals.css — Full @theme Block

```css
@import "tailwindcss";

@theme {
  /* Brand Palette */
  --color-brand-bg: #0C0C0C;
  --color-brand-deep: #481E14;
  --color-brand-primary: #9B3922;
  --color-brand-cta: #F2613F;
  --color-brand-cta-hover: #f4784d;

  /* Card surface = #481E14 at ~10% opacity — handled via bg-brand-deep/10 */

  /* Typography */
  --font-heading: var(--font-poppins);
  --font-body: var(--font-montserrat);
  --font-accent: var(--font-oswald);
}

:root {
  --background: #0C0C0C;
  --foreground: #f0f0f0;
}

body {
  background: var(--background);
  color: var(--foreground);
  font-family: var(--font-montserrat), system-ui, sans-serif;
}
```

### Landing Page Section Order

```
<LandingNav>          sticky header
<HeroSection>         H1 + subheadline + CTA
<FeaturesGrid>        3 feature cards
<HowItWorks>          3 numbered steps
<SecuritySection>     security highlight
<FaqAccordion>        4 Q&A interactive accordion
<LandingFooter>       links + copyright
```

### Task Card Visual States

| State | Opacity | Border | Title | Checkbox |
|---|---|---|---|---|
| Pending | 100% | `#9B3922` at 20% opacity | Normal | Empty ring |
| Pending (hover) | 100% | `#9B3922` at 50% opacity + shadow | Normal | Empty ring |
| Completed | 50% | `#9B3922` at 10% opacity | Strikethrough | `#F2613F` filled |
| Completed (hover) | 60% | `#9B3922` at 20% opacity | Strikethrough | `#F2613F` filled |

---

## Implementation Sequence (for /sp.tasks)

Tasks must be executed in this dependency order:

1. **Design tokens** — `globals.css` @theme block + font declarations in `layout.tsx` (all other tasks depend on tokens being available)
2. **SEO infrastructure** — `sitemap.ts`, `robots.ts`, metadata in `layout.tsx`, JSON-LD (independent of UI components)
3. **Landing page components** — Create all 7 landing components (parallel within group)
4. **Landing page assembly** — Rewrite `app/page.tsx` to compose landing components
5. **Auth page redesign** — Update login + register pages + auth forms (parallel)
6. **Dashboard components** — Create DashboardHeader, StatsBar, SkeletonCard, EmptyState (parallel)
7. **Dashboard assembly** — Update `app/dashboard/page.tsx` to use new components
8. **Task component redesign** — Update TaskItem, TaskList, TaskForm, EditTaskModal, DeleteConfirmDialog, Toast
9. **Verification** — Visual inspection + Lighthouse SEO audit
