# Pandlens embed widget

Vanilla JavaScript property card for estate agent and installer websites. One script tag plus `<pandlens-card>` (or script `data-*` attributes).

## Quick start (mock demo)

```html
<script src="https://your-cdn/pandlens-widget.min.js" defer></script>
<pandlens-card
  data-key="pk_live_…"
  data-lang="nl"
  data-accent="#0b5fff"
></pandlens-card>
```

Until the API ships publishable widget keys, use `data-mock="1"` and load `mock-data.js` from this repo (see `demo/index.html`).

## API

Browser calls `GET /v1/widget/address/{postcode}/{huisnummer}` with header `X-Widget-Key`. See [`docs/widget-key-spec.md`](../docs/widget-key-spec.md).

## Build

```bash
cd widget
npm ci
npm run build
npm test
npm run size-check   # fails if gzip > 30 KiB
```

Output: `dist/pandlens-widget.min.js`.

## Attributes

| Attribute | Description |
|-----------|-------------|
| `data-key` | Publishable widget key (`pk_live_…`) |
| `data-lang` | `nl` or `en` |
| `data-accent` | CSS colour for buttons and label highlight |
| `data-api-base` | API origin (default `https://api.pandlens.nl`) |
| `data-mock` | `1` = use `window.__PANDLENS_WIDGET_MOCK__` instead of network |

Script tag alternative: `data-pandlens-key`, `data-target="#mount"`.

## Licence

MIT (same as parent repo). Open data credit: CC BY 4.0 line in the widget footer.
