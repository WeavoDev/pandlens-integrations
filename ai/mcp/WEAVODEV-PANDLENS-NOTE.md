# Pandlens main repo (WeavoDev/pandlens): optional Server Card hosting

The MCP Server Card draft in this integrations repo lives at [`server-card.json`](server-card.json). Directories and clients may expect the document on the **same host as the MCP endpoint**, not only in Git.

## Recommended (MCP extension)

Serve the card next to the streamable HTTP URL (reserved suffix):

- `GET https://api.pandlens.com/mcp/server-card`  
- Same for `api.pandlens.nl` if both hosts stay in use.

Body: JSON from [`server-card.json`](server-card.json) (or merge with your deployment pipeline).  
`Content-Type`: `application/mcp-server-card+json` (or `application/json` if the former is awkward in your stack; align with whatever Smithery or the MCP card docs expect at publish time).

## Optional well-known path

Some tooling probes `/.well-known/mcp/server-card` (or `server-card.json`). The MCP discovery notes treat this as **optional**; the slash form under `/mcp/server-card` is the predictable default when the MCP base path is `/mcp`.

If you still want the well-known URL:

- `GET https://api.pandlens.com/.well-known/mcp/server-card` → same JSON as above.

Implementation sketch (any gateway: nginx, Cloudflare Worker, or API app):

1. Map both paths to a static JSON handler or a small route that returns the file.
2. Ensure **no** conflict with the streamable HTTP `GET` on `/mcp` itself (card must be on `/mcp/server-card` or another distinct path).
3. Optionally add `Cache-Control: public, max-age=3600`.

## Exact change list (for pandlens backend or edge config)

1. Add route **`/mcp/server-card`** on `api.pandlens.com` (and mirror on `api.pandlens.nl` if required) returning the Server Card JSON.
2. Optionally add **`/.well-known/mcp/server-card`** as an alias to the same JSON.
3. Do not log or echo `X-Api-Key` on these static routes.

No EP-Online or third-party secrets belong in this JSON.
