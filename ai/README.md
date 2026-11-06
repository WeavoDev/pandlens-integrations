# AI marketplace listing packs (Pandlens)

Ready-to-paste copy and machine-readable metadata for listing the Pandlens hosted MCP server and REST API on model directories and chat platforms. **Nothing here is submitted automatically**; Daan runs through each pack when publishing.

| Directory | Contents |
|-----------|----------|
| [`mcp/`](mcp/) | Official MCP Registry `server.json`, Glama helper file, Smithery and server-card notes |
| [`openai/`](openai/) | Trimmed OpenAPI for GPT Actions, listing field text, Daan checklist |
| [`claude/`](claude/) | Anthropic directory copy and Desktop or Claude.ai config snippets |
| [`LISTINGS.md`](LISTINGS.md) | Shared English (primary) and optional Dutch blurbs for every marketplace |

**Live endpoints**

- MCP (streamable HTTP): `https://api.pandlens.com/mcp` (also `https://api.pandlens.nl/mcp`). Auth: header `X-Api-Key` (the customer’s Pandlens key).
- OpenAPI source of truth: `https://api.pandlens.nl/swagger/v1/swagger.json`
- Docs: [pandlens.nl/docs](https://pandlens.nl/docs)

Per-address only in these packs: no bulk, batch, or search loop tools or paths.
