# OpenAI listing - Daan checklist (manual steps)

Check items off when done. **Do not share EP-Online or other third-party keys** in any listing.

## Account and product

- [ ] OpenAI developer / ChatGPT builder account with access to **Actions** or **Apps SDK** (whatever OpenAI names the flow at publish time).
- [ ] Decide: **MCP-first** (Apps SDK) vs legacy **GPT Action** on OpenAPI; this pack supports both.
- [ ] Confirm pricing text matches the current website (excl. VAT: Free 100 per month; Starter EUR 19 / 2 500; Pro EUR 79 / 15 000; PAYG EUR 0.01 per lookup).

## Technical wiring

- [ ] **API base URL:** `https://api.pandlens.com` (or `https://api.pandlens.nl` if the form requires EU explicitly; both are first-party Pandlens API hosts).
- [ ] **Auth:** Custom header `X-Api-Key`. Value is the **customer’s** Pandlens key ([signup EN](https://pandlens.nl/en/signup), [signup NL](https://pandlens.nl/signup)).
- [ ] **OpenAPI:** Import [`openapi-gpt-actions.json`](openapi-gpt-actions.json) (trimmed) **or** paste subset by hand from [live Swagger](https://api.pandlens.nl/swagger/v1/swagger.json); never enable batch, bulk, search, or area endpoints for the Action.
- [ ] **Connection test:** `GET /v1/usage` with a valid key (same header).
- [ ] **MCP path:** `https://api.pandlens.com/mcp` with `X-Api-Key` where the Apps SDK asks for MCP endpoint (see [`../mcp/README.md`](../mcp/README.md)).

## Domain and identity (OpenAI often requires these)

- [ ] **Domain verification** for `pandlens.nl` and/or `pandlens.com` and/or `api.pandlens.com` per OpenAI’s DNS or HTML file instructions (owner access to DNS or hosting).
- [ ] **Brand / identity verification** if the store asks for legal entity or trademark proof for “Pandlens.”
- [ ] **Support channel:** list `info@pandlens.nl` and ensure mail is monitored.

## Legal and policy links

- [ ] Privacy link: `https://pandlens.nl/en/privacy` (and Dutch `https://pandlens.nl/privacy` if the form has NL fields).
- [ ] Terms link: `https://pandlens.nl/en/terms` (verify `/terms` without locale if the product page adds it later).
- [ ] Attribution: `https://pandlens.nl/bronnen` in long description or “more info” if there is room.

## Copy QA

- [ ] First sentence of long description states both differentiators (single-call Dutch pand snapshot; MCP for agents).
- [ ] Copy says **per-address only**; no bulk or search-loop promises.
- [ ] No Weavo, Keycloak, or identity-provider branding in customer-facing text.
- [ ] Icon uses Pandlens / plugin artwork from this repo, not third-party logos.

## After publish

- [ ] Smoke-test one address in ChatGPT end-to-end.
- [ ] Note the public app or Action URL for support and docs.
