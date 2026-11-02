<?php
/**
 * Elementor Pro forms integration (basic).
 *
 * @package Pandlens\Adresgegevens
 */

declare(strict_types=1);

namespace Pandlens\Adresgegevens\Integrations;

use Pandlens\Adresgegevens\Frontend_Assets;

/**
 * Enqueues lookup script on pages that use Elementor forms.
 */
final class Elementor_Forms {

	public static function register( Frontend_Assets $assets ): void {
		add_action(
			'elementor/frontend/after_enqueue_scripts',
			static function () use ( $assets ): void {
				if ( ! did_action( 'elementor_pro/init' ) ) {
					return;
				}
				$assets->enqueue(
					array(
						'mode' => 'elementor',
					)
				);
			}
		);
	}
}
