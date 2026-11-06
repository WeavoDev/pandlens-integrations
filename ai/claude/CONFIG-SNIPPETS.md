# Claude Desktop and Claude.ai - MCP configuration snippets

Replace `YOUR_PANDLENS_API_KEY` with a key from [pandlens.nl/en/signup](https://pandlens.nl/en/signup). Never commit real keys.

## Claude Desktop (`claude_desktop_config.json`)

Exact keys depend on your Anthropic Desktop build. Common patterns:

**Pattern A - remote URL plus headers (when supported):**

```json
{
  "mcpServers": {
    "pandlens": {
      "url": "https://api.pandlens.com/mcp",
      "transport": "streamable-http",
      "headers": {
        "X-Api-Key": "YOUR_PANDLENS_API_KEY"
      }
    }
  }
}
```

**Pattern B - env-based secret (if the client expands env in MCP config):**

```json
{
  "mcpServers": {
    "pandlens": {
      "url": "https://api.pandlens.com/mcp",
      "headers": {
        "X-Api-Key": "${PANDLENS_API_KEY}"
      }
    }
  }
}
```

Set `PANDLENS_API_KEY` in your shell profile or OS secret store as documented by Anthropic.

If your build only documents **stdio** servers, use the official **remote MCP** instructions from Anthropic’s help center for your version, and map the URL and header fields to the values above.

## Claude on the web (claude.ai)

When the product UI offers “custom MCP” or **connector**:

1. **Endpoint:** `https://api.pandlens.com/mcp`
2. **Header name:** `X-Api-Key`
3. **Header value:** your Pandlens key (treat as a secret; prefer workspace-level secrets if available)

## Verify connectivity

After connection, run a single tool against a known address (postcode plus huisnummer). Expect one structured JSON payload per call. If you see `401`, the key header is missing or invalid. If you see `402`, quota is exhausted (see pricing on [pandlens.nl/docs](https://pandlens.nl/docs)).
