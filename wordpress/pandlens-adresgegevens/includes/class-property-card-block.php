<?php
/**
 * Property card Gutenberg block.
 *
 * @package Pandlens\Adresgegevens
 */

declare(strict_types=1);

namespace Pandlens\Adresgegevens;

/**
 * Dynamic block "Woningkaart".
 */
class Property_Card_Block {

	private Frontend_Assets $assets;

	public function __construct( Frontend_Assets $assets ) {
		$this->assets = $assets;
	}

	public function register(): void {
		if ( ! function_exists( 'register_block_type' ) ) {
			return;
		}

		wp_register_script(
			'pandlens-property-card-editor',
			PANDLENS_ADRESGEGEVENS_PLUGIN_URL . 'blocks/property-card/editor.js',
			array( 'wp-blocks', 'wp-element', 'wp-block-editor', 'wp-components' ),
			PANDLENS_ADRESGEGEVENS_VERSION,
			true
		);

		register_block_type(
			PANDLENS_ADRESGEGEVENS_PLUGIN_DIR . 'blocks/property-card',
			array(
				'render_callback' => array( $this, 'render' ),
				'editor_script'   => 'pandlens-property-card-editor',
			)
		);
	}

	/**
	 * @param array<string, mixed> $attributes Block attributes.
	 */
	public function render( array $attributes = array() ): string {
		$lang   = isset( $attributes['lang'] ) && 'en' === $attributes['lang'] ? 'en' : 'nl';
		$accent = isset( $attributes['accentColor'] ) ? sanitize_hex_color( (string) $attributes['accentColor'] ) : '';

		$this->assets->enqueue_property_card(
			array(
				'lang'   => $lang,
				'accent' => $accent ? $accent : '',
				'mode'   => 'property_card',
			)
		);

		ob_start();
		?>
		<div
			class="pl-pc pl-pc--block"
			data-pl-pc-root="1"
			data-pl-pc-lang="<?php echo esc_attr( $lang ); ?>"
			<?php echo $accent ? 'data-pl-pc-accent="' . esc_attr( $accent ) . '"' : ''; ?>
		></div>
		<?php
		return (string) ob_get_clean();
	}
}
