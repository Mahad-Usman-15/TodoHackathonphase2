# Feature Specification: Phase 3 — UI & SEO Upgrade (Hackathon-Level Polish)

**Feature Branch**: `003-ui-seo-upgrade`
**Created**: 2026-02-28
**Status**: Draft
**Input**: User description: "Premium dark-theme UI redesign, hackathon-level SEO optimization, improved demo presentation quality. Lighthouse SEO target: 95+."

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 — First-Time Visitor Lands on Homepage (Priority: P1)

A potential user visits the site URL for the first time. They see a professional, dark-themed landing page that communicates the product's value immediately. The page loads fast, looks polished, and has clear calls-to-action to register or sign in.

**Why this priority**: The landing page is the single most important impression surface. Poor presentation loses users before they even try the product. This is the highest-impact change for hackathon judges evaluating demo quality.

**Independent Test**: Navigate to the root URL (`/`) without being authenticated and verify the landing page renders with all required sections.

**Acceptance Scenarios**:

1. **Given** a visitor is not authenticated, **When** they navigate to `/`, **Then** they see a hero section with a headline, a subheading, and a CTA button styled in `#F2613F` against a `#0C0C0C` background.
2. **Given** the landing page loads, **When** the visitor scrolls down, **Then** they encounter in order: a features grid (≥3 items), a how-it-works section, a security highlight section, an FAQ section, and a footer with navigation links.
3. **Given** a mobile viewport (375px wide), **When** the landing page renders, **Then** all sections stack vertically with no horizontal overflow and all text remains readable.
4. **Given** a visitor clicks the primary CTA, **When** it is clicked, **Then** they are navigated to the registration page.

---

### User Story 2 — Authenticated User Uses the Redesigned Dashboard (Priority: P2)

An authenticated user opens the dashboard and experiences a professional dark-themed task manager. They see a stats summary at the top, a card-based task list, smooth animations on interactions, and informative loading/empty states.

**Why this priority**: The dashboard is the core product surface used during a live demo. It must communicate quality and completeness to judges and reviewers.

**Independent Test**: Log in with valid credentials and verify all dashboard UI components render and function correctly.

**Acceptance Scenarios**:

1. **Given** the user is authenticated and has tasks, **When** the dashboard loads, **Then** a stats bar shows total, completed, and pending task counts derived from live data.
2. **Given** tasks are loading, **When** the API call is in-flight, **Then** skeleton loading cards are displayed in place of task cards.
3. **Given** tasks have loaded, **When** the user hovers over a task card, **Then** the card transitions smoothly (border brightens, subtle lift) with no layout shift.
4. **Given** the user has no tasks, **When** the dashboard renders, **Then** a styled empty-state component with an icon and descriptive message is shown instead of a blank area.
5. **Given** the user creates, updates, completes, or deletes a task, **When** the action succeeds, **Then** a dark-themed toast notification confirms the action within 500ms.
6. **Given** the user toggles task completion, **When** the toggle is clicked, **Then** the checkbox animates (scale + colour transition) and the task title gains a strikethrough style.

---

### User Story 3 — User Signs Up or Signs In via Redesigned Auth Pages (Priority: P3)

A user visits `/auth/login` or `/auth/register`. They see a centered glass-style card on a gradient background built from the brand palette. Input fields have visible focus rings and the CTA buttons match the design system.

**Why this priority**: Auth pages are shown early in any demo flow. They must look polished and consistent with the rest of the design system.

**Independent Test**: Navigate to `/auth/login` and `/auth/register` unauthenticated and verify the visual design and functional form submission.

**Acceptance Scenarios**:

1. **Given** a visitor navigates to `/auth/login`, **When** the page renders, **Then** a centered card is displayed on a radial gradient background blending `#481E14` to `#0C0C0C`.
2. **Given** a user clicks into an input field, **When** the field is focused, **Then** it displays a `#F2613F` focus ring with no default browser outline.
3. **Given** a user submits valid credentials, **When** the form is submitted, **Then** the button shows a loading state (spinner or disabled text) until the response resolves.
4. **Given** the auth pages load, **When** inspected in a browser, **Then** the page background, card, input fields, and button all conform to the brand palette with no default Tailwind slate or white backgrounds.

---

### User Story 4 — Search Engine Crawler Indexes the Public Site (Priority: P2)

A search engine crawler visits the site. It finds a valid `sitemap.xml`, a `robots.txt` that disallows private routes, unique descriptive `<title>` and `<meta description>` tags on all public pages, Open Graph and Twitter Card metadata, and structured JSON-LD data. The dashboard and API routes are excluded from indexing.

**Why this priority**: SEO infrastructure is invisible to human users but directly measurable by Lighthouse and Google Search Console — critical for a hackathon judging criterion.

**Independent Test**: Access `/sitemap.xml`, `/robots.txt`, and view page source of `/`, `/auth/login`, `/auth/register` to verify all SEO assets are present and correct.

**Acceptance Scenarios**:

1. **Given** a crawler requests `/sitemap.xml`, **When** it receives the response, **Then** it gets a valid XML sitemap listing `/`, `/auth/login`, and `/auth/register` with no dashboard or API URLs.
2. **Given** a crawler requests `/robots.txt`, **When** it receives the response, **Then** the rules disallow `/dashboard`, `/api`, and `/auth` for all crawlers, and include a `Sitemap:` directive.
3. **Given** a search engine renders `/`, **When** the `<head>` is parsed, **Then** it finds a unique `<title>`, `<meta name="description">`, `<meta property="og:*">` tags, `<meta name="twitter:*">` tags, and a `<link rel="canonical">`.
4. **Given** a Lighthouse SEO audit is run against the public pages, **When** the report generates, **Then** the SEO score is ≥ 95.
5. **Given** a crawler visits `/dashboard`, **When** it checks the `robots` meta tag, **Then** it finds `noindex, nofollow` preventing indexation.

---

### Edge Cases

- What happens when the landing page is viewed on a very large screen (2560px+)? Content should remain centred with a max-width container and not stretch edge to edge.
- How does the task stats section behave when a user has zero tasks? All three counters must display `0` without error.
- What if the Google Fonts CDN is unavailable? `next/font` must serve fonts locally (self-hosted via Next.js font subsetting) so layout does not break.
- What if a task title is very long (200 characters)? Card layout must not break — text should truncate with ellipsis or wrap cleanly.
- What if JavaScript is disabled? Core landing page content and SEO metadata must remain accessible (Next.js SSR ensures this).

---

## Requirements *(mandatory)*

### Functional Requirements

#### Design System

- **FR-001**: All pages MUST use `#0C0C0C` as the root background colour. Pure black (`#000000`) and default Tailwind slate/gray backgrounds are prohibited.
- **FR-002**: All card surfaces MUST render as a tint of `#481E14` at 8–12% opacity over the page background, creating a subtle warm dark card effect.
- **FR-003**: All borders MUST use `#9B3922` at low opacity (≤ 30%) to provide subtle definition without visual noise.
- **FR-004**: All primary CTA buttons MUST use `#F2613F` as their background colour. Hover state MUST lighten this by 5–8%.
- **FR-005**: The site MUST load three custom Google Fonts via `next/font`: Poppins (headings/H1–H3), Montserrat (body/paragraph text), Oswald (labels, stats, accent text).
- **FR-006**: No additional colours outside the four-colour palette (`#0C0C0C`, `#481E14`, `#9B3922`, `#F2613F`) and their derived opacities/tints may be introduced.

#### Landing Page

- **FR-007a**: The root page (`/`) MUST redirect authenticated users to `/dashboard` immediately on load. Unauthenticated visitors MUST see the full landing page.
- **FR-007b**: The landing page MUST include a sticky top navigation header containing: the brand name "Taskify" on the left, and a "Sign In" text link plus a "Get Started" CTA button (styled in `#F2613F`) on the right. The header MUST remain fixed at the top of the viewport during scroll with a semi-transparent `#0C0C0C` background and a subtle bottom border using `#9B3922` at low opacity.
- **FR-007**: The root page (`/`) MUST include a hero section containing: one H1 headline, a subheadline paragraph, and a primary CTA button linking to `/auth/register`.
- **FR-008**: The landing page MUST include a features grid section with a minimum of three feature items, each containing an icon or visual, a heading, and a short description.
- **FR-009**: The landing page MUST include a how-it-works section with numbered or sequential steps.
- **FR-010**: The landing page MUST include a security highlight section communicating data protection and JWT-based authentication.
- **FR-011**: The landing page MUST include an FAQ section with a minimum of four question-answer pairs rendered as an interactive accordion — each question is clickable to expand/collapse its answer. Only one answer may be open at a time. The component must be a client component using local state.
- **FR-012**: The landing page MUST include a footer containing the app name, navigation links (Home, Sign In, Register), and a copyright line.
- **FR-013**: The landing page MUST contain between 800 and 1,200 words of visible text content for content SEO purposes.

#### Dashboard

- **FR-013a**: The dashboard MUST include a top header bar containing: the brand name "Taskify" on the left, and a "Hi, [username]" greeting text plus a "Sign Out" button on the right. The header MUST use the brand palette (background `#0C0C0C` with a bottom border at `#9B3922` low opacity) and remain consistent with the sticky landing page header styling.
- **FR-014**: The dashboard MUST display a task statistics section showing three metrics: Total Tasks, Completed Tasks, and Pending Tasks, derived from the current user's task list.
- **FR-015**: The dashboard MUST show skeleton loading cards while task data is being fetched from the API.
- **FR-016**: Each task card MUST have a hover transition (border brightening and/or subtle upward translation) using CSS transitions with a duration of 150–250ms.
- **FR-017**: The task completion toggle MUST animate the checkbox with a scale and colour transition when toggled. When a task is marked complete, its card MUST transition to 50% opacity and its border MUST dim to a lower opacity variant of `#9B3922`, visually distinguishing it from pending tasks in-place without reordering.
- **FR-018**: The empty state MUST render a styled component with a visual icon and a descriptive message when the user has no tasks.
- **FR-019**: Toast notifications MUST appear within 500ms of a successful create, update, complete-toggle, or delete action, and auto-dismiss after 3–5 seconds.

#### Authentication Pages

- **FR-020**: Both `/auth/login` and `/auth/register` MUST render a centered card with a `backdrop-blur` and semi-transparent background derived from `#481E14`.
- **FR-021**: The page background on auth pages MUST be a radial or linear gradient from `#481E14` to `#0C0C0C`.
- **FR-022**: All form input fields MUST display a `#F2613F` focus ring on keyboard focus and remove the default browser outline.
- **FR-023**: The submit button on auth forms MUST display a visual loading state (spinner or disabled label change) while an API request is in-flight.

#### SEO

- **FR-024**: The root `app/layout.tsx` MUST define a `metadataBase`, a default site title template (`%s | Taskify`), and a default description.
- **FR-025**: Each public page (`/`, `/auth/login`, `/auth/register`) MUST export a unique `metadata` object with `title`, `description`, `openGraph`, and `twitter` fields.
- **FR-026**: Each public page MUST include a `canonical` URL via the `alternates.canonical` metadata field.
- **FR-027**: The dashboard page MUST export `robots: { index: false, follow: false }` in its metadata to prevent search engine indexation.
- **FR-028**: The app MUST expose a `/sitemap.xml` generated by `app/sitemap.ts` listing only the three public pages with `changeFrequency` and `priority` values.
- **FR-029**: The app MUST expose a `/robots.txt` generated by `app/robots.ts` with rules disallowing `/dashboard`, `/api`, and `/auth` for all user agents, and including a `Sitemap:` entry.
- **FR-030**: The root layout MUST embed a JSON-LD `<script>` containing `WebApplication` and `Organization` structured data describing the app.
- **FR-031**: All public pages MUST have a single H1 element. H2 and H3 elements MUST be used for sub-sections in correct hierarchical order.

### Key Entities

- **Design Token**: A colour, opacity, font, or spacing value defined in the Tailwind config or CSS variables that enforces the brand palette globally.
- **Task Stats**: Derived counts (total, completed, pending) computed client-side from the user's task array — not a new API endpoint.
- **SEO Metadata Object**: A Next.js `Metadata` export per page containing title, description, Open Graph, Twitter Card, canonical URL, and robots fields.
- **Structured Data Block**: A JSON-LD script embedded in the HTML `<head>` at the root layout level, containing `WebApplication` and `Organization` schema.org types.

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A first-time visitor can understand the product's purpose and locate the sign-up CTA within 10 seconds of landing on the homepage — measurable by visual inspection of the hero section.
- **SC-002**: Lighthouse SEO audit score on the landing page is ≥ 95 when run in Chrome DevTools or CI.
- **SC-003**: Lighthouse Performance score on the landing page does not decrease by more than 5 points compared to the pre-upgrade baseline, confirming font loading and new content do not degrade load speed.
- **SC-004**: `/sitemap.xml` returns HTTP 200 with valid XML containing exactly three URLs (root, login, register) — verifiable by direct URL access.
- **SC-005**: `/robots.txt` returns HTTP 200 with `Disallow` rules for `/dashboard`, `/api`, and `/auth` — verifiable by direct URL access.
- **SC-006**: All four palette colours (`#0C0C0C`, `#481E14`, `#9B3922`, `#F2613F`) are present in the rendered CSS across all three page types with no default Tailwind slate or white backgrounds — verifiable by browser devtools.
- **SC-007**: No console errors appear on the landing page, login page, register page, or dashboard when tested in a clean browser session.
- **SC-008**: All three custom fonts (Poppins, Montserrat, Oswald) load successfully and are applied to their respective typographic roles — verifiable by computed styles in browser devtools.
- **SC-009**: Dashboard task stats (total, completed, pending) accurately reflect the authenticated user's current task data — verifiable by comparing stat numbers against the task list.
- **SC-010**: The site passes WCAG AA contrast requirements for all body text against its card and page backgrounds — measurable via Lighthouse Accessibility audit.

---

## Assumptions

- The backend API and authentication logic remain unchanged. This feature is frontend-only.
- The app name used in SEO metadata and the landing page is **"Taskify"** — a more marketable name than "Todo App". The internal codebase variable names are unchanged.
- The production URL is `https://todo-hackathonphase2.vercel.app` — used for canonical URLs, sitemap, and Open Graph metadata.
- Tailwind CSS v3 is the existing styling framework. Custom colours will be added to `tailwind.config.js` rather than inline styles.
- `next/font` with Google Fonts is used for all three typefaces, enabling automatic self-hosting with zero network round-trips to Google at runtime.
- Animations use native CSS transitions only (`transition`, `transform`, `opacity`) — no animation libraries are introduced.
- The landing page replaces the current redirect-to-login root page behaviour. The root `app/page.tsx` will render the marketing landing page; unauthenticated users will no longer be immediately redirected.
- Authenticated users visiting `/` are redirected to `/dashboard` immediately. The landing page is served exclusively to unauthenticated visitors. Existing middleware or auth-check logic on the root page must preserve this redirect behaviour.
- Skeleton loaders are implemented with CSS animated placeholders using the brand palette, not a third-party skeleton library.

---

## Clarifications

### Session 2026-02-28

- Q: When an authenticated user navigates to `/`, what should happen? → A: Redirect to `/dashboard` immediately. Landing page is unauthenticated-only.
- Q: Should the FAQ section use an interactive accordion or static always-visible layout? → A: Interactive accordion — click to expand/collapse, one item open at a time, client component.
- Q: Should the landing page include a top navigation header? → A: Sticky header — brand name left, Sign In link + "Get Started" CTA button right, fixed on scroll.
- Q: How should completed task cards visually differ from pending ones beyond strikethrough? → A: Reduced opacity (50%) + dimmed/muted border — completed tasks fade visually in-place, no reordering.
- Q: What should the redesigned dashboard header display? → A: Brand name "Taskify" (left) + "Hi, [username]" greeting (right) + Sign Out button (right) — minimal and clean.

---

## Out of Scope

- Backend changes of any kind (no new API endpoints, no schema changes)
- New authentication providers or auth flow changes
- Multi-theme support (light mode, system preference)
- Animation libraries (Framer Motion, GSAP, etc.)
- Complete design system documentation or Storybook setup
- Brand re-architecture or logo design
- A/B testing or analytics integration
- Internationalisation (i18n)
- PWA or service worker setup
