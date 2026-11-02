<?php
/**
 * Gutenberg block registration.
 *
 * @package Pandlens\Adresgegevens
 */

declare(strict_types=1);

namespace Pandlens\Adresgegevens;

/**
 * Dynamic block "Adres opzoeken".
 */
class Block {

	private Frontend_Assets $assets;

	public function __construct( Frontend_Assets $assets ) {
		$this->assets = $assets;
	}

	public function register(): void {
		if ( ! function_exists( 'register_block_type' ) ) {
			return;
		}

		wp_register_script(
			'pandlens-adres-opzoeken-editor',
			PANDLENS_ADRESGEGEVENS_PLUGIN_URL . 'blocks/adres-opzoeken/editor.js',
			array( 'wp-blocks', 'wp-element', 'wp-block-editor', 'wp-components' ),
			PANDLENS_ADRESGEGEVENS_VERSION,
			true
		);

		register_block_type(
			PANDLENS_ADRESGEGEVENS_PLUGIN_DIR . 'blocks/adres-opzoeken',
			array(
				'render_callback' => array( $this, 'render' ),
				'editor_script'   => 'pandlens-adres-opzoeken-editor',
			)
		);
	}

	/**
	 * @param array<string, mixed> $attributes Block attributes.
	 */
	public function render( array $attributes = array() ): string {
		$show_results = isset( $attributes['showResults'] ) ? (bool) $attributes['showResults'] : true;
		$shortcode    = new Shortcode( $this->assets );

		return $shortcode->render(
			array(
				'show_results' => $show_results ? 'yes' : 'no',
			)
		);
	}
}
