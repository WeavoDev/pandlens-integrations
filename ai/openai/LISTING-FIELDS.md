# OpenAI - listing fields (GPT Actions / App store style)

Use English for global submissions unless the form is Dutch-only. Lead every long description with the two differentiators.

## Differentiators (always lead with these)

1. **One consistent answer per Dutch address:** building, label, plot, buurt, milieu, solar, and related facts in a single response per lookup.
2. **MCP server for AI agents:** streamable HTTP at `https://api.pandlens.com/mcp` with header `X-Api-Key`.

## Suggested **name** (max length depends on product; shorten if needed)

`Pandlens`

## **Short description** (one line)

`Dutch property intelligence per postcode and house number: one consistent pand snapshot per address, plus an MCP server for agents.`

## **Long description**

Pandlens gives you everything about a Dutch **pand** (dwelling and building context) for **one** address in **one** call: BAG-style facts, registered energy label, plot, neighbourhood stats, environment noise and similar layers, solar suitability, and optional comparisons across a **small** set of addresses. **No bulk jobs or open-ended search:** each tool call resolves a single postcode plus huisnummer (and optional huisletter or toevoeging).

**MCP for agents:** connect to the hosted Model Context Protocol server over **streamable HTTP** at `https://api.pandlens.com/mcp` and send your Pandlens **API key** in the `X-Api-Key` header (same as REST). Tools are per-address only (for example full property, energy, building, plot, buurt, environment, solar, small compare set).

**REST for ChatGPT Actions:** import the trimmed OpenAPI in this repo or point to the live spec at `https://api.pandlens.nl/swagger/v1/swagger.json` and restrict yourself to the per-address `GET` paths. Use `GET /v1/usage` as the connection test.

**Pricing (excl. VAT):** Free 100 lookups per month; Starter EUR 19 per month (2 500); Pro EUR 79 per month (15 000); PAYG EUR 0.01 per lookup.

**Trust and sources:** Privacy policy and data handling: https://pandlens.nl/en/privacy . Terms: https://pandlens.nl/en/terms . Source attribution: https://pandlens.nl/bronnen . Product docs: https://pandlens.nl/docs .

## **Example prompts**

- “What is the registered energy label, building year, and buurt-average WOZ for postcode 1012JS huisnummer 1?”
- “For 5611 ZX 147: solar suitability, roof-ish context, and neighbourhood income band in one answer.”
- “Compare energy labels and bouwjaar for these three Dutch addresses: …” (only when the product is configured for small `compare_properties` style calls, not bulk search.)
- “Does my Pandlens key still have quota?” (uses `GET /v1/usage`.)

## **Privacy policy URL**

`https://pandlens.nl/en/privacy`  
(Alternative Dutch page: `https://pandlens.nl/privacy`)

## **Terms URL**

`https://pandlens.nl/en/terms`  
(Plain `/terms` on the site may not resolve; use EN terms for global stores.)

## **Support**

`info@pandlens.nl`

## **Icon / logo**

- **From this repo:** WordPress plugin icons (square raster) under  
  `wordpress/pandlens-adresgegevens/assets/wordpress-org/icon-128x128.png` and `icon-256x256.png`.
- **Store requirements:** prepare PNG squares at 512×512 (downscale from 256 if needed) and any smaller sizes the form lists. Keep the house / lens motif; avoid Weavo or identity provider branding in the customer-facing asset.

## **OpenAPI file for Actions**

Attach or paste URL to raw GitHub [`openapi-gpt-actions.json`](openapi-gpt-actions.json) on `main` after merge, or upload the file from your checkout.
