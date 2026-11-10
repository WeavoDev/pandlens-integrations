# n8n-nodes-pandlens

Community [n8n](https://n8n.io) node for the Pandlens property API.

## Operations

| Operation | Description |
|-----------|-------------|
| Enrich Address | Flat JSON for address, building, energy label, and neighbourhood |
| Get Energy Label | Label fields only (`include=energy`) |

Each input item triggers **one** API lookup. There is no batch operation.

## Credentials

**Pandlens API** — password field for your `X-Api-Key`. Free keys: [pandlens.nl/en/signup](https://pandlens.nl/en/signup).

## Install (self-hosted)

Settings → Community nodes → Install `n8n-nodes-pandlens`.

## HTTP fallback

Import [`templates/pandlens-http-address-lookup.workflow.json`](templates/pandlens-http-address-lookup.workflow.json) if you prefer the built-in HTTP Request node.

For CRM quoting, import [`templates/pandlens-crm-webhook-enrich.workflow.json`](templates/pandlens-crm-webhook-enrich.workflow.json) (see [`../crm/README.md`](../crm/README.md)).

Neighbourhood fields use **Statistics Netherlands (CBS)** data under **CC BY 4.0**.

## Development

```bash
npm ci
npm run lint
npm run build
npm test
npx @n8n/scan-community-package
```

## Licence

MIT
