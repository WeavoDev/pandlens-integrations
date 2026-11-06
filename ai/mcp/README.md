# MCP directory listing pack (Pandlens)

Files here support listing the **hosted** Pandlens MCP server (`streamable-http` at `https://api.pandlens.com/mcp`). Users authenticate with **their** `X-Api-Key` header.

## Files

| File | Purpose |
|------|---------|
| [`server.json`](server.json) | Official MCP Registry shape (`mcp-publisher`). Remote-only server metadata. |
| [`server-card.json`](server-card.json) | MCP Server Card draft (discovery / directories). |
| [`glama.json.example`](glama.json.example) | Copy to **repository root** as `glama.json`, replace maintainer GitHub username, then claim on Glama. |
| [`smithery-notes.md`](smithery-notes.md) | Facts and links for [Smithery](https://smithery.ai/new). |
| [`WEAVODEV-PANDLENS-NOTE.md`](WEAVODEV-PANDLENS-NOTE.md) | Exact API routes for the main Pandlens repo if the card must be served live. |

## 1. Official MCP Registry (`mcp-publisher`)

1. Install the CLI from current [registry docs](https://github.com/modelcontextprotocol/registry) (`mcp-publisher`).
2. Log in and complete **namespace** verification for `nl.pandlens` (domain ownership for `pandlens.nl` or as documented for your publisher account).
3. From the directory that contains [`server.json`](server.json), run `mcp-publisher validate` then `mcp-publisher publish`.
4. If validation fails on `description` length, keep it at or below **100 characters** (registry rule).

`server.json` uses `remotes[0].url` = `https://api.pandlens.com/mcp` and documents the required `X-Api-Key` header.

## 2. Smithery

Follow [`smithery-notes.md`](smithery-notes.md). Use the two differentiators and the Server Card JSON. After [`WEAVODEV-PANDLENS-NOTE.md`](WEAVODEV-PANDLENS-NOTE.md) is implemented, cite `https://api.pandlens.com/mcp/server-card` if the form asks for a card URL.

## 3. Glama (Add MCP Server + GitHub)

1. Open Glama’s **Add MCP Server** flow and submit this repo: `https://github.com/WeavoDev/pandlens-integrations`
2. Copy [`glama.json.example`](glama.json.example) to the **repository root** as `glama.json`, set `maintainers` to Daan’s GitHub username, commit on `main`.
3. Complete Glama **claim** / ownership per their docs (org repos need `glama.json`).
4. Set display name and short description from [`../LISTINGS.md`](../LISTINGS.md). Mention remote URL and `X-Api-Key` in listing notes if there is a free-text field.

Glama indexes public GitHub repos; the MCP endpoint itself is remote on `api.pandlens.com`.

## Support

- Email: [info@pandlens.nl](mailto:info@pandlens.nl)
- Documentation: [pandlens.nl/docs](https://pandlens.nl/docs)
