# Claude.ai / Anthropic - MCP connector listing

**Note:** Publishing to the connector or app directory on [https://claude.ai](https://claude.ai) (for example **Directory → Manage**) usually requires a **paid Claude plan** or an enterprise allowlist. Verify the current rule in the Anthropic UI before you spend time on the form.

## What you are submitting

A **remote MCP server** (streamable HTTP), not a local stdio binary:

- **URL:** `https://api.pandlens.com/mcp` (mirror: `https://api.pandlens.nl/mcp`)
- **Authentication:** HTTP header `X-Api-Key`. Each customer uses **their** Pandlens key ([signup EN](https://pandlens.nl/en/signup), [signup NL](https://pandlens.nl/signup))
- **Scope:** Tools are **per-address only** (single pand snapshot, energy, building, plot, buurt, environment, solar, small compare). No bulk or open search.

## Differentiators (open the long description with these)

1. One consistent answer for **everything about a Dutch pand** for **one** address in **one** call.
2. A **hosted MCP server** for AI agents (streamable HTTP).

## Suggested listing fields

**Name:** Pandlens

**Short description:**  
`Dutch pand intelligence per address in one MCP call; streamable HTTP for agents.`

**Long description:**  
Pandlens answers with a single structured snapshot per Dutch postcode and huisnummer: building and dwelling context, registered energy label, plot, neighbourhood statistics, environment layers, solar-related signals, and optional small multi-address compares. The same product exposes a **hosted Model Context Protocol** endpoint over **streamable HTTP** so agents never scrape cadastral portals. Authenticate with your Pandlens **API key** in `X-Api-Key`.

Customers must not use the tools for bulk extraction or nation-wide search; each invocation targets **one** address (plus optional huisletter or toevoeging) or the documented small compare set.

Docs: https://pandlens.nl/docs  
Privacy: https://pandlens.nl/en/privacy  
Terms: https://pandlens.nl/en/terms  
Sources: https://pandlens.nl/bronnen  
Support: info@pandlens.nl

**Category / tags (if asked):** Real estate, Netherlands, MCP, Energy label, BAG

## Submit steps (high level)

1. Sign in to Claude with an account that can **manage connectors** or **directory** entries.
2. Open the **Add connector** or **Manage directory** flow (wording changes; use what matches “remote MCP” or “HTTP”).
3. Enter the MCP base URL `https://api.pandlens.com/mcp` and document that clients must pass `X-Api-Key`.
4. Paste descriptions from [`../LISTINGS.md`](../LISTINGS.md) or above; link privacy and terms.
5. If Anthropic runs a health check without a key, note that **401 without `X-Api-Key` is expected**; reviewers can use a test key from [signup](https://pandlens.nl/en/signup).
6. Save as draft and run a live thread that calls one tool with a known test address.

## After approval

Point users at [`CONFIG-SNIPPETS.md`](CONFIG-SNIPPETS.md) for Claude Desktop; for claude.ai web, follow Anthropic’s UI for “custom MCP” or connector secrets so the key is not pasted in shared chats.
