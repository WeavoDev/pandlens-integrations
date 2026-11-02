#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")" && pwd)"
PLUGIN="$ROOT/pandlens-adresgegevens"
DIST="$ROOT/dist"
SLUG="pandlens-adresgegevens"
VERSION="$(grep -m1 'Version:' "$PLUGIN/pandlens-adresgegevens.php" | sed 's/.*Version:[[:space:]]*//')"
ZIP="$DIST/${SLUG}-${VERSION}.zip"

mkdir -p "$DIST"
rm -f "$ZIP"

(
	cd "$PLUGIN"
	zip -r "$ZIP" . \
		-x 'vendor/*' \
		-x 'tests/*' \
		-x 'composer.*' \
		-x 'phpcs.xml.dist' \
		-x 'phpunit.xml.dist' \
		-x '.gitignore' \
		-x '.phpunit.result.cache' \
		-x 'composer.phar' \
		-x '.wp-env.json' \
		-x 'node_modules/*' \
		> /dev/null
)

echo "Built $ZIP"
