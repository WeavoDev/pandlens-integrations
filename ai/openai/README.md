# OpenAI (GPT Actions and Apps SDK) listing pack

Use this pack when wiring ChatGPT **Actions** (OpenAPI) or documenting the preferred **MCP** path for the ChatGPT Apps SDK.

## Files

| File | Purpose |
|------|---------|
| [`openapi-gpt-actions.json`](openapi-gpt-actions.json) | OpenAPI 3.x subset: per-address `GET` paths plus `GET /v1/usage`. Auth: `X-Api-Key`. |
| [`LISTING-FIELDS.md`](LISTING-FIELDS.md) | Paste-ready name, descriptions, example prompts, support, icon hints. |
| [`CHECKLIST.md`](CHECKLIST.md) | Items that need Daan (domain verification, identity checks, and so on). |

## OpenAPI source

- **Canonical live spec:** [https://api.pandlens.nl/swagger/v1/swagger.json](https://api.pandlens.nl/swagger/v1/swagger.json)
- **This repo (trimmed):** [`openapi-gpt-actions.json`](openapi-gpt-actions.json)  
  Excludes batch, bulk, search, and area endpoints. Operation text that referenced batch APIs was removed so ChatGPT does not advertise unsupported paths.

**Base URL for GPT Actions:** `https://api.pandlens.com` (already set under `servers` in the JSON).

**Authentication in ChatGPT:** set a custom header `X-Api-Key` (each end user or workspace uses **their** Pandlens key). Connection test: `GET /v1/usage`.

## Regenerating the trimmed spec

If the upstream Swagger changes:

```bash
curl -sS "https://api.pandlens.nl/swagger/v1/swagger.json" -o /tmp/pandlens-swagger.json
# Re-run the same subset logic as described in ../README.md (paths listed in openapi-gpt-actions info),
# or edit openapi-gpt-actions.json carefully to stay per-address only.
```

## MCP (preferred for Apps SDK)

ChatGPT’s Apps SDK line prefers MCP. Point integrators at:

- MCP URL: `https://api.pandlens.com/mcp`
- Header: `X-Api-Key`

Publish metadata using [`../mcp/`](../mcp/) and the shared copy in [`../LISTINGS.md`](../LISTINGS.md).

## Links

- Privacy: [pandlens.nl/privacy](https://pandlens.nl/privacy) (EN: [pandlens.nl/en/privacy](https://pandlens.nl/en/privacy))
- Terms: [pandlens.nl/en/terms](https://pandlens.nl/en/terms)
- Sources: [pandlens.nl/bronnen](https://pandlens.nl/bronnen)
- Docs: [pandlens.nl/docs](https://pandlens.nl/docs)
- Signup: [pandlens.nl/en/signup](https://pandlens.nl/en/signup) (NL: [pandlens.nl/signup](https://pandlens.nl/signup))
