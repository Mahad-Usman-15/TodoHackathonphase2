# Tasks: Phase 3 — UI & SEO Upgrade

**Input**: Design documents from `specs/003-ui-seo-upgrade/`
**Prerequisites**: plan.md ✅ | spec.md ✅ | research.md ✅ | data-model.md ✅ | contracts/seo-contracts.md ✅

**Tests**: No test tasks (not requested in spec). Verification via Lighthouse audit + browser devtools.

**Organization**: Tasks grouped by user story priority — US1 (P1) → US2 (P2) → US3 (P3) → US4 (P2 verification).

**⚠️ CRITICAL**: Tailwind v4 is in use. Custom colors/fonts go in `frontend/app/globals.css` inside `@theme {}`. No `tailwind.config.js`.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Design system tokens + font infrastructure + SEO route handlers. ALL other tasks depend on this phase.

**⚠️ CRITICAL**: No landing page, dashboard, or auth tasks can begin until T001–T002 are complete (tokens must exist). T003–T004 are independent and can run in parallel with T001–T002.

- [x] T001 Update `frontend/app/globals.css` — replace all existing styles with: `@import "tailwindcss"`, `@theme {}` block registering `--color-brand-bg: #0C0C0C`, `--color-brand-deep: #481E14`, `--color-brand-primary: #9B3922`, `--color-brand-cta: #F2613F`, `--color-brand-cta-hover: #f4784d`, `--font-heading: var(--font-poppins)`, `--font-body: var(--font-montserrat)`, `--font-accent: var(--font-oswald)`; `:root` block with `--background: #0C0C0C`, `--foreground: #f0f0f0`; `body` rule with `background: var(--background)`, `color: var(--foreground)`, `font-family: var(--font-montserrat), system-ui, sans-serif`
- [x] T002 Update `frontend/app/layout.tsx` — import `Poppins`, `Montserrat`, `Oswald` from `next/font/google` (each with `subsets: ['latin']`, appropriate weights, and `variable` CSS var names `--font-poppins`, `--font-montserrat`, `--font-oswald`); apply all three variable classes to `<html>` element; replace existing `metadata` export with full SEO metadata object (`metadataBase: new URL('https://todo-hackathonphase2.vercel.app')`, `title: { default: 'Taskify', template: '%s | Taskify' }`, `description`, `openGraph`, `twitter`); add JSON-LD `<script type="application/ld+json">` inside `<head>` with `@graph` containing `WebApplication` and `Organization` schema.org nodes; remove Geist font imports
- [x] T003 [P] Create `frontend/app/sitemap.ts` — export default function returning `MetadataRoute.Sitemap` array with exactly 3 entries: root URL (`changeFrequency: 'monthly'`, `priority: 1`), `/auth/login` (`changeFrequency: 'yearly'`, `priority: 0.8`), `/auth/register` (`changeFrequency: 'yearly'`, `priority: 0.8`); use `https://todo-hackathonphase2.vercel.app` as base URL
- [x] T004 [P] Create `frontend/app/robots.ts` — export default function returning `MetadataRoute.Robots` with rules: `userAgent: '*'`, `allow: ['/', '/auth/login', '/auth/register']`, `disallow: ['/dashboard', '/api', '/auth']`; include `sitemap: 'https://todo-hackathonphase2.vercel.app/sitemap.xml'` directive

**Checkpoint**: Design tokens available as Tailwind classes (`bg-brand-bg`, `text-brand-cta`, `font-heading`, etc.). `/sitemap.xml` and `/robots.txt` return 200. All subsequent tasks can begin.

---

## Phase 3: User Story 1 — First-Time Visitor Lands on Homepage (Priority: P1) 🎯 MVP

**Goal**: Replace the current auth-redirect root page with a full marketing landing page. Unauthenticated visitors see a premium dark-themed landing page. Authenticated users are immediately redirected to `/dashboard`.

**Independent Test**: Navigate to `/` unauthenticated — see hero, features, how-it-works, security, FAQ, footer sections with brand palette. Click CTA → goes to `/auth/register`. Open DevTools → verify `#0C0C0C` background, Poppins on H1, Montserrat on body copy.

- [x] T005 [P] [US1] Create `frontend/components/landing/LandingNav.tsx` — client component (`'use client'`); sticky header (`position: sticky top-0 z-50`); `bg-brand-bg/90 backdrop-blur-md border-b border-brand-primary/20`; left: "Taskify" brand name in `font-heading font-bold text-white`; right: "Sign In" link (`href="/auth/login"`, ghost text style) + "Get Started" button (`href="/auth/register"`, `bg-brand-cta hover:bg-brand-cta-hover text-white rounded-lg px-4 py-2`); uses `useAuth()` — if authenticated, call `router.replace('/dashboard')` in `useEffect`
- [x] T006 [P] [US1] Create `frontend/components/landing/HeroSection.tsx` — server component; full-width section with `bg-brand-bg` and subtle radial gradient overlay using `bg-brand-deep/5`; single `<h1>` with `font-heading font-bold text-4xl md:text-6xl text-white` containing "Manage Your Tasks, Effortlessly"; subheadline `<p>` in `font-body text-lg text-white/70`; primary CTA `<a href="/auth/register">` styled as `bg-brand-cta hover:bg-brand-cta-hover text-white font-heading font-semibold px-8 py-4 rounded-xl`; secondary link "Sign In" as ghost
- [x] T007 [P] [US1] Create `frontend/components/landing/FeaturesGrid.tsx` — server component; `<section>` with `<h2>font-heading` heading "Why Choose Taskify"; 3-column responsive grid (`grid md:grid-cols-3 gap-6`); each card: `bg-brand-deep/10 border border-brand-primary/20 rounded-xl p-6 hover:border-brand-primary/40 transition-colors`; cards: (1) "Secure by Default" — JWT + bcrypt + HTTP-only cookies; (2) "Fast & Simple" — no clutter, one-click task management; (3) "Your Data, Only Yours" — full user isolation; each card has an inline SVG icon, `font-heading` title, `font-body` description in `text-white/70`
- [x] T008 [P] [US1] Create `frontend/components/landing/HowItWorks.tsx` — server component; `<section>` with `<h2 font-heading>` "How It Works"; 3 numbered steps in horizontal or vertical layout; each step: large step number in `font-accent text-brand-cta text-5xl font-bold`, step title in `font-heading text-white`, description in `font-body text-white/70`; steps: (1) Create account, (2) Add your tasks, (3) Mark done as you go
- [x] T009 [P] [US1] Create `frontend/components/landing/SecuritySection.tsx` — server component; `<section>` with `bg-brand-deep/8 border-y border-brand-primary/20`; `<h2 font-heading>` "Built with Security First"; two-column layout on desktop; left: security points list (JWT HS256, bcrypt passwords, HTTP-only cookies, user data isolation); right: inline SVG shield icon in `text-brand-cta`; all text in `font-body`, labels in `font-accent text-brand-primary`
- [x] T010 [P] [US1] Create `frontend/components/landing/FaqAccordion.tsx` — client component (`'use client'`); `useState<string | null>(null)` for open item ID; 4 FAQ items: (1) "Is Taskify free to use?", (2) "Is my data secure?", (3) "Can I access tasks from any device?", (4) "What happens if I delete my account?"; each item: clickable header with `font-heading text-white` question + chevron icon that rotates 180° when open (`transition-transform duration-200`); answer `<p font-body text-white/70>` hidden/shown via conditional render; item border `border-b border-brand-primary/20`; clicking open item closes it (toggle)
- [x] T011 [P] [US1] Create `frontend/components/landing/LandingFooter.tsx` — server component; `<footer>` with `bg-brand-deep/10 border-t border-brand-primary/20 py-8`; brand name "Taskify" in `font-heading font-bold text-white`; nav links row: Home (`href="/"`), Sign In (`href="/auth/login"`), Get Started (`href="/auth/register"`) in `font-body text-white/60 hover:text-white`; copyright line `© 2026 Taskify. All rights reserved.` in `font-body text-white/40 text-sm`
- [x] T012 [US1] Rewrite `frontend/app/page.tsx` — convert to server component (remove `'use client'`, `useEffect`, `useRouter`, `useAuth`); export `metadata` object with title `'Taskify — Smart Task Manager'`, description, openGraph (url, siteName, type), twitter card, `alternates: { canonical: '/' }`; default export renders full landing page: import and compose `<LandingNav>`, `<HeroSection>`, `<FeaturesGrid>`, `<HowItWorks>`, `<SecuritySection>`, `<FaqAccordion>`, `<LandingFooter>` in a `<main>` wrapper with `bg-brand-bg min-h-screen`; auth redirect logic is now handled inside `LandingNav` (client component)

**Checkpoint**: Navigate to `/` unauthenticated → full landing page renders with all 6 sections + sticky nav. Navigate to `/` authenticated → immediately redirected to `/dashboard`. CTA button navigates to `/auth/register`. Page source contains `<title>Taskify — Smart Task Manager</title>` and Open Graph tags.

---

## Phase 4: User Story 2 — Authenticated User Uses the Redesigned Dashboard (Priority: P2)

**Goal**: Redesign dashboard with dark theme, stats bar, skeleton loading, completion animations, completed-card dimming, improved empty state, and a branded header.

**Independent Test**: Log in → dashboard loads with `#0C0C0C` background, stats bar showing task counts, skeleton cards during load, branded header with "Hi, [username]", task cards with hover animation and completed-card dimming.

- [x] T013 [P] [US2] Create `frontend/components/dashboard/DashboardHeader.tsx` — client component; receives `username: string` and `onLogout: () => void` props; sticky `<header>` with `bg-brand-bg border-b border-brand-primary/20 backdrop-blur-sm`; left: "Taskify" in `font-heading font-bold text-white`; right: `<span font-body text-white/70>Hi, {username}</span>` + Sign Out button (`font-body text-white/60 hover:text-brand-cta border border-brand-primary/30 hover:border-brand-cta rounded-lg px-3 py-1.5 transition-colors`)
- [x] T014 [P] [US2] Create `frontend/components/dashboard/StatsBar.tsx` — client component; receives `tasks: Task[]` prop; derives `total = tasks.length`, `completed = tasks.filter(t => t.completed).length`, `pending = total - completed`; renders 3 stat cards in a grid (`grid grid-cols-3 gap-4`); each card: `bg-brand-deep/10 border border-brand-primary/20 rounded-xl p-4`; stat number in `font-accent text-3xl font-bold text-brand-cta`; label in `font-body text-xs text-white/60 uppercase tracking-wide`; labels: "Total", "Completed", "Pending"
- [x] T015 [P] [US2] Create `frontend/components/dashboard/SkeletonCard.tsx` — server component; renders a single animated loading placeholder card matching task card dimensions; `bg-brand-deep/10 border border-brand-primary/10 rounded-xl p-4 animate-pulse`; contains 3 placeholder bars: wide bar (title), medium bar (description), narrow bar (date) — all `bg-brand-primary/20 rounded h-4`; no props needed; dashboard renders 3 instances during load
- [x] T016 [P] [US2] Create `frontend/components/dashboard/EmptyState.tsx` — server component; renders when task list is empty; centered div with `py-16 flex flex-col items-center gap-4`; inline SVG clipboard/checklist icon in `text-brand-primary/40 w-16 h-16`; `<h3 font-heading text-white/60>` "No tasks yet"; `<p font-body text-white/40>` "Add your first task above to get started"; no props needed
- [x] T017 [P] [US2] Update `frontend/components/tasks/TaskItem.tsx` — replace all `bg-white`, `border-gray-*`, `text-gray-*` classes with brand palette equivalents; card base: `bg-brand-deep/10 border border-brand-primary/20 rounded-xl p-4 transition-all duration-200`; pending hover: `hover:border-brand-primary/50 hover:shadow-lg hover:shadow-brand-deep/20 hover:-translate-y-0.5`; completed state: add `opacity-50 border-brand-primary/10` when `task.completed`; completed hover: `hover:opacity-60`; completion toggle button: when completed show filled circle in `text-brand-cta` with scale animation (`transition-transform duration-150 active:scale-90`); task title: add `line-through text-white/40` when completed, normal `text-white` when pending; task description: `text-white/60 font-body text-sm`; date: `text-white/30 font-accent text-xs`; Edit button: `text-white/50 hover:text-white font-body text-sm`; Delete button: `text-brand-cta/60 hover:text-brand-cta font-body text-sm`
- [x] T018 [P] [US2] Update `frontend/components/tasks/TaskList.tsx` — replace wrapper background/border classes with `bg-transparent`; remove any `bg-white` or gray background; ensure each `TaskItem` renders in a `space-y-3` list; when `tasks.length === 0` and not loading, render `<EmptyState />` imported from `components/dashboard/EmptyState`
- [x] T019 [P] [US2] Update `frontend/components/tasks/TaskForm.tsx` — card wrapper: `bg-brand-deep/10 border border-brand-primary/20 rounded-xl p-6`; section label: `font-accent text-brand-primary text-xs uppercase tracking-widest`; title input and description textarea: `bg-brand-bg border border-brand-primary/30 rounded-lg text-white placeholder-white/30 font-body focus:outline-none focus:border-brand-cta focus:ring-1 focus:ring-brand-cta transition-colors`; "Add Task" button: `bg-brand-cta hover:bg-brand-cta-hover text-white font-heading font-semibold rounded-lg px-6 py-2.5 disabled:opacity-40 disabled:cursor-not-allowed transition-colors`
- [x] T020 [P] [US2] Update `frontend/components/tasks/EditTaskModal.tsx` — modal overlay: `bg-brand-bg/80 backdrop-blur-sm`; modal card: `bg-brand-deep/20 border border-brand-primary/30 rounded-2xl p-6 backdrop-blur-md`; heading: `font-heading text-white`; inputs: same dark style as TaskForm (T019); Cancel button: ghost style `text-white/60 hover:text-white border border-brand-primary/30`; Save button: `bg-brand-cta hover:bg-brand-cta-hover text-white font-heading`; error text: `text-brand-cta/80`
- [x] T021 [P] [US2] Update `frontend/components/tasks/DeleteConfirmDialog.tsx` — dialog card: `bg-brand-deep/20 border border-brand-primary/30 rounded-2xl p-6 backdrop-blur-md`; overlay: `bg-brand-bg/80 backdrop-blur-sm`; heading: `font-heading text-white`; message text: `font-body text-white/70`; Cancel button: ghost style; Delete button: `bg-brand-cta hover:bg-brand-cta-hover text-white font-heading` (keep destructive red accent for Delete only if desired — otherwise match CTA)
- [x] T022 [P] [US2] Update `frontend/components/ui/Toast.tsx` — toast container: `bg-brand-deep/95 border border-brand-primary/30 rounded-xl shadow-xl shadow-brand-bg/50 backdrop-blur-sm`; add left accent border: success = `border-l-4 border-l-green-500/70`, error = `border-l-4 border-l-brand-cta`; message text: `font-body text-white`; dismiss button: `text-white/40 hover:text-white`; ensure auto-dismiss at 4 seconds if not already implemented
- [x] T023 [US2] Update `frontend/app/dashboard/page.tsx` — add `export const metadata: Metadata = { title: 'Dashboard', robots: { index: false, follow: false } }`; replace inline `<header>` JSX with `<DashboardHeader username={user.username} onLogout={logout} />`; add `<StatsBar tasks={tasks} />` below header, above the task form; replace spinner loading state (`isLoadingTasks`) with 3× `<SkeletonCard />` components; import `EmptyState` (used inside `TaskList`); remove hardcoded `Welcome back, {user.username}` and Account Details card (now in header + landing page handles welcome); keep all existing task logic (`handleTaskCreated`, `handleEdit`, `handleSave`, `handleToggle`, `handleDelete`) unchanged; update all background/wrapper classes to use brand palette (`bg-brand-bg min-h-screen`)

**Checkpoint**: Log in → dashboard shows branded header "Taskify / Hi, testuser / Sign Out", 3 skeleton cards briefly during load, then task list. Stats bar shows live counts. Task cards animate on hover. Completed tasks dim to 50%. Toast notifications appear on actions.

---

## Phase 5: User Story 3 — Auth Page Redesign (Priority: P3)

**Goal**: Redesign login and register pages with dark glassmorphism card on a gradient background. Promote page files to Server Components to enable SEO metadata exports. Form client logic remains in existing form components.

**Independent Test**: Navigate to `/auth/login` unauthenticated → see dark radial gradient background, centered glass card, dark inputs with `#F2613F` focus ring, branded CTA button with loading state. Page source contains `<title>Sign In | Taskify</title>`.

- [x] T024 [P] [US3] Update `frontend/components/auth/login-form.tsx` — keep all existing auth logic (`useAuth`, `useRouter`, form state, API call) unchanged; update visual styles only: form inputs → `bg-brand-bg border border-brand-primary/30 rounded-lg text-white placeholder-white/30 font-body focus:outline-none focus:border-brand-cta focus:ring-1 focus:ring-brand-cta`; remove default browser outline (`outline-none`); submit button → `bg-brand-cta hover:bg-brand-cta-hover text-white font-heading font-semibold w-full rounded-lg py-3 transition-colors`; add loading state: when form is submitting, show spinner inside button and set `disabled`; link to register: `text-brand-cta hover:text-brand-cta-hover font-body`; error message: `text-brand-cta/90 font-body text-sm`; label text: `font-body text-white/70 text-sm`
- [x] T025 [P] [US3] Update `frontend/components/auth/register-form.tsx` — apply identical visual style changes as T024 (dark inputs, `#F2613F` focus ring, branded button, loading state); keep all existing registration logic unchanged; form labels in `font-body text-white/70`; error/success messages in `text-brand-cta/90`
- [x] T026 [US3] Rewrite `frontend/app/auth/login/page.tsx` — remove `'use client'` directive (promote to server component); remove `useEffect`, `useAuth`, `useRouter` imports (these are now only in `LoginForm`); add `export const metadata: Metadata = { title: 'Sign In', description: 'Sign in to your Taskify account and manage your tasks.', alternates: { canonical: '/auth/login' }, openGraph: { title: 'Sign In | Taskify', url: '/auth/login' } }`; page layout: `<div className="min-h-screen bg-gradient-to-br from-brand-deep to-brand-bg flex items-center justify-center px-4 py-12">`; glass card wrapper: `<div className="w-full max-w-md bg-brand-deep/10 backdrop-blur-md border border-brand-primary/20 rounded-2xl px-8 py-10 shadow-2xl shadow-brand-bg/50">`; card heading: `<h1 className="font-heading font-bold text-2xl text-white text-center mb-2">Welcome back</h1>`; subheading: `<p className="font-body text-white/60 text-center text-sm mb-8">Sign in to your account</p>`; render `<LoginForm />` as child
- [x] T027 [US3] Rewrite `frontend/app/auth/register/page.tsx` — apply identical structural changes as T026; remove `'use client'`; add `export const metadata: Metadata = { title: 'Create Account', description: 'Join Taskify for free. Create an account and start managing your tasks today.', alternates: { canonical: '/auth/register' } }`; page layout identical to login page; card heading: `<h1>Create your account</h1>`; subheading: "Join Taskify — it's free"; render `<RegisterForm />` as child

**Checkpoint**: Navigate to `/auth/login` → dark gradient background, glass card, focused inputs show `#F2613F` ring, submit button shows spinner during API call. View page source → `<title>Sign In | Taskify</title>` and canonical tag present. Same for `/auth/register`.

---

## Phase 6: Polish & SEO Verification (US4 — Search Engine Crawler)

**Purpose**: Verify all SEO infrastructure works end-to-end. Cross-cutting visual polish. This phase validates the US4 SEO crawler story across all previously implemented work.

**Independent Test (US4)**: Access `/sitemap.xml` → 3 valid URLs. Access `/robots.txt` → disallow rules for `/dashboard`, `/api`, `/auth`. View page source of `/` → find `<title>`, OG tags, JSON-LD script. Run Lighthouse SEO audit → score ≥ 95. Dashboard page source → `<meta name="robots" content="noindex">`.

- [x] T028 [P] Verify `frontend/app/sitemap.ts` renders correct XML — run `npm run dev`, open `http://localhost:3000/sitemap.xml` in browser, confirm 3 `<url>` entries matching `contracts/seo-contracts.md` Contract 1; fix any URL path or priority discrepancies
- [x] T029 [P] Verify `frontend/app/robots.txt` renders correct content — open `http://localhost:3000/robots.txt`, confirm `Disallow` rules for `/dashboard`, `/api`, `/auth`, and `Sitemap:` directive matching `contracts/seo-contracts.md` Contract 2; fix any missing rules
- [x] T030 Verify heading hierarchy across all 4 pages — open each page (`/`, `/auth/login`, `/auth/register`, `/dashboard`) in browser; use DevTools or accessibility inspector to confirm exactly one `<h1>` per page, correct H2/H3 nesting, no heading level skips; fix any violations
- [ ] T031 Run Lighthouse SEO audit — open Chrome DevTools → Lighthouse → run SEO audit on `http://localhost:3000`; target score ≥ 95; fix any flagged issues (missing meta descriptions, missing canonical, robots issues, tap target sizes); re-run until score ≥ 95

---

## Dependencies & Execution Order

### Phase Dependencies

```
Phase 2 (Foundational) → no dependencies — START HERE
Phase 3 (US1 Landing) → requires Phase 2 complete (T001–T002 for tokens; T003–T004 parallel)
Phase 4 (US2 Dashboard) → requires Phase 2 complete
Phase 5 (US3 Auth) → requires Phase 2 complete
Phase 6 (Polish/US4) → requires Phases 3, 4, 5 all complete
```

### User Story Dependencies

- **US1 (P1)**: Depends only on Foundational phase — start immediately after T001–T002
- **US2 (P2)**: Depends only on Foundational phase — can run in parallel with US1
- **US3 (P3)**: Depends only on Foundational phase — can run in parallel with US1/US2
- **US4 (P2)**: Depends on US1/US2/US3 all being complete — final verification

### Within Each Phase

- Tasks marked `[P]` have no interdependencies → can be executed in parallel
- T012 (landing assembly) depends on T005–T011 (all landing components)
- T023 (dashboard assembly) depends on T013–T022 (all dashboard + task components)
- T026 (login page) depends on T024 (login-form update)
- T027 (register page) depends on T025 (register-form update)

---

## Parallel Opportunities

### Phase 2 — Run in parallel

```
T001 (globals.css) || T003 (sitemap.ts) || T004 (robots.ts)
T002 (layout.tsx) [after T001 defines @theme so font vars can reference it]
```

### Phase 3 (US1) — Run all component tasks in parallel

```
T005 (LandingNav) || T006 (HeroSection) || T007 (FeaturesGrid) ||
T008 (HowItWorks) || T009 (SecuritySection) || T010 (FaqAccordion) || T011 (LandingFooter)
→ T012 (assemble app/page.tsx) [requires T005–T011 done]
```

### Phase 4 (US2) — Run all component tasks in parallel

```
T013 (DashboardHeader) || T014 (StatsBar) || T015 (SkeletonCard) || T016 (EmptyState) ||
T017 (TaskItem) || T018 (TaskList) || T019 (TaskForm) ||
T020 (EditTaskModal) || T021 (DeleteConfirmDialog) || T022 (Toast)
→ T023 (assemble dashboard/page.tsx) [requires T013–T022 done]
```

### Phase 5 (US3) — Pairs

```
T024 (login-form) || T025 (register-form)
→ T026 (login page) [requires T024]
→ T027 (register page) [requires T025]
```

### Phase 6 — Run in parallel

```
T028 (sitemap verify) || T029 (robots verify) || T030 (heading hierarchy)
→ T031 (Lighthouse audit) [after T028–T030 fixes applied]
```

---

## Implementation Strategy

### MVP (User Story 1 Only)

1. Complete Phase 2 (Foundational) → design tokens + font system available
2. Complete Phase 3 (US1 Landing) → professional dark landing page live
3. **STOP & VALIDATE**: Visit `/` → confirms dark theme, correct palette, landing sections
4. Deploy to Vercel for demo

### Full Incremental Delivery

1. Phase 2 → Foundation ready
2. Phase 3 → Landing page live (demo-ready first impression)
3. Phase 4 → Dashboard redesign (core product surface polished)
4. Phase 5 → Auth pages redesigned (full demo flow polished)
5. Phase 6 → SEO verified, Lighthouse ≥ 95 (hackathon judging criteria met)

---

## Task Summary

| Phase | Tasks | Parallel Opportunities |
|---|---|---|
| Phase 2: Foundational | T001–T004 (4 tasks) | T001/T003/T004 parallel |
| Phase 3: US1 Landing | T005–T012 (8 tasks) | T005–T011 parallel |
| Phase 4: US2 Dashboard | T013–T023 (11 tasks) | T013–T022 parallel |
| Phase 5: US3 Auth | T024–T027 (4 tasks) | T024/T025 parallel |
| Phase 6: Polish/US4 | T028–T031 (4 tasks) | T028–T030 parallel |
| **TOTAL** | **31 tasks** | |

---

## Notes

- `[P]` = different files, no cross-task dependencies — safe to execute in parallel
- `[US#]` label maps each task to the user story it serves for traceability
- All existing task CRUD logic (`api.ts`, `auth_context.tsx`, `lib/`) is untouched
- All existing backend code is untouched
- Tailwind v4: use `bg-brand-deep/10` syntax for opacity variants — works natively
- If arbitrary values are needed: `bg-[#481E14]/10` syntax is Tailwind v4 compatible
- Commit after each phase checkpoint
