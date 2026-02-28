---
id: 003-001
title: ui-seo-upgrade-spec
stage: spec
date: 2026-02-28T00:00:00Z
surface: claude-code
model: claude-sonnet-4-6
feature: 003-ui-seo-upgrade
branch: main
user: Mahad
command: /sp.specify
labels: [spec, ui, seo, dark-theme, design-system]
links:
  spec: specs/003-ui-seo-upgrade/spec.md
  ticket: ~
  adr: ~
  pr: ~
files:
  created:
    - specs/003-ui-seo-upgrade/spec.md
    - specs/003-ui-seo-upgrade/checklists/requirements.md
    - history/prompts/003-ui-seo-upgrade/001-ui-seo-upgrade-spec.prompt.md
tests:
  - n/a (spec phase — no tests)
---

## Prompt

Feature: Phase 3 — UI & SEO Upgrade (Hackathon-Level Polish)

Upgrade the existing deployed fullstack Task SaaS application with:
1. Premium dark-theme UI redesign using palette #0C0C0C / #481E14 / #9B3922 / #F2613F
2. Hackathon-level SEO optimization (Lighthouse SEO ≥ 95)
3. Improved demo presentation quality
4. Fonts: Poppins (headings), Montserrat (body), Oswald (accent/labels) via next/font
5. Landing page: hero, features grid, how-it-works, security, FAQ, footer
6. Dashboard: stats bar, skeleton loaders, hover animations, toast notifications, empty state
7. Auth pages: glass card, gradient background, F2613F focus rings
8. SEO: metadata, OG tags, sitemap.ts, robots.ts, JSON-LD, canonical URLs
9. No separate branch — commit directly to main

## Response snapshot

Generated a complete feature specification at `specs/003-ui-seo-upgrade/spec.md` covering:
- 4 prioritised user stories (landing page visitor, dashboard user, auth page user, SEO crawler)
- 31 functional requirements across design system, landing page, dashboard, auth, and SEO domains
- 10 measurable success criteria (Lighthouse ≥ 95, palette compliance, font loading, stats accuracy, etc.)
- 9 documented assumptions (app name "Taskify", root page change to landing, next/font self-hosting, etc.)
- Edge cases: large screens, zero tasks, font CDN failure, long task titles, no-JS
- Quality checklist created — all items pass, ready for /sp.plan

## Outcome

- ✅ Impact: Complete specification ready for planning and implementation
- 🧪 Tests: No tests in spec phase — acceptance scenarios defined per user story
- 📁 Files: specs/003-ui-seo-upgrade/spec.md, checklists/requirements.md
- 🔁 Next prompts: /sp.plan → /sp.tasks → /sp.implement
- 🧠 Reflection: Feature description was detailed enough to resolve all decisions without clarification. Key assumption made: root page changes from auth redirect to marketing landing page.

## Evaluation notes (flywheel)

- Failure modes observed: none
- Graders run and results (PASS/FAIL): checklist all-pass
- Prompt variant (if applicable): ~
- Next experiment (smallest change to try): run /sp.plan to generate implementation plan
