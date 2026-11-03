# Publishable widget keys (API specification)

This document specifies browser-safe **widget keys** for the embeddable Pandlens property card. Implement in [WeavoDev/pandlens](https://github.com/WeavoDev/pandlens) (API). The `widget/` package in this repository is built and tested against this contract using a mock when the live endpoint is unavailable.

## Goals

- Allow estate agents and installers to embed a property lookup on their own domains **without** exposing a secret `X-Api-Key` in HTML or JavaScript.
- Restrict usage to declared origins, rate-limit per key, and **meter lookups against the same account quota** as server-side API keys.

## Key format

| Prefix | Use |
|--------|-----|
| `pk_live_` | Production widget keys |
| `pk_test_` | Sandbox keys (optional separate quota) |

Widget keys are **not** secret in the browser (like Stripe publishable keys). Security comes from origin allowlists, scoped permissions, and rate limits—not from hiding the string.

Secret keys (`sk_` or existing account API keys) must **never** be accepted on widget routes.

## Authentication

Widget requests use header:

```http
X-Widget-Key: pk_live_xxxxxxxx
```

Browsers also send `Origin` (and often `Referer`). The API must validate the request origin against the key configuration **before** performing a lookup.

CORS:

- `Access-Control-Allow-Origin` must echo a **single** allowed origin that matches the key (never `*` when credentials or widget keys are used).
- Allow methods: `GET`, `OPTIONS`.
- Allow headers: `X-Widget-Key`, `Content-Type`, `Accept`.
- Preflight `OPTIONS` must return `204` without charging quota.

## Endpoint

```http
GET /v1/widget/address/{postcode}/{huisnummer}
GET /v1/widget/address/{postcode}/{huisnummer}?huisletter=A&toevoeging=2
```

- Path parameters: Dutch postcode (no space, case-insensitive), numeric house number.
- Query: optional `huisletter`, `toevoeging` (same semantics as `GET /v1/address/...`).

### Success `200`

Response body: **same JSON shape** as `GET /v1/address/{postcode}/{huisnummer}` today (address enrichment payload).

Response headers (recommended):

```http
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 59
X-RateLimit-Reset: 1730649600
Cache-Control: private, max-age=0
```

### Errors

Same error JSON as existing address routes where applicable:

| HTTP | `error` / code | Meaning |
|------|----------------|---------|
| 400 | `validation_error` | Invalid postcode or house number |
| 401 | `invalid_widget_key` | Missing or unknown widget key |
| 403 | `origin_not_allowed` | `Origin` not on key allowlist |
| 404 | `address_not_found` | No property |
| 409 | `address_ambiguous` | Multiple units; body includes `candidates` |
| 402 | `monthly_quota_exceeded` | Account quota exhausted |
| 429 | `rate_limit_exceeded` | Per-key or per-IP limit |

## Portal configuration (per widget key)

Stored on the account in the Pandlens portal:

| Field | Description |
|-------|-------------|
| `allowedOrigins` | List of origins, e.g. `https://www.example.nl`, `https://makelaar.example.nl`. No path. Subdomains must be listed explicitly unless a documented wildcard policy is added later. |
| `rateLimitPerMinute` | Integer, default e.g. `60` per key (in addition to account-wide limits). |
| `enabled` | Boolean; disabled keys return `401`. |
| `label` | Human name for the site (“Main website widget”). |

Validation rules:

- Reject origins without `https:` in production keys (except `http://localhost:*` for `pk_test_` keys).
- Maximum origins per key (e.g. 20) to prevent abuse.

## Metering and billing

- Each successful `200` widget lookup counts as **one billable address lookup** on the owning account (same counter as `GET /v1/address/...` with `X-Api-Key`).
- Failed lookups (`404`, `409`, `400`) should not consume quota unless product policy says otherwise; align with existing API behaviour.
- `402` when monthly plan quota is exhausted.
- Usage breakdown in `GET /v1/usage` should expose optional fields:

```json
{
  "plan": { "name": "Free", "monthlyLookupLimit": 100 },
  "usage": {
    "lookupsThisMonth": 12,
    "lookupsRemaining": 88,
    "widgetLookupsThisMonth": 4
  }
}
```

(`widgetLookupsThisMonth` is optional but recommended for transparency.)

## Key lifecycle

- Create / rotate / revoke widget keys in the portal (no “show once” requirement; keys are publishable).
- Rotating a key: old key returns `401` immediately after revocation.
- Audit log: origin rejections and quota events per key (operator-facing).

## Mock for integrators

Until the API ships, local demos and CI use `data-mock="1"` on `<pandlens-card>` or `?mock=1` in the widget demo, which serves fixture JSON from this repo instead of calling the network.

When the API is live, set `data-api-base="https://api.pandlens.nl"` (default) and a real `pk_test_` key.

## Implementation checklist (pandlens API)

1. Database table linking `pk_*` tokens to account id, allowlist, rate limit, enabled flag.
2. Middleware: resolve widget key → account → check `Origin` → rate limit → delegate to existing address enrichment handler.
3. CORS middleware keyed off allowlist.
4. Portal UI to manage widget keys.
5. Extend usage metrics and invoices to include widget lookups.
