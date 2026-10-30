# Pandlens Zapier integration

Pandlens is a Dutch property intelligence API. This Zapier integration looks up **one address per action** and returns building, energy label, and neighbourhood fields.

## Actions

- **Enrich Address** — `GET /v1/address/{postcode}/{huisnummer}` with optional house letter and suffix.
- **Get Energy Label** — same endpoint with `include=energy`; output is limited to label fields.

## Auth

API key in `X-Api-Key`. Connection test: `GET https://api.pandlens.nl/v1/usage`.

## Tests

```bash
npm ci
npm test
npx zapier validate
```

Uses fixtures in `../fixtures/`; no live API key in CI.

See [../docs/help-en.md](../docs/help-en.md) for customer setup.
