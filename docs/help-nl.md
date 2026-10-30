# Pandlens hulp (Nederlands)

## API-sleutel aanmaken

1. Ga naar [https://pandlens.nl/signup](https://pandlens.nl/signup).
2. Vul werk-e-mail, bedrijfsnaam en use case in, accepteer de voorwaarden en rond de bot-check af.
3. Kopieer de API-sleutel direct; deze wordt maar één keer getoond.
4. Gratis: 100 adreslookups per maand.

Sleutels en facturatie: [Pandlens portal](https://pandlens.nl/portal).

## Zapier

1. Maak een Zap en kies **Pandlens**.
2. Actie **Enrich Address** of **Get Energy Label**.
3. Plak je API-sleutel. De verbindingstest gebruikt `GET /v1/usage`.
4. Koppel postcode en huisnummer. **Eén Zap-run = één lookup.**

## n8n

Installeer het community package `n8n-nodes-pandlens`, voeg **Pandlens API** credentials toe, en gebruik de **Pandlens** node.

Zonder extra node: importeer `n8n/templates/pandlens-http-address-lookup.workflow.json` en gebruik Header Auth met `X-Api-Key`.

## Limieten

- **401** — ongeldige sleutel  
- **402** — maandquota op  
- **429** — te veel requests per minuut  

Geen batch-actie in deze integraties; elke rij in een loop telt als aparte lookup.

Zie [help-en.md](./help-en.md) voor de volledige Engelse documentatie (vereist voor Zapier/n8n review).
