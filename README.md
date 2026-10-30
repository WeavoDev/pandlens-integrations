# Pandlens integrations (Zapier + n8n)

Public MIT repository for thin clients to the [Pandlens](https://pandlens.nl) Dutch property API at `https://api.pandlens.nl`.

Pandlens is a property intelligence API for Dutch addresses. Each action looks up **one** postcode and house number and returns building facts, a registered energy label, and neighbourhood statistics.

## Contents

| Path | Purpose |
|------|---------|
| [`zapier/`](zapier/) | Zapier Platform CLI app (API key auth, connection test on `/v1/usage`, **Enrich Address** and **Get Energy Label** actions) |
| [`n8n/`](n8n/) | Community node package **`n8n-nodes-pandlens`** plus an HTTP Request workflow template |
| [`docs/`](docs/) | End-user help ([English](docs/help-en.md), [Dutch summary](docs/help-nl.md)) |
| [`fixtures/`](fixtures/) | Recorded JSON responses for CI (no live API key in tests) |

No batch endpoints, triggers, or bulk export actions are exposed here.

## API key

Customers can self-serve a free key at [pandlens.nl/en/signup](https://pandlens.nl/en/signup). Authenticate every request with header `X-Api-Key`.

## Development

```bash
# Shared fixture tests
node --test shared/test/*.test.js

# Zapier
cd zapier && npm install && npm test && npx zapier validate

# n8n
cd n8n && npm install && npm run lint && npm run build && npm test && npm run scan
```

CI runs on [Woodpecker](https://ci.daan.gg) (`.woodpecker.yml`). The only GitHub Actions workflow publishes the n8n package to npm with provenance when a tag is pushed (requires `NPM_TOKEN`).

## Publishing (manual)

- **Zapier:** `cd zapier && zapier push` from the developer account on info@pandlens.nl after review prep (test Zaps, `zapier validate`).
- **n8n:** tag release → GitHub Actions `npm publish --provenance` → submit for verification in the n8n Creator Portal.

## Licence

MIT — see [LICENSE](LICENSE).
