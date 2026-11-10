# CRM and quoting: Pandlens webhook recipe

Cheap pattern for CRMs, quoting tools, or internal lead forms: **one HTTP request → one address enrichment**. No server-side Pandlens secret in this repo; each customer uses their own API key in the automation platform.

Neighbourhood statistics include data from **Statistics Netherlands (CBS)**, licensed under **CC BY 4.0**.

## API contract (per lookup)

```http
GET https://api.pandlens.nl/v1/address/{postcode}/{huisnummer}
X-Api-Key: <customer key>
```

Optional query: `huisletter`, `toevoeging`.

Postcode: no spaces, uppercase (normalise in your flow).

### Example response (trimmed)

```json
{
  "address": { "straat": "Markt", "woonplaats": "Echt", "postcode": "6101DB", "huisnummer": 19 },
  "bag": { "pand": { "bouwjaar": 1998 }, "verblijfsobject": { "oppervlakteM2": 138 } },
  "energyLabel": { "labelClass": "A", "ep1KwhM2Yr": 74.2 },
  "neighbourhood": { "gemeentenaam": "Echt-Susteren", "gemiddeldeWozWaardeEur": 318000 }
}
```

## n8n template (recommended)

Import:

`n8n/templates/pandlens-crm-webhook-enrich.workflow.json`

Flow:

1. **Webhook** — `POST` with JSON body `{ "postcode": "6101DB", "huisnummer": 19 }` (optional `huisletter`, `toevoeging`).
2. **Pandlens enrich address** — HTTP Request with Header Auth credential (`X-Api-Key`).
3. **Respond to Webhook** — returns the Pandlens JSON to the caller.

Use this as a small “enrich service” behind your CRM’s outbound webhook, or call the webhook from Make/Zapier if the CRM cannot reach Pandlens directly.

Credential setup matches [../docs/help-en.md](../docs/help-en.md) (Header name `X-Api-Key`).

For a manual test without the webhook, use `n8n/templates/pandlens-http-address-lookup.workflow.json`.

## Zapier (no extra code)

If the CRM triggers Zapier:

1. Trigger: new lead / deal / custom webhook from the CRM.
2. Action: **Pandlens → Enrich Address** (private app until published).
3. Map postcode and house number; map output fields into the CRM or quote step.

See [../zapier/README.md](../zapier/README.md) for `zapier push` steps.

## Generic CRM webhook (any tool)

**Outbound from CRM** (pseudo-recipe):

| Step | What to do |
|------|----------------|
| 1 | CRM fires webhook on new quote request with `postcode` + `huisnummer`. |
| 2 | Middleware (n8n, Make, custom worker) normalises postcode and `GET`s Pandlens. |
| 3 | Map `energyLabel.labelClass`, `bag.pand.bouwjaar`, `neighbourhood.gemiddeldeWozWaardeEur` into quote PDF or CRM custom fields. |
| 4 | On `404` / `409`, branch to manual address review (do not retry in a loop). |

**Do not** batch-export energy labels across a whole portfolio in one automation; process one address per webhook event.

## Make (Integromat)

No dedicated Make app in this repo. Use:

- **HTTP module** — same URL and `X-Api-Key` header as above, or
- **Webhook → HTTP** mirroring the n8n template.

## Security

- Store the Pandlens API key only in the automation platform’s secret store (n8n credentials, Zapier connection, etc.).
- Never commit keys or embed them in CRM public forms.
