<?php
/**
 * Non-Composer class loader for production ZIP builds.
 *
 * @package Pandlens\Adresgegevens
 */

declare(strict_types=1);

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Loads plugin classes when Composer autoload is not shipped.
 */
function pandlens_adresgegevens_load_classes(): void {
	$pandlens_adresgegevens_files = array(
		'includes/class-field-keys.php',
		'includes/class-user-messages.php',
		'includes/class-settings.php',
		'includes/class-api-exception.php',
		'includes/class-address-normalizer.php',
		'includes/class-address-cache.php',
		'includes/class-address-mapper.php',
		'includes/class-rate-limiter.php',
		'includes/class-api-client.php',
		'includes/class-rest-controller.php',
		'includes/class-frontend-assets.php',
		'includes/class-shortcode.php',
		'includes/class-block.php',
		'includes/class-admin-settings-page.php',
		'includes/class-plugin.php',
		'includes/integrations/class-contact-form-7.php',
		'includes/integrations/class-elementor-forms.php',
		'includes/integrations/class-gravity-forms.php',
		'includes/integrations/class-wpforms.php',
	);

	foreach ( $pandlens_adresgegevens_files as $pandlens_adresgegevens_file ) {
		require_once PANDLENS_ADRESGEGEVENS_PLUGIN_DIR . $pandlens_adresgegevens_file;
	}
}

pandlens_adresgegevens_load_classes();
