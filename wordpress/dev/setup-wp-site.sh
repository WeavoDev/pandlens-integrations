#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")" && pwd)"
WP="$ROOT/wp-site"
PLUGIN_SRC="$ROOT/../pandlens-adresgegevens"
URL="http://127.0.0.1:8080"

if ! command -v php >/dev/null 2>&1; then
	echo "php is required" >&2
	exit 1
fi

mkdir -p "$WP/wp-content/plugins" "$WP/wp-content/mu-plugins" "$WP/wp-content/database"

if [[ ! -f "$WP/wp-load.php" ]]; then
	echo "Downloading WordPress core…"
	curl -fsSL "https://wordpress.org/latest.zip" -o /tmp/wordpress.zip
	rm -rf /tmp/wordpress-extract
	unzip -q /tmp/wordpress.zip -d /tmp/wordpress-extract
	rm -rf "$WP"
	mv /tmp/wordpress-extract/wordpress "$WP"
fi

if [[ ! -d "$WP/wp-content/plugins/pandlens-adresgegevens" ]]; then
	ln -sfn "$PLUGIN_SRC" "$WP/wp-content/plugins/pandlens-adresgegevens"
fi

if [[ ! -d "$WP/wp-content/plugins/contact-form-7" ]]; then
	curl -fsSL "https://downloads.wordpress.org/plugin/contact-form-7.latest-stable.zip" -o /tmp/cf7.zip
	unzip -q /tmp/cf7.zip -d "$WP/wp-content/plugins"
fi

if [[ ! -d "$WP/wp-content/plugins/plugin-check" ]]; then
	curl -fsSL "https://github.com/WordPress/plugin-check/archive/refs/heads/trunk.zip" -o /tmp/plugin-check.zip
	unzip -q /tmp/plugin-check.zip -d /tmp
	rm -rf "$WP/wp-content/plugins/plugin-check"
	mv /tmp/plugin-check-trunk "$WP/wp-content/plugins/plugin-check"
	( cd "$WP/wp-content/plugins/plugin-check" && composer install --no-dev --no-interaction 2>/dev/null || true )
fi

if [[ ! -f "$WP/wp-content/db.php" ]]; then
	curl -fsSL "https://downloads.wordpress.org/plugin/sqlite-database-integration.latest-stable.zip" -o /tmp/sqlite.zip
	unzip -q -o /tmp/sqlite.zip -d "$WP/wp-content/plugins"
	cp "$WP/wp-content/plugins/sqlite-database-integration/db.copy" "$WP/wp-content/db.php"
fi

cp -f "$ROOT/mu-plugins/pandlens-api-mock.php" "$WP/wp-content/mu-plugins/pandlens-api-mock.php"

if [[ ! -f "$WP/wp-config.php" ]]; then
	cp "$WP/wp-config-sample.php" "$WP/wp-config.php"
	sed -i "s/database_name_here/pandlens_dev/" "$WP/wp-config.php"
	sed -i "s/username_here/root/" "$WP/wp-config.php"
	sed -i "s/password_here/root/" "$WP/wp-config.php"
	SECRET="$(openssl rand -base64 48 | tr -dc 'a-zA-Z0-9' | head -c 64)"
	sed -i "s/put your unique phrase here/${SECRET}/g" "$WP/wp-config.php"
	cat >> "$WP/wp-config.php" <<'PHP'

define( 'WP_DEBUG', true );
define( 'WP_DEBUG_LOG', true );
define( 'WP_ENVIRONMENT_TYPE', 'local' );
PHP
fi

if ! command -v wp >/dev/null 2>&1; then
	curl -fsSL "https://raw.githubusercontent.com/wp-cli/builds/gh-pages/phar/wp-cli.phar" -o "$ROOT/wp-cli.phar"
	chmod +x "$ROOT/wp-cli.phar"
	WPCLI=( php "$ROOT/wp-cli.phar" )
else
	WPCLI=( wp )
fi

export WP_CLI_CACHE_DIR="$ROOT/.wp-cli-cache"
"${WPCLI[@]}" --path="$WP" core is-installed >/dev/null 2>&1 || \
	"${WPCLI[@]}" --path="$WP" core install \
		--url="$URL" \
		--title="Pandlens Dev" \
		--admin_user=admin \
		--admin_password=admin \
		--admin_email=admin@example.com \
		--skip-email

"${WPCLI[@]}" --path="$WP" plugin activate sqlite-database-integration contact-form-7 pandlens-adresgegevens plugin-check 2>/dev/null || \
	"${WPCLI[@]}" --path="$WP" plugin activate contact-form-7 pandlens-adresgegevens plugin-check

"${WPCLI[@]}" --path="$WP" option update pandlens_adresgegevens_settings '{"api_key":"test-key-valid","proxy_rate_limit":30,"cf7_postcode_field":"postcode","cf7_huisnummer_field":"huisnummer","cf7_huisletter_field":"huisletter","cf7_toevoeging_field":"toevoeging"}' --format=json

# Pages for screenshots / smoke tests.
"${WPCLI[@]}" --path="$WP" post list --post_type=page --name=adres-test --format=ids 2>/dev/null | grep -q . || \
	"${WPCLI[@]}" --path="$WP" post create --post_type=page --post_title='Adres test' --post_name=adres-test --post_status=publish \
		--post_content='<!-- wp:shortcode -->[pandlens_adres_opzoeken]<!-- /wp:shortcode -->'

echo "WordPress ready at $URL (user: admin / admin)"
