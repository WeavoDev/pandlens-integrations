#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")" && pwd)"
WP="$ROOT/wp-site"
if [[ -f "$ROOT/wp-cli.phar" ]]; then
	WPCLI=( php "$ROOT/wp-cli.phar" )
else
	WPCLI=( wp )
fi

PCP="$WP/wp-content/plugins/plugin-check/cli.php"
if [[ ! -f "$PCP" ]]; then
	echo "Run setup-wp-site.sh first" >&2
	exit 1
fi

"${WPCLI[@]}" --path="$WP" plugin check pandlens-adresgegevens \
	--require="$PCP" \
	--ignore-codes=WordPress.WP.I18n.MissingTranslatorsComment \
	"$@"
