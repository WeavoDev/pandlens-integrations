<?php
/**
 * Contact Form 7 integration.
 *
 * @package Pandlens\Adresgegevens
 */

declare(strict_types=1);

namespace Pandlens\Adresgegevens\Integrations;

use Pandlens\Adresgegevens\Frontend_Assets;
use Pandlens\Adresgegevens\Field_Keys;

/**
 * Adds data attributes to CF7 forms and enqueues the lookup script.
 */
final class Contact_Form_7 {

	public static function register( Frontend_Assets $assets ): void {
		add_action(
			'wpcf7_enqueue_scripts',
			static function () use ( $assets ): void {
				if ( ! function_exists( 'wpcf7_get_current_contact_form' ) ) {
					return;
				}

				$form = wpcf7_get_current_contact_form();
				if ( ! $form ) {
					return;
				}

				$settings = pandlens_adresgegevens()->settings()->all();
				$assets->enqueue(
					array(
						'mode'     => 'cf7',
						'inputs'   => array(
							'postcode'   => (string) $settings['cf7_postcode_field'],
							'huisnummer' => (string) $settings['cf7_huisnummer_field'],
							'huisletter' => (string) $settings['cf7_huisletter_field'],
							'toevoeging' => (string) $settings['cf7_toevoeging_field'],
						),
						'fieldMap' => self::default_output_map(),
					)
				);
			}
		);

		add_filter(
			'wpcf7_form_elements',
			static function ( string $html ): string {
				if ( false === strpos( $html, 'wpcf7-form' ) ) {
					return $html;
				}

				return str_replace(
					'<form ',
					'<form data-pl-ag-cf7="1" ',
					$html
				);
			}
		);
	}

	/**
	 * Default CF7 field names for mapped outputs (filterable).
	 *
	 * @return array<string, string>
	 */
	public static function default_output_map(): array {
		$defaults = array(
			Field_Keys::STREET             => 'straat',
			Field_Keys::WOONPLAATS         => 'woonplaats',
			Field_Keys::GEMEENTE           => 'gemeente',
			Field_Keys::PROVINCIE          => 'provincie',
			Field_Keys::BUILD_YEAR         => 'bouwjaar',
			Field_Keys::FLOOR_AREA         => 'oppervlakte',
			Field_Keys::USE                => 'gebruiksdoel',
			Field_Keys::ENERGY_LABEL_CLASS => 'energielabel',
			Field_Keys::BUURT              => 'buurt',
		);

		/**
		 * Filter CF7 output field name mapping.
		 *
		 * @param array<string, string> $defaults Machine key => CF7 field name.
		 */
		return apply_filters( 'pandlens_adresgegevens_cf7_field_map', $defaults );
	}
}
