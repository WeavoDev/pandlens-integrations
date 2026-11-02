<?php
/**
 * Gravity Forms add-on.
 *
 * @package Pandlens\Adresgegevens
 */

declare(strict_types=1);

namespace Pandlens\Adresgegevens\Integrations;

use Pandlens\Adresgegevens\Field_Keys;
use Pandlens\Adresgegevens\Frontend_Assets;

/**
 * Registers the GFAddOn when Gravity Forms is present.
 */
final class Gravity_Forms_Addon {

	public static function register( Frontend_Assets $assets ): void {
		add_action(
			'gform_loaded',
			static function () use ( $assets ): void {
				if ( ! method_exists( 'GFForms', 'include_addon_framework' ) ) {
					return;
				}

				\GFForms::include_addon_framework();
				require_once PANDLENS_ADRESGEGEVENS_PLUGIN_DIR . 'includes/integrations/class-gravity-forms-addon-impl.php';
				\GFAddOn::register( 'Pandlens\Adresgegevens\Integrations\Gravity_Forms_Addon_Impl' );
			},
			5
		);

		add_action(
			'gform_enqueue_scripts',
			static function ( $form, $is_ajax ) use ( $assets ) {
				unset( $is_ajax );
				if ( ! self::form_has_mapping( (array) $form ) ) {
					return;
				}
				$settings = self::get_form_settings( (array) $form );
				$assets->enqueue(
					array(
						'mode'         => 'gravityforms',
						'formId'       => (int) $form['id'],
						'fieldMap'     => self::get_form_mapping( (array) $form ),
						'inputs'       => isset( $settings['inputs'] ) && is_array( $settings['inputs'] ) ? $settings['inputs'] : array(),
						'triggerField' => self::get_trigger_field_id( (array) $form ),
					)
				);
			},
			10,
			2
		);
	}

	/**
	 * @param array<string, mixed> $form
	 */
	private static function form_has_mapping( array $form ): bool {
		$settings = self::get_form_settings( $form );
		return ! empty( $settings['enabled'] ) && ! empty( $settings['field_map'] );
	}

	/**
	 * @param array<string, mixed> $form
	 * @return array<string, int|string>
	 */
	public static function get_form_mapping( array $form ): array {
		$settings = self::get_form_settings( $form );
		$map      = isset( $settings['field_map'] ) && is_array( $settings['field_map'] ) ? $settings['field_map'] : array();
		$output   = array();
		foreach ( Field_Keys::all() as $key ) {
			if ( isset( $map[ $key ] ) && '' !== (string) $map[ $key ] ) {
				$output[ $key ] = (int) $map[ $key ];
			}
		}

		return $output;
	}

	/**
	 * @param array<string, mixed> $form
	 */
	public static function get_trigger_field_id( array $form ): int {
		$settings = self::get_form_settings( $form );
		return isset( $settings['trigger_field'] ) ? (int) $settings['trigger_field'] : 0;
	}

	/**
	 * @param array<string, mixed> $form
	 * @return array<string, mixed>
	 */
	private static function get_form_settings( array $form ): array {
		if ( ! class_exists( 'Pandlens\Adresgegevens\Integrations\Gravity_Forms_Addon_Impl' ) ) {
			return array();
		}

		$addon = \Pandlens\Adresgegevens\Integrations\Gravity_Forms_Addon_Impl::get_instance();
		if ( ! $addon ) {
			return array();
		}

		$settings = $addon->get_form_settings( $form );

		return is_array( $settings ) ? $settings : array();
	}
}
