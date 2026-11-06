# Smithery (smithery.ai) - notes for Pandlens MCP

Use [Smithery “new server”](https://smithery.ai/new) when you are ready to submit. This file is **not** a substitute for Smithery’s current form fields; it collects facts so Daan can paste quickly.

## What you are listing

- **Transport:** Streamable HTTP (remote), not stdio.
- **URL:** `https://api.pandlens.com/mcp`
- **Auth:** Custom header `X-Api-Key`. Each user brings their own Pandlens API key (free signup: English [pandlens.nl/en/signup](https://pandlens.nl/en/signup), Dutch [pandlens.nl/signup](https://pandlens.nl/signup)).
- **Scope:** Per-address tools only (for example `get_property`, energy, building, plot, neighbourhood, environment, solar, compare across a small fixed set of properties). No bulk or search loops.

## Server Card JSON

Copy from [`server-card.json`](server-card.json). If Smithery asks for a hosted card URL, prefer (once implemented on the API host):

- `https://api.pandlens.com/mcp/server-card`

See [`WEAVODEV-PANDLENS-NOTE.md`](WEAVODEV-PANDLENS-NOTE.md) for the exact routes to add on the main Pandlens API if the card is not served yet.

## Differentiators (use in any “description” field)

1. Everything about a Dutch **pand** for **one** address in a **single**, consistent answer per call.
2. First-class **MCP server** for AI agents (streamable HTTP).

## Links

- Privacy: [pandlens.nl/privacy](https://pandlens.nl/privacy) and [pandlens.nl/en/privacy](https://pandlens.nl/en/privacy)
- Terms (English): [pandlens.nl/en/terms](https://pandlens.nl/en/terms). Dutch `/terms` may 404; use EN for global listings if needed
- Sources / attribution: [pandlens.nl/bronnen](https://pandlens.nl/bronnen)
- Docs: [pandlens.nl/docs](https://pandlens.nl/docs)

## Pricing (excl. VAT)

Free 100 lookups per month; Starter EUR 19 per month (2 500 lookups); Pro EUR 79 per month (15 000); PAYG EUR 0.01 per lookup.
