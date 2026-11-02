<?php
/**
 * Shortcode renderer.
 *
 * @package Pandlens\Adresgegevens
 */

declare(strict_types=1);

namespace Pandlens\Adresgegevens;

/**
 * [pandlens_adres_opzoeken] shortcode.
 */
class Shortcode {

	private Frontend_Assets $assets;

	public function __construct( Frontend_Assets $assets ) {
		$this->assets = $assets;
	}

	public function register(): void {
		add_shortcode( 'pandlens_adres_opzoeken', array( $this, 'render' ) );
	}

	/**
	 * @param array<string, string>|string $atts Shortcode attributes.
	 */
	public function render( $atts = array() ): string {
		$atts = shortcode_atts(
			array(
				'show_results' => 'yes',
			),
			$atts,
			'pandlens_adres_opzoeken'
		);

		$this->assets->enqueue(
			array(
				'mode' => 'shortcode',
			)
		);

		ob_start();
		?>
		<div class="pl-ag pl-ag--shortcode" data-pl-ag-root="1" data-pl-ag-show-results="<?php echo esc_attr( $atts['show_results'] ); ?>">
			<p class="pl-ag__title"><?php echo esc_html__( 'Adres opzoeken', 'pandlens-adresgegevens' ); ?></p>
			<div class="pl-ag__inputs">
				<label>
					<span><?php echo esc_html__( 'Postcode', 'pandlens-adresgegevens' ); ?></span>
					<input type="text" name="pl_ag_postcode" autocomplete="postal-code" class="pl-ag__postcode" />
				</label>
				<label>
					<span><?php echo esc_html__( 'House number', 'pandlens-adresgegevens' ); ?></span>
					<input type="text" name="pl_ag_huisnummer" inputmode="numeric" class="pl-ag__huisnummer" />
				</label>
				<label>
					<span><?php echo esc_html__( 'Suffix (optional)', 'pandlens-adresgegevens' ); ?></span>
					<input type="text" name="pl_ag_huisletter" maxlength="1" class="pl-ag__huisletter" />
				</label>
				<label>
					<span><?php echo esc_html__( 'Addition (optional)', 'pandlens-adresgegevens' ); ?></span>
					<input type="text" name="pl_ag_toevoeging" class="pl-ag__toevoeging" />
				</label>
			</div>
			<button type="button" class="pl-ag__submit button"><?php echo esc_html__( 'Look up address', 'pandlens-adresgegevens' ); ?></button>
			<div class="pl-ag__message" role="status" aria-live="polite"></div>
			<div class="pl-ag__candidates" hidden></div>
			<div class="pl-ag__results" hidden></div>
		</div>
		<?php
		return (string) ob_get_clean();
	}
}
