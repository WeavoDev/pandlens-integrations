<?php
/**
 * WPForms integration (basic).
 *
 * @package Pandlens\Adresgegevens
 */

declare(strict_types=1);

namespace Pandlens\Adresgegevens\Integrations;

use Pandlens\Adresgegevens\Frontend_Assets;

/**
 * Enables lookup when forms include data-pl-ag-wpforms attribute on inputs.
 */
final class Wpforms {

	public static function register( Frontend_Assets $assets ): void {
		add_action(
			'wpforms_frontend_js',
			static function () use ( $assets ): void {
				if ( ! function_exists( 'wpforms' ) ) {
					return;
				}
				$assets->enqueue(
					array(
						'mode' => 'wpforms',
					)
				);
			}
		);
	}
}
