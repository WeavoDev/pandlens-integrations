<?php
/**
 * Property card shortcode.
 *
 * @package Pandlens\Adresgegevens
 */

declare(strict_types=1);

namespace Pandlens\Adresgegevens;

/**
 * [pandlens_property_card] shortcode.
 */
class Property_Card_Shortcode {

	private Frontend_Assets $assets;

	public function __construct( Frontend_Assets $assets ) {
		$this->assets = $assets;
	}

	public function register(): void {
		add_shortcode( 'pandlens_property_card', array( $this, 'render' ) );
	}

	/**
	 * @param array<string, string>|string $atts Shortcode attributes.
	 */
	public function render( $atts = array() ): string {
		$atts = shortcode_atts(
			array(
				'lang'        => '',
				'accent'      => '',
				'prefill_map' => '',
			),
			$atts,
			'pandlens_property_card'
		);

		$lang = '' !== $atts['lang'] ? sanitize_key( $atts['lang'] ) : get_locale();
		if ( 0 === strpos( $lang, 'en' ) ) {
			$lang = 'en';
		} else {
			$lang = 'nl';
		}

		$accent_color = sanitize_hex_color( $atts['accent'] );
		if ( ! is_string( $accent_color ) ) {
			$accent_color = '';
		}

		$this->assets->enqueue_property_card(
			array(
				'lang'       => $lang,
				'accent'     => $accent_color,
				'prefillMap' => $this->parse_prefill_map( $atts['prefill_map'] ),
				'mode'       => 'property_card',
			)
		);

		$prefill_attr = '';
		if ( '' !== $atts['prefill_map'] ) {
			$prefill_attr = ' data-pl-prefill-map="' . esc_attr( wp_json_encode( $this->parse_prefill_map( $atts['prefill_map'] ) ) ) . '"';
		}

		ob_start();
		?>
		<div
			class="pl-pc pl-pc--shortcode"
			data-pl-pc-root="1"
			data-pl-pc-lang="<?php echo esc_attr( $lang ); ?>"
			<?php echo $accent_color ? 'data-pl-pc-accent="' . esc_attr( $accent_color ) . '"' : ''; ?>
			<?php echo $prefill_attr; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- esc_attr on json encode above. ?>
		></div>
		<?php
		return (string) ob_get_clean();
	}

	/**
	 * @return array<string, string>
	 */
	private function parse_prefill_map( string $raw ): array {
		if ( '' === trim( $raw ) ) {
			return array();
		}

		$decoded = json_decode( $raw, true );
		if ( ! is_array( $decoded ) ) {
			return array();
		}

		$out = array();
		foreach ( $decoded as $key => $selector ) {
			if ( ! is_string( $key ) || ! is_string( $selector ) ) {
				continue;
			}
			$out[ sanitize_key( $key ) ] = sanitize_text_field( $selector );
		}

		return $out;
	}
}
