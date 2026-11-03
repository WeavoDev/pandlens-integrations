=== Pandlens Adresgegevens ===
Contributors: pandlens
Tags: address, postcode, netherlands, forms, autofill
Requires at least: 6.0
Tested up to: 7.1
Requires PHP: 7.4
Stable tag: 1.1.0
License: GPLv2 or later
License URI: https://www.gnu.org/licenses/gpl-2.0.html

Autofill Dutch address and building data in WordPress forms using the Pandlens API.

== Description ==

**Pandlens Adresgegevens** helps installers (heat pumps, solar, insulation), estate agents, and other businesses pre-fill quote forms when visitors enter a Dutch postcode and house number.

Features:

* Server-side Pandlens API proxy (API key never exposed to the browser)
* REST lookup with WordPress nonce, per-visitor rate limiting, and 24-hour transient cache per address
* Maps street, city, municipality, province, build year, floor area, use, energy label class, and neighbourhood name
* Gravity Forms add-on with per-form field mapping
* Contact Form 7 support with configurable field names
* Optional WPForms and Elementor Pro form hooks
* Shortcode `[pandlens_adres_opzoeken]` and block **Adres opzoeken** (form autofill)
* Shortcode `[pandlens_property_card]` and block **Pandlens woningkaart** (property card with optional form prefill via `prefill_map` JSON)
* Handles not found, ambiguous addresses (pick a suffix), quota, rate limits, and invalid API keys

One lookup per request. No bulk import or list enrichment. The plugin does not store personal data beyond what your form already collects.

== Installation ==

1. Upload the `pandlens-adresgegevens` folder to `/wp-content/plugins/` or install from a ZIP.
2. Activate the plugin through the **Plugins** menu.
3. Open **Settings → Pandlens Adresgegevens** and paste your Pandlens API key.
4. Click **Test Pandlens connection** to verify plan and remaining lookups.
5. Configure your form plugin (Gravity Forms form settings or CF7 field names) or add the block/shortcode to a page.

Get a free API key at [pandlens.nl/signup](https://pandlens.nl/signup).

== Frequently Asked Questions ==

= Does the API key appear in the page source? =

No. All Pandlens requests run on your server. Visitors only call your WordPress REST endpoint with a nonce.

= Which fields are filled? =

Street, city (woonplaats), municipality, province, build year, floor area (m²), use (gebruiksdoel), energy label class, and neighbourhood name (buurt).

= What if multiple units share the same house number? =

The API returns `address_ambiguous` with candidates. The UI lets the visitor pick the correct suffix before filling the form.

= Does this plugin bulk-enrich spreadsheets? =

No. It supports one address lookup at a time from a form or the lookup block.

== Screenshots ==

1. Settings page with API key and connection test
2. Contact Form 7 field mapping and autofill on a form
3. Address lookup block on the front end
4. Ambiguous address candidate picker

== External services ==

This plugin connects to the **Pandlens API** to retrieve Dutch address and building data.

* Service: Pandlens API (`https://api.pandlens.nl`)
* Data sent: postcode, house number, and optional suffix fields you submit in a form lookup
* When: each time a visitor (or editor test) triggers an address lookup, and when an administrator runs the connection test
* Terms: [https://pandlens.nl/terms](https://pandlens.nl/terms)
* Privacy: [https://pandlens.nl/privacy](https://pandlens.nl/privacy)

== Changelog ==

= 1.1.0 =
* Property card shortcode and Gutenberg block with server-side card JSON and optional selector-based form prefill.
* REST route `POST /wp-json/pandlens-adresgegevens/v1/property-card`.

= 1.0.0 =
* Initial release.
