<?php
/**
 * Plugin Name:       Pandlens Adresgegevens
 * Plugin URI:        https://pandlens.nl/docs
 * Description:       Autofill Dutch address and building data in forms using the Pandlens API (postcode + house number).
 * Version:           1.0.0
 * Requires at least: 6.0
 * Requires PHP:      7.4
 * Author:            Pandlens
 * Author URI:        https://pandlens.nl
 * License:           GPL-2.0-or-later
 * License URI:       https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain:       pandlens-adresgegevens
 * Domain Path:       /languages
 *
 * @package Pandlens\Adresgegevens
 */

declare(strict_types=1);

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

define( 'PANDLENS_ADRESGEGEVENS_VERSION', '1.0.0' );
define( 'PANDLENS_ADRESGEGEVENS_PLUGIN_FILE', __FILE__ );
define( 'PANDLENS_ADRESGEGEVENS_PLUGIN_DIR', plugin_dir_path( __FILE__ ) );
define( 'PANDLENS_ADRESGEGEVENS_PLUGIN_URL', plugin_dir_url( __FILE__ ) );

require_once PANDLENS_ADRESGEGEVENS_PLUGIN_DIR . 'includes/loader.php';

require_once PANDLENS_ADRESGEGEVENS_PLUGIN_DIR . 'includes/class-plugin.php';

/**
 * Returns the plugin singleton.
 *
 * @return \Pandlens\Adresgegevens\Plugin
 */
function pandlens_adresgegevens(): \Pandlens\Adresgegevens\Plugin {
	return \Pandlens\Adresgegevens\Plugin::instance();
}

pandlens_adresgegevens()->init();

register_activation_hook(
	__FILE__,
	static function (): void {
		\Pandlens\Adresgegevens\Rate_Limiter::seed_defaults();
	}
);
