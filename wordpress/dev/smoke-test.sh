#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")" && pwd)"
WP="$ROOT/wp-site"
BASE="http://127.0.0.1:8080"

if [[ -f "$ROOT/wp-cli.phar" ]]; then
	WPCLI=( php "$ROOT/wp-cli.phar" )
else
	WPCLI=( wp )
fi

fail() { echo "FAIL: $1" >&2; exit 1; }
pass() { echo "OK: $1"; }

"${WPCLI[@]}" --path="$WP" option update pandlens_adresgegevens_settings '{"api_key":"test-key-valid","proxy_rate_limit":30,"cf7_postcode_field":"postcode","cf7_huisnummer_field":"huisnummer","cf7_huisletter_field":"huisletter","cf7_toevoeging_field":"toevoeging"}' --format=json >/dev/null

rest_post() {
	local payload="$1"
	"${WPCLI[@]}" --path="$WP" eval "
		\$request = new WP_REST_Request( 'POST', '/pandlens-adresgegevens/v1/address' );
		\$request->set_header( 'X-WP-Nonce', wp_create_nonce( 'wp_rest' ) );
		\$body = json_decode( '$payload', true );
		foreach ( \$body as \$key => \$value ) {
			\$request->set_param( \$key, \$value );
		}
		\$response = rest_do_request( \$request );
		echo wp_json_encode( array(
			'status' => \$response->get_status(),
			'data'   => \$response->get_data(),
			'error'  => \$response->is_error() ? \$response->as_error()->get_error_code() : '',
		) );
	"
}

BODY="$(rest_post '{"postcode":"1012AB","huisnummer":"42"}')"
echo "$BODY" | grep -q '"success":true' || fail "lookup 1012AB 42 ($BODY)"
echo "$BODY" | grep -q 'Damrak' || fail "street mapped"
pass "REST lookup success"

BODY="$(rest_post '{"postcode":"1234AB","huisnummer":"1"}')"
echo "$BODY" | grep -q 'address_ambiguous\|pandlens_address_ambiguous' || fail "ambiguous ($BODY)"
pass "ambiguous error"

"${WPCLI[@]}" --path="$WP" option update pandlens_adresgegevens_settings '{"api_key":"invalid-key"}' --format=json >/dev/null
"${WPCLI[@]}" --path="$WP" transient delete --all >/dev/null 2>&1 || true
BODY="$(rest_post '{"postcode":"9999ZZ","huisnummer":"9"}')"
echo "$BODY" | grep -qi 'unauthorized\|Invalid Pandlens\|pandlens_unauthorized' || fail "401 handling ($BODY)"
pass "401 invalid key"

"${WPCLI[@]}" --path="$WP" option update pandlens_adresgegevens_settings '{"api_key":"test-key-valid"}' --format=json >/dev/null

USAGE="$("${WPCLI[@]}" --path="$WP" eval "
	\$client = pandlens_adresgegevens()->api_client();
	try {
		\$usage = \$client->get_usage();
		echo ( \$usage['plan'] ?? '' ) . '|' . ( \$usage['remainingThisMonth'] ?? '' );
	} catch ( Exception \$e ) {
		echo 'error';
	}
")"
echo "$USAGE" | grep -q 'Developer' || fail "connection usage test ($USAGE)"
pass "usage endpoint / connection test data"

PAGE="$(curl -fsS "$BASE/adres-test/")"
echo "$PAGE" | grep -q 'test-key-valid' && fail "API key leaked in HTML"
echo "$PAGE" | grep -q 'X-Api-Key' && fail "api header leaked"
pass "front-end markup has no API key"

JS="$(curl -fsS "$BASE/wp-content/plugins/pandlens-adresgegevens/assets/js/address-lookup.js")"
echo "$JS" | grep -q 'test-key-valid' && fail "API key in JS file"
pass "JS bundle clean"

pass "smoke tests complete"
