# Quickstart: Phase 3 — UI & SEO Upgrade

**Feature**: `003-ui-seo-upgrade` | **Date**: 2026-02-28

---

## Prerequisites

- Node.js 18+
- Frontend dependencies installed: `cd frontend && npm install`
- Backend running (unchanged): `cd backend && uvicorn main:app --reload --port 8000`

---

## Run Locally

```bash
cd frontend
npm run dev
# → http://localhost:3000
```

---

## Verify Design Tokens

After implementation, open DevTools → Computed Styles on `<body>`:
- `background-color` should be `rgb(12, 12, 12)` → `#0C0C0C` ✅
- `font-family` should include `Montserrat` ✅

---

## Verify Fonts

DevTools → Elements → select any `<h1>`:
- `font-family` computed value should include `Poppins` ✅

DevTools → Elements → select any stat label:
- `font-family` computed value should include `Oswald` ✅

---

## Verify SEO

```bash
# In browser:
open https://localhost:3000/sitemap.xml   # → valid XML, 3 URLs
open https://localhost:3000/robots.txt    # → Disallow rules + Sitemap directive

# View page source of / → Ctrl+U
# Search for: <title>, og:title, twitter:card, application/ld+json
```

---

## Run Lighthouse SEO Audit

1. Open Chrome DevTools → Lighthouse tab
2. Select: SEO + Performance
3. Run audit on `http://localhost:3000`
4. Target: SEO ≥ 95, Performance drop ≤ 5 pts vs baseline

---

## Key Files Changed

| File | Change |
|---|---|
| `frontend/app/globals.css` | `@theme {}` brand palette + font vars |
| `frontend/app/layout.tsx` | Poppins/Montserrat/Oswald + metadata + JSON-LD |
| `frontend/app/page.tsx` | Full landing page (server component) |
| `frontend/app/sitemap.ts` | `/sitemap.xml` generator |
| `frontend/app/robots.ts` | `/robots.txt` generator |
| `frontend/app/auth/login/page.tsx` | Server component wrapper + SEO metadata |
| `frontend/app/auth/register/page.tsx` | Server component wrapper + SEO metadata |
| `frontend/app/dashboard/page.tsx` | DashboardHeader + StatsBar + SkeletonCard + EmptyState |
| `frontend/components/landing/` | 7 new landing section components |
| `frontend/components/dashboard/` | 4 new dashboard helper components |
| `frontend/components/auth/` | Dark theme inputs + F2613F focus ring + loading state |
| `frontend/components/tasks/` | Dark theme for all task components |
| `frontend/components/ui/Toast.tsx` | Dark toast with coloured left border |

---

## What Has NOT Changed

- `backend/` — entirely untouched
- `frontend/lib/api.ts` — no changes
- `frontend/contexts/auth_context.tsx` — no changes
- `frontend/types/index.ts` — no changes
- Auth flow logic — identical behaviour, only visual changes
- Task CRUD logic — identical behaviour, only visual changes
