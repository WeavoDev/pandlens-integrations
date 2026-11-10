# Pandlens integrations

Public MIT repository for thin clients to the [Pandlens](https://pandlens.nl) Dutch property API at `https://api.pandlens.nl`.

Pandlens is a property intelligence API for Dutch addresses. Each action looks up **one** postcode and house number and returns building facts, a registered energy label, and neighbourhood statistics. Neighbourhood data includes **Statistics Netherlands (CBS)** material under **CC BY 4.0** (credit in each integration README).

## Contents

| Path | Purpose |
|------|---------|
| [`zapier/`](zapier/) | Zapier Platform CLI app (API key auth, connection test on `/v1/usage`, **Enrich Address** and **Get Energy Label** actions) |
| [`google-sheets/`](google-sheets/) | Apps Script add-on: `=PANDLENS(postcode, huisnummer, field)` with per-user API key and document cache |
| [`crm/`](crm/) | CRM/quoting webhook recipe + notes for Zapier/n8n/Make (one address per event) |
| [`n8n/`](n8n/) | Community node package **`n8n-nodes-pandlens`** plus HTTP Request and CRM webhook workflow templates |
| [`wordpress/pandlens-adresgegevens/`](wordpress/pandlens-adresgegevens/) | WordPress plugin (GPL-2.0-or-later) for form address autofill and property card block |
| [`widget/`](widget/) | Embeddable property card (`<pandlens-card>`, publishable widget key) |
| [`ai/`](ai/) | AI marketplace listing packs (MCP, OpenAI, Claude): copy, `server.json`, trimmed OpenAPI for GPT Actions |
| [`docs/`](docs/) | End-user help ([English](docs/help-en.md)), [widget key API spec](docs/widget-key-spec.md) |
| [`fixtures/`](fixtures/) | Recorded JSON responses for CI (no live API key in tests) |

No batch endpoints, triggers, or bulk export actions are exposed in the Zapier/n8n packages.

## WordPress: Pandlens Adresgegevens

GPL-2.0-or-later plugin that autofills Dutch address and building fields in Gravity Forms, Contact Form 7, and other forms via the Pandlens API.

See the plugin [`readme.txt`](wordpress/pandlens-adresgegevens/readme.txt) for installation and WordPress.org submission notes.

## API key

Customers can self-serve a free key at [pandlens.nl/en/signup](https://pandlens.nl/en/signup). Authenticate every request with header `X-Api-Key`.

## Development

```bash
# Shared fixture tests
node --test shared/test/*.test.js

# Google Sheets field-path smoke tests (Apps Script sources in google-sheets/)
node --test shared/test/resolve-field.test.js shared/test/normalize-address.test.js

# Zapier
cd zapier && npm ci && npm test && npx zapier validate

# n8n
cd n8n && npm ci && npm run lint && npm run build && npm test && npm run scan

# WordPress plugin
cd wordpress/pandlens-adresgegevens && composer install && vendor/bin/phpcs && vendor/bin/phpunit

# Embed widget
cd widget && npm ci && npm run build && npm test && npm run size-check
```

CI runs on [Woodpecker](https://ci.daan.gg) (`.woodpecker.yml`): PHP quality and plugin ZIP for WordPress, Node lint/tests for Zapier, n8n, shared fixtures, and the embed widget (including a 30 KiB gzip size gate).

## Publishing (manual)

- **Zapier:** see [zapier/README.md](zapier/README.md) (`zapier login`, `zapier push`, test Zaps, marketplace review). Not automated from this repo.
- **Google Sheets:** install via [clasp](https://github.com/google/clasp) or copy Apps Script files ([google-sheets/README.md](google-sheets/README.md)). Not published to the Google Workspace Marketplace from this repo.
- **CRM webhook:** import `n8n/templates/pandlens-crm-webhook-enrich.workflow.json` or follow [crm/README.md](crm/README.md). No marketplace submission.
- **n8n:** run the **Publish n8n community package** GitHub Actions workflow manually after tagging, or publish locally with `npm publish --provenance` from `n8n/` → submit for verification in the n8n Creator Portal.

## Licence

MIT for Zapier/n8n/shared code — see [LICENSE](LICENSE). WordPress plugin is GPL-2.0-or-later.
