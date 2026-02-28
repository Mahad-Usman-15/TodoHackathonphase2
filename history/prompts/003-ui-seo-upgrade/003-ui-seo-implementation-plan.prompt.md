---
id: 003-003
title: ui-seo-implementation-plan
stage: plan
date: 2026-02-28T00:00:00Z
surface: claude-code
model: claude-sonnet-4-6
feature: 003-ui-seo-upgrade
branch: main
user: Mahad
command: /sp.plan
labels: [plan, ui, seo, dark-theme, tailwind-v4, next-font, sitemap, robots, json-ld]
links:
  spec: specs/003-ui-seo-upgrade/spec.md
  ticket: ~
  adr: ~
  pr: ~
files:
  created:
    - specs/003-ui-seo-upgrade/plan.md
    - specs/003-ui-seo-upgrade/research.md
    - specs/003-ui-seo-upgrade/data-model.md
    - specs/003-ui-seo-upgrade/quickstart.md
    - specs/003-ui-seo-upgrade/contracts/seo-contracts.md
    - history/prompts/003-ui-seo-upgrade/003-ui-seo-implementation-plan.prompt.md
tests:
  - Lighthouse SEO ≥ 95 (post-implementation)
  - /sitemap.xml returns 200 with 3 URLs
  - /robots.txt returns 200 with disallow rules
  - No console errors on any page
---

## Prompt

/sp.plan — Generate implementation plan for specs/003-ui-seo-upgrade/spec.md covering:
premium dark-theme UI redesign, landing page, dashboard enhancements, auth page redesign,
and hackathon-level SEO (metadata, sitemap, robots, JSON-LD). Frontend-only. Branch: main.

## Response snapshot

Key discovery: Project uses Tailwind v4 (not v3). Custom colors go in globals.css @theme block, NOT tailwind.config.js.

Plan generated covering:
- Technical Context: TypeScript 5, Next.js 16.1.6, React 19, Tailwind v4 — critical v4 @theme note documented
- Constitution Check: All 8 gates PASS
- Phase 0 Research (8 decisions): Tailwind v4 tokens, next/font self-hosting, App Router metadata API, sitemap/robots handlers, JSON-LD inline script, server vs client page refactoring, glassmorphism implementation, metadata on client pages
- Phase 1 Design: 7-token design map, component responsibility table, page-level changes summary, SEO metadata per page, globals.css @theme block spec, landing page section order, task card visual state table
- Implementation sequence (9 ordered steps)

Artifacts created: plan.md, research.md, data-model.md, quickstart.md, contracts/seo-contracts.md

Critical implementation notes:
- app/page.tsx must become Server Component (enables metadata export; LandingNav handles client auth redirect)
- app/auth/login/page.tsx and register/page.tsx must be promoted to Server Components (enables metadata export; LoginForm/RegisterForm stay as client children)
- @theme block in globals.css replaces tailwind.config.js entirely for custom tokens

## Outcome

- ✅ Impact: Complete implementation plan ready for task generation
- 🧪 Tests: Lighthouse SEO ≥ 95, /sitemap.xml, /robots.txt, console errors, visual inspection
- 📁 Files: 5 artifacts created under specs/003-ui-seo-upgrade/
- 🔁 Next prompts: /sp.tasks → /sp.implement
- 🧠 Reflection: Tailwind v4 discovery was the critical insight — would have caused implementation failure if missed. Server Component promotion for metadata is a non-obvious but mandatory refactor.

## Evaluation notes (flywheel)

- Failure modes observed: setup-plan.ps1 resolved wrong feature env var; bypassed by manual template copy + direct file paths
- Graders run and results (PASS/FAIL): Constitution check all-pass
- Prompt variant (if applicable): ~
- Next experiment (smallest change to try): run /sp.tasks to generate ordered task list
