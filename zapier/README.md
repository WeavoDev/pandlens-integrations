# Pandlens Zapier integration

Pandlens is a Dutch property intelligence API. This Zapier Platform CLI app looks up **one address per action** and returns building, energy label, and neighbourhood fields.

Neighbourhood statistics include data from **Statistics Netherlands (CBS)**, licensed under **CC BY 4.0**.

## Actions

| Action | API |
|--------|-----|
| **Enrich Address** | `GET /v1/address/{postcode}/{huisnummer}` |
| **Get Energy Label** | Same path with `include=energy` (energy fields only) |

Optional inputs: house letter, house number suffix (`toevoeging`).

## Auth

API key in header `X-Api-Key`. Connection test: `GET https://api.pandlens.nl/v1/usage`.

Customers create a key at [pandlens.nl/en/signup](https://pandlens.nl/en/signup). Never embed keys in this repository.

## Development and tests

```bash
cd zapier
npm ci
npm test
npm run lint
npx zapier validate
```

Tests use `../fixtures/` and **nock** (no live API key in CI).

## Push to Zapier (manual — Daan)

Do **not** run these steps from CI. Publishing is manual and may incur Zapier developer charges depending on your Zapier plan.

1. **Zapier developer account**  
   Sign in at [developer.zapier.com](https://developer.zapier.com/) with the Pandlens integration owner (e.g. `info@pandlens.nl`).

2. **CLI login** (once per machine)  
   ```bash
   npm install -g zapier-platform-cli@17.7.0
   cd zapier
   npm ci
   zapier login
   ```

3. **Register the app** (first time only)  
   ```bash
   zapier register "Pandlens"
   ```  
   This creates `.zapierapprc` locally (gitignored). Keep it on trusted machines only.

4. **Validate and push**  
   ```bash
   npx zapier validate
   zapier push
   ```  
   `zapier push` uploads the private integration version tied to your developer account.

5. **Smoke-test in the Zapier UI**  
   - Create a Zap with **Pandlens → Enrich Address**.  
   - Paste a real API key; confirm the connection test passes.  
   - Run with a known postcode and house number (e.g. `6101DB` / `19`).  
   - Repeat for **Get Energy Label** if you ship both actions.

6. **Invite testers / go public** (when ready)  
   - In the Zapier developer UI: share the app with beta users or start marketplace review.  
   - Prepare listing text (include the CBS CC BY 4.0 credit above).  
   - This repo does not submit to the Zapier marketplace automatically.

7. **Ongoing releases**  
   Bump `version` in `package.json`, run tests + `zapier validate`, then `zapier push` again.

See also [../docs/help-en.md](../docs/help-en.md) for customer-facing connection steps.
