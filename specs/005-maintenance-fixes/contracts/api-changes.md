# API Contract Changes: Maintenance Fixes

**Feature**: `005-maintenance-fixes` | **Date**: 2026-03-02

---

## New Endpoints

### `GET /api/health`

Health check endpoint for frontend warm-up detection and keep-alive pings.

**Auth**: None required
**Response**: `200 OK`

```json
{ "status": "ok" }
```

**Purpose**: Frontend pings this every 14 minutes to prevent Render free-tier sleep. Also used to distinguish "backend is waking up" from "backend returned an error".

---

## Modified SSE Event Format

### `POST /api/{user_id}/chat` — SSE Error Event

**Existing events** (unchanged): `delta`, `tool_called`, `done`

**Modified event**: `error`

**Before** (generic):
```
event: error
data: {"message": "Internal server error"}
```

**After** (typed):
```
event: error
data: {
  "type": "cold_start" | "rate_limit" | "service_error",
  "message": "<human-readable string>",
  "retry_after": <seconds> | null
}
```

**Error type mapping (backend)**:

| Condition | `type` | `message` | `retry_after` |
|-----------|--------|-----------|---------------|
| MCPServerStdio spawn fails / connection timeout | `cold_start` | "Starting up, please wait a moment and try again." | null |
| Groq API returns 429 | `rate_limit` | "Too many requests — please wait a moment." | 30 |
| All other exceptions | `service_error` | "Something went wrong — please try again." | null |

**Frontend error handling**:

| `type` | User-visible message | Input state |
|--------|---------------------|-------------|
| `cold_start` | Animated "warming up" indicator in chat | Enabled (retry) |
| `rate_limit` | "Too many requests — try again in ~30s" | Enabled (retry) |
| `service_error` | "Something went wrong — please try again." | Enabled (retry) |

---

## Unchanged Endpoints

All other endpoints (`/api/{user_id}/tasks/*`, `/api/auth/*`, `/api/{user_id}/conversations/*`) remain unchanged.
