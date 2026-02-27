# ADR-001: Authentication Token Storage Strategy

> **Scope**: Covers the complete authentication token lifecycle — storage mechanism, cookie configuration, frontend API client pattern, CORS setup, and backend middleware design as an integrated cluster.

- **Status:** Accepted
- **Date:** 2026-02-26
- **Feature:** 002-task-crud (applies globally to all features)
- **Context:** The application uses JWT-based authentication. A decision was required on where to store the access token on the client side and how to transmit it on each request. Two primary mechanisms exist: browser localStorage (manual attachment to headers) and HTTP-only cookies (automatic transmission via browser). This decision ripples through the security posture, API client implementation, CORS configuration, backend middleware design, and production deployment requirements.

## Decision

Adopt **HTTP-only, Secure, SameSite=Lax cookies** for storing the authentication access token, managed entirely by the backend.

- **Token issuance**: Backend sets `access_token` via `Set-Cookie` response header on login and register
- **Cookie attributes**: `HttpOnly=True`, `Secure=True` (production), `SameSite=lax`
- **Frontend role**: Does not read, store, or manually attach the token — sends `credentials: "include"` on all API requests
- **Backend middleware**: `get_current_user` reads from `request.cookies.get("access_token")`, validates JWT, returns authenticated `User`
- **CORS**: Configured with `allow_credentials=True` and explicit origin whitelist (`http://localhost:3000`)
- **Algorithm**: HS256 with `AUTH_SECRET` environment variable (per constitution)

## Consequences

### Positive

- Token is inaccessible to JavaScript — eliminates the entire class of XSS-based token theft attacks
- Frontend components have zero token management responsibility — cleaner component code
- Standard browser behavior handles cookie transmission — no custom interceptors or Authorization header logic in api.ts
- SameSite=Lax provides CSRF protection for state-changing requests from external origins
- Aligns with production-grade security standards for web applications

### Negative

- Requires HTTPS in production (Secure flag); local development uses `Secure=False`
- CORS configuration is more complex — must explicitly whitelist origins and enable credentials
- SameSite=Lax does not fully protect against all CSRF scenarios (same-site attacks); a CSRF token may be needed for stricter posture
- Cookies are scoped to domain/path — cross-subdomain deployments require additional configuration
- Testing with raw curl/Postman requires manual cookie management (`-b "access_token=..."`)

## Alternatives Considered

### Alternative A: JWT in localStorage (Rejected)

Store the JWT in `localStorage`; frontend reads it and attaches as `Authorization: Bearer <token>` header on every request.

- **Pros**: Simple to implement; no CORS credential complexity; works cleanly with SPA API patterns; easy to inspect and test
- **Cons**: Token is accessible via `document.cookie`-equivalent (`localStorage`) — any XSS vulnerability on any page can steal the token; high risk in real-world browser environments; violates constitution prohibition (`❌ Storing tokens in localStorage`)
- **Rejected because**: Constitution explicitly prohibits localStorage for tokens; XSS surface is unacceptable for a production-grade app

### Alternative B: Session-based Authentication (Rejected)

Store session ID in a cookie; backend maintains session state in-memory or in a shared store (e.g., Redis).

- **Pros**: Well-understood model; trivial server-side revocation; no JWT expiry complexity
- **Cons**: Requires a session store (Redis or DB-backed) — adds infrastructure dependency; constitution prohibits Redis; stateful server complicates horizontal scaling; meaningfully increases deployment complexity
- **Rejected because**: Constitution prohibits Redis and additional infrastructure; stateless JWT with cookie storage achieves the same security properties with less complexity

### Alternative C: In-Memory Token Storage (Frontend, Rejected for Refresh Token)

Store access token in JavaScript memory (module-level variable); refresh token in HTTP-only cookie.

- **Pros**: Access token never touches persistent storage; immune to CSRF; natural for SPAs with token rotation
- **Cons**: Access token lost on page refresh — requires silent refresh on every load; adds complexity to auth context; Phase 1 already chose cookie-only approach
- **Status**: Partially evaluated during Phase 1; current implementation uses cookie for access token to simplify the refresh flow at hackathon level

## References

- Feature Spec: `specs/002-task-crud/spec.md`
- Implementation Plan: `specs/002-task-crud/plan.md`
- Research: `specs/002-task-crud/research.md` — "Authentication Layer (Inherited)" section
- Constitution: `.specify/memory/constitution.md` — Authentication Architecture (Fixed) section
- Implementation: `backend/middleware/auth_middleware.py`, `backend/routes/auth.py`, `frontend/lib/api.ts`
- Related ADRs: None (first ADR in project)
- Evaluator Evidence: `history/prompts/002-task-crud/plan-001-task-crud-implementation-plan.prompt.md`
