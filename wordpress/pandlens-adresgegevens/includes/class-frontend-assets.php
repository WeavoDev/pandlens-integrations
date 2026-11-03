<?php
/**
 * Front-end scripts and localization.
 *
 * @package Pandlens\Adresgegevens
 */

declare(strict_types=1);

namespace Pandlens\Adresgegevens;

/**
 * Enqueues the shared address lookup script.
 */
class Frontend_Assets {

	private bool $enqueued = false;

	private bool $property_card_enqueued = false;

	/**
	 * @param array<string, mixed> $config Extra config merged into PandlensAdresgegevens.
	 */
	public function enqueue( array $config = array() ): void {
		if ( $this->enqueued ) {
			wp_localize_script(
				'pandlens-adresgegevens',
				'PandlensAdresgegevensExtra',
				$config
			);
			return;
		}

		wp_register_style(
			'pandlens-adresgegevens',
			PANDLENS_ADRESGEGEVENS_PLUGIN_URL . 'assets/css/address-lookup.css',
			array(),
			PANDLENS_ADRESGEGEVENS_VERSION
		);

		wp_register_script(
			'pandlens-adresgegevens',
			PANDLENS_ADRESGEGEVENS_PLUGIN_URL . 'assets/js/address-lookup.js',
			array(),
			PANDLENS_ADRESGEGEVENS_VERSION,
			true
		);

		wp_enqueue_style( 'pandlens-adresgegevens' );
		wp_enqueue_script( 'pandlens-adresgegevens' );

		wp_localize_script(
			'pandlens-adresgegevens',
			'PandlensAdresgegevens',
			array_merge(
				array(
					'restUrl'   => esc_url_raw( rest_url( 'pandlens-adresgegevens/v1/address' ) ),
					'nonce'     => wp_create_nonce( 'wp_rest' ),
					'labels'    => Field_Keys::labels(),
					'messages'  => array(
						'lookup'       => __( 'Look up address', 'pandlens-adresgegevens' ),
						'loading'      => __( 'Looking up address…', 'pandlens-adresgegevens' ),
						'notFound'     => __( 'Address not found. Check postcode and house number.', 'pandlens-adresgegevens' ),
						'ambiguous'    => __( 'Multiple units match. Choose the correct suffix:', 'pandlens-adresgegevens' ),
						'quota'        => __( 'Lookup quota exceeded for this month.', 'pandlens-adresgegevens' ),
						'rateLimit'    => __( 'Too many requests. Please wait and try again.', 'pandlens-adresgegevens' ),
						'unauthorized' => __( 'Address lookup is unavailable. The site administrator must configure a Pandlens API key.', 'pandlens-adresgegevens' ),
						'signup'       => __( 'Get a free API key', 'pandlens-adresgegevens' ),
					),
					'signupUrl' => 'https://pandlens.nl/signup',
				),
				$config
			)
		);

		$this->enqueued = true;
	}

	/**
	 * @param array<string, mixed> $config Extra config merged into PandlensPropertyCard.
	 */
	public function enqueue_property_card( array $config = array() ): void {
		if ( $this->property_card_enqueued ) {
			wp_localize_script(
				'pandlens-property-card',
				'PandlensPropertyCardExtra',
				$config
			);
			return;
		}

		wp_register_style(
			'pandlens-property-card',
			PANDLENS_ADRESGEGEVENS_PLUGIN_URL . 'assets/css/property-card.css',
			array(),
			PANDLENS_ADRESGEGEVENS_VERSION
		);

		wp_register_script(
			'pandlens-property-card',
			PANDLENS_ADRESGEGEVENS_PLUGIN_URL . 'assets/js/property-card.js',
			array(),
			PANDLENS_ADRESGEGEVENS_VERSION,
			true
		);

		wp_enqueue_style( 'pandlens-property-card' );
		wp_enqueue_script( 'pandlens-property-card' );

		wp_localize_script(
			'pandlens-property-card',
			'PandlensPropertyCard',
			array_merge(
				array(
					'restUrl'  => esc_url_raw( rest_url( 'pandlens-adresgegevens/v1/property-card' ) ),
					'nonce'    => wp_create_nonce( 'wp_rest' ),
					'lang'     => determine_locale(),
					'messages' => array(
						'lookup'    => __( 'Look up property', 'pandlens-adresgegevens' ),
						'postcode'  => __( 'Postcode', 'pandlens-adresgegevens' ),
						'house'     => __( 'House number', 'pandlens-adresgegevens' ),
						'suffix'    => __( 'Suffix (optional)', 'pandlens-adresgegevens' ),
						'loading'   => __( 'Looking up property…', 'pandlens-adresgegevens' ),
						'notFound'  => __( 'Address not found. Check postcode and house number.', 'pandlens-adresgegevens' ),
						'ambiguous' => __( 'Multiple units match. Choose the correct suffix:', 'pandlens-adresgegevens' ),
						'quota'     => __( 'Lookup quota exceeded for this month.', 'pandlens-adresgegevens' ),
						'rateLimit' => __( 'Too many requests. Please wait and try again.', 'pandlens-adresgegevens' ),
					),
				),
				$config
			)
		);

		$this->property_card_enqueued = true;
	}
}
