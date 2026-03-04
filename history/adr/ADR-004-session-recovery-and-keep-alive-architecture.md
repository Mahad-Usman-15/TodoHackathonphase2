# ADR-004: Session Recovery and Keep-Alive Architecture

> **Scope**: Covers the cluster of decisions around keeping users authenticated across page refreshes — silent token refresh strategy, the auth context initialization flow, loading UX during recovery, and backend keep-alive to prevent idle eviction.

- **Status:** Accepted
- **Date:** 2026-03-02
- **Feature:** 005-maintenance-fixes (applies globally to all authenticated pages)
- **Context:** The app uses in-memory access tokens (cleared on page refresh) backed by HTTP-only refresh token cookies. On every page load, `auth_context.tsx` called `api.getMe()`, which immediately fails with 401 (access token is gone), triggering a logout redirect — even though the refresh token cookie is still valid. Additionally, the Render free-tier backend sleeps after 15 minutes of inactivity, causing hard 401 errors during the wake-up window. Both issues resulted in users being silently logged out under normal usage conditions. Three decisions had to be made together: (1) how to silently recover a valid session on refresh, (2) what the user sees during the recovery check, and (3) how to prevent the backend from sleeping and invalidating sessions.

## Decision

Adopt a **silent refresh + spinner + keep-alive** cluster:

- **Auth context init flow**: `getMe()` → if 401 → call `api.refreshToken()` (POST `/api/auth/refresh`, uses HTTP-only cookie) → retry `getMe()` → set user. Only dispatch logout if both calls fail.
- **Loading UX**: During the validation check, render a full-page centered loading spinner (not skeleton, not blank). Protected page content shown only after session is confirmed valid or redirect is issued.
- **Keep-alive**: When a user is authenticated, `auth_context.tsx` starts a `setInterval(() => api.healthPing(), 14 * 60 * 1000)` — pings `GET /api/health` every 14 minutes to prevent Render free-tier sleep (which triggers after 15 minutes of inactivity).
- **Health endpoint**: `GET /api/health` added to `backend/main.py` — no auth required, returns `{"status": "ok"}`.
- **New `api.ts` methods**: `api.refreshToken()` → `POST /api/auth/refresh`; `api.healthPing()` → `GET /api/health`.

## Consequences

### Positive

- Eliminates false-positive logouts on page refresh — users with valid refresh tokens stay logged in
- Full-page spinner prevents any flash of authenticated content before session is confirmed
- Keep-alive prevents the most common cold-start scenario (backend sleeping between user sessions)
- No architecture change — uses the existing `/api/auth/refresh` endpoint that was already implemented
- Health endpoint is reusable for future monitoring, uptime checks, or external health probes
- Interval is cleared automatically when the component unmounts (user logs out), preventing memory leaks

### Negative

- Silent refresh adds one extra round-trip (`refreshToken()` + `getMe()`) on first load after access token expiry — adds ~200–400ms to page load in that scenario
- Full-page spinner can feel slow on poor connections — users see nothing until session resolves
- Keep-alive interval fires even on inactive browser tabs — minor battery/network overhead on mobile
- `setInterval` in a React context requires careful cleanup to avoid running after logout
- Does not solve cold start if the user has been inactive for more than 15 minutes AND the health ping failed (e.g., tab was closed) — first request still triggers a slow warm-up

## Alternatives Considered

### Alternative A: Optimistic Render + Redirect on Failure (Rejected)

Show the protected page immediately; if the session check returns 401, redirect to login with a flash of authenticated content visible briefly.

- **Pros**: No loading delay — instant page display
- **Cons**: Flash of protected content before redirect (poor UX, potential data leak perception); user explicitly chose full-page spinner (clarification Q4)
- **Rejected because**: User's stated preference was spinner; flash of wrong content is a worse experience than a brief spinner

### Alternative B: Increase Access Token Lifetime (Rejected)

Extend access token from 15 minutes to 7 days, eliminating the refresh-on-load problem.

- **Pros**: No refresh flow needed; getMe() always succeeds within session window
- **Cons**: Access token revocation becomes impossible (no blacklisting by constitution); 7-day in-memory token is a larger attack window; violates "15 minute access token" architecture spec in constitution
- **Rejected because**: Constitution specifies 15-minute access tokens; increasing lifetime trades security for convenience

### Alternative C: Store Access Token in sessionStorage (Rejected)

Persist access token in `sessionStorage` — survives page refresh but not tab close.

- **Pros**: Simple — no refresh flow needed; token persists across refreshes
- **Cons**: `sessionStorage` is accessible to JavaScript (XSS risk); constitution explicitly prohibits token storage outside memory/HTTP-only cookies
- **Rejected because**: Constitution absolute prohibition: "❌ Storing tokens in localStorage" (sessionStorage has the same XSS exposure)

### Alternative D: Backend Cron / External Ping for Keep-Alive (Rejected)

Use an external uptime monitoring service (UptimeRobot, etc.) to ping the backend every 14 minutes.

- **Pros**: Keeps backend warm even when no users are active; no frontend code needed
- **Cons**: Requires external service configuration outside the codebase; doesn't help individual users if they're the only active user and the service hasn't pinged recently
- **Rejected because**: Frontend keep-alive tied to authenticated user is more precise — backend only stays warm while someone is actually using the app; external service adds deployment complexity

## References

- Feature Spec: `specs/005-maintenance-fixes/spec.md` — FR-001, FR-002, SC-001
- Implementation Plan: `specs/005-maintenance-fixes/plan.md` — 1B Frontend Changes (auth_context section)
- Research: `specs/005-maintenance-fixes/research.md` — Decision 1 (Token Refresh on Page Load)
- API Contract: `specs/005-maintenance-fixes/contracts/api-changes.md` — GET /api/health
- Constitution: `.specify/memory/constitution.md` — Authentication Architecture (Fixed), JWT Token Refresh Mechanism
- Related ADRs: ADR-001 (Authentication Token Storage Strategy — this ADR extends the refresh flow defined there)
- Evaluator Evidence: `history/prompts/005-maintenance-fixes/plan-001-maintenance-fixes-implementation-plan.prompt.md`
