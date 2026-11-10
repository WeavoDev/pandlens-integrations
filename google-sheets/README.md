# Pandlens Google Sheets custom function

Spreadsheet formula add-on (Google Apps Script) for **one address per cell**: building data, energy label, and neighbourhood fields from the [Pandlens API](https://pandlens.nl).

Neighbourhood statistics include data from **Statistics Netherlands (CBS)**, licensed under **CC BY 4.0**.

## Formula

| Locale | Example |
|--------|---------|
| Dutch (`;`) | `=PANDLENS("6101DB"; 19; "energyLabel_labelClass")` |
| US (`,`) | `=PANDLENS("6101DB", 19, "energyLabel_labelClass")` |

Optional 4th and 5th arguments: house letter and suffix (`toevoeging`).

### Common field names

Use the same underscore paths as the Zapier integration (see `fixtures/address-enrichment-flat.sample.json`), for example:

- `address_straat`, `address_woonplaats`
- `bag_pand_bouwjaar`, `bag_verblijfsobject_oppervlakteM2`
- `energyLabel_labelClass`, `energyLabel_ep1KwhM2Yr`
- `neighbourhood_gemiddeldeWozWaardeEur`, `neighbourhood_gemeentenaam`

Copying a formula down a column is normal Sheets behaviour: each row still performs **one** lookup per distinct address (responses are cached in the document cache for six hours).

There is **no** bulk-export mode beyond per-cell formulas.

## API key

Your key is stored in **User properties** (per Google account), not in the spreadsheet file.

1. Install the script (below).
2. Open the spreadsheet → **Pandlens** menu → **Set API key…**
3. Paste a key from [pandlens.nl/en/signup](https://pandlens.nl/en/signup).

## Install (not published to Google Workspace Marketplace)

### Option A — clasp (recommended)

1. Install [clasp](https://github.com/google/clasp): `npm install -g @google/clasp`
2. `clasp login` (Google account with access to the target Sheet).
3. `cd google-sheets`
4. `clasp create --type sheets --title "Pandlens"` *or* copy `.clasp.json.example` to `.clasp.json` and set `scriptId` from an existing Apps Script project bound to a spreadsheet.
5. `clasp push`
6. In the spreadsheet: **Extensions → Apps Script → Run** `onOpen` once (authorise), then reload the sheet.

### Option B — manual copy

1. In the spreadsheet: **Extensions → Apps Script**.
2. Add script files matching this folder: `Config.gs`, `PandlensClient.gs`, `PANDLENS.gs`, and `appsscript.json` settings (timezone `Europe/Amsterdam`, runtime V8).
3. Save and reload the spreadsheet.

## Rate limits and caching

- Full JSON for an address is cached in **CacheService** (document scope) for 6 hours, so multiple `=PANDLENS(...)` cells with the same address share one API call.
- A short minimum interval between live API calls reduces accidental rate-limit bursts when many *new* addresses are entered at once.
- On HTTP 429, the cell shows `#PANDLENS! Pandlens rate limit exceeded...`

## Tests (local)

Field paths and URL building are covered in the parent repo:

```bash
node --test shared/test/resolve-field.test.js shared/test/normalize-address.test.js
```

No live API key is required for these tests.
