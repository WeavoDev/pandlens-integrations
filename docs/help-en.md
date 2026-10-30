# Pandlens help (English)

## Get an API key

1. Open [https://pandlens.nl/en/signup](https://pandlens.nl/en/signup).
2. Enter your work email, company name, and use case, accept the terms, and complete the bot check.
3. Copy the API key when it is shown. It is only displayed once.
4. The free plan includes 100 address lookups per month.

Manage keys and billing in the [Pandlens portal](https://pandlens.nl/portal).

## Connect in Zapier

1. Create a Zap and search for **Pandlens** (private invite link until the integration is public).
2. Choose **Enrich Address** or **Get Energy Label**.
3. Paste your API key. Zapier tests the connection with `GET /v1/usage` and shows your plan name.
4. Map postcode and house number from the previous step. Each Zap run performs **one** address lookup.

## Connect in n8n

### Community node (recommended after install)

1. Install `n8n-nodes-pandlens` on your instance (Community Nodes → Install).
2. Add credentials **Pandlens API** with your key.
3. Add the **Pandlens** node, pick **Enrich Address** or **Get Energy Label**, and fill postcode and house number.

### HTTP Request template (no node install)

Import `n8n/templates/pandlens-http-address-lookup.workflow.json`.

Create an **Header Auth** credential:

- Header name: `X-Api-Key`
- Header value: your Pandlens API key

Replace the sample postcode and house number in the **Sample address** node, or feed rows from a spreadsheet (one row = one lookup).

## Limits and errors

| HTTP status | Meaning | What to do |
|-------------|---------|------------|
| 401 | Invalid or missing API key | Check the key in the portal |
| 402 | Monthly lookup quota used | Upgrade or wait for the next month |
| 429 | Too many requests per minute | Slow down parallel runs |

There is **no batch action** in these integrations. Loop over rows in your workflow if you need many addresses; each iteration is one billable lookup.

## Data returned

**Enrich Address** returns flat fields for the postal address, building size and construction year, registered energy label, and neighbourhood averages (including typical home valuation trends).

**Get Energy Label** returns only label class, validity dates, building type, and primary energy figures for the same address.

Descriptions refer to property facts only; they do not name upstream registers.
