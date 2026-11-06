# Shared marketplace copy - Pandlens

**English primary.** Use these blocks everywhere a title, description, or examples are needed. Keep **per-address only** language; no bulk or search loops.

**Pricing (excl. VAT):** Free 100 per month; Starter EUR 19 / 2 500; Pro EUR 79 / 15 000; PAYG EUR 0.01 per lookup.

**URLs:** Privacy [EN](https://pandlens.nl/en/privacy) / [NL](https://pandlens.nl/privacy). Terms [EN](https://pandlens.nl/en/terms). Sources [bronnen](https://pandlens.nl/bronnen). Docs [pandlens.nl/docs](https://pandlens.nl/docs). Signup [EN](https://pandlens.nl/en/signup) / [NL](https://pandlens.nl/signup). Support **info@pandlens.nl**.

---

## Differentiators (always lead with both)

1. **Single-call Dutch pand snapshot:** everything about one address in one consistent structured answer (building context, energy label, plot, buurt, environment, solar, and related signals as exposed by Pandlens).
2. **Hosted MCP for agents:** Model Context Protocol over streamable HTTP at `https://api.pandlens.com/mcp` with header `X-Api-Key`.

---

## Name

`Pandlens`

## One-line tagline

`Dutch pand intelligence per address: one answer per lookup, MCP for AI agents.`

## Short description (2–3 sentences)

Pandlens returns a full Dutch property snapshot for a single postcode and huisnummer: building and dwelling facts, registered energy label, plot, neighbourhood statistics, environment and noise context, solar-related signals, and optional small multi-address compares. Connect AI agents through the hosted MCP endpoint (`https://api.pandlens.com/mcp`, header `X-Api-Key`) or use the REST API with the same key. Tools are per-address only: no bulk exports or open-ended search.

## Long description (directory / store)

Pandlens is built for **one address at a time**: you pass a Dutch postcode, house number, and optional huisletter or toevoeging, and you get **one** consolidated JSON answer that lines up building data, the registered energy label where available, cadastral plot context, buurt-level statistics, environmental layers, and solar suitability style signals, without scraping third-party sites yourself.

**For AI agents**, Pandlens exposes a **Model Context Protocol** server over **streamable HTTP** at `https://api.pandlens.com/mcp`. Users authenticate with their Pandlens **API key** in the `X-Api-Key` header (identical to REST). Tooling is intentionally scoped to **per-address** operations and a **small** compare set. There are no bulk jobs, nationwide search loops, or “download everything” tools.

**For ChatGPT Actions**, use the trimmed OpenAPI in this repository or select only per-address `GET` paths from the live [Swagger document](https://api.pandlens.nl/swagger/v1/swagger.json); use `GET /v1/usage` as the health check.

Pricing excludes Dutch VAT: free tier 100 lookups per month; paid tiers and PAYG as published on the website. Attribution for underlying registers: see [pandlens.nl/bronnen](https://pandlens.nl/bronnen).

## Example prompts

- “Give me the energy label, bouwjaar, and buurt name for 1012 JS house number 1.”
- “For postcode 5611 ZX huisnummer 147 with toevoeging A, return solar and environment context in one JSON response.”
- “What does my Pandlens usage look like this month?” (calls `/v1/usage`.)
- “Compare labels for these three specific addresses: …” (only within the product’s small compare limits.)

## MCP connector (any directory)

- **Transport:** streamable HTTP  
- **URL:** `https://api.pandlens.com/mcp`  
- **Auth:** HTTP header `X-Api-Key: <customer key>`

## REST / GPT Actions

- **Base URL:** `https://api.pandlens.com`  
- **Auth:** header `X-Api-Key`  
- **Spec:** `https://api.pandlens.nl/swagger/v1/swagger.json` (use trimmed subset for Actions; see `ai/openai/openapi-gpt-actions.json`)

## Optional Dutch blurb (kort)

`Pandlens geeft per Nederlands adres één consistent antwoord over o.a. pand, energielabel, kadaster, buurt en omgeving, en een MCP-server voor agents op https://api.pandlens.com/mcp met je eigen X-Api-Key. Geen bulk of landelijke zoek-runs.`
