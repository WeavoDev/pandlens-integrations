<?php
/**
 * Gravity Forms add-on implementation.
 *
 * @package Pandlens\Adresgegevens
 */

declare(strict_types=1);

namespace Pandlens\Adresgegevens\Integrations;

use Pandlens\Adresgegevens\Field_Keys;
use GFAddOn;

/**
 * Per-form field mapping UI in Gravity Forms settings.
 */
class Gravity_Forms_Addon_Impl extends GFAddOn {

	protected $_version                  = PANDLENS_ADRESGEGEVENS_VERSION;
	protected $_min_gravityforms_version = '2.5';
	protected $_slug                     = 'pandlens-adresgegevens';
	protected $_path                     = 'pandlens-adresgegevens/pandlens-adresgegevens.php';
	protected $_full_path                = PANDLENS_ADRESGEGEVENS_PLUGIN_FILE;
	protected $_title                    = 'Pandlens Adresgegevens';
	protected $_short_title              = 'Pandlens';

	private static ?Gravity_Forms_Addon_Impl $instance = null;

	public static function get_instance(): ?Gravity_Forms_Addon_Impl {
		if ( null === self::$instance ) {
			self::$instance = new self();
		}

		return self::$instance;
	}

	/**
	 * @return array<int, array<string, mixed>>
	 */
	public function form_settings_fields( $form ): array {
		$fields = array();
		foreach ( $form['fields'] as $field ) {
			if ( ! isset( $field->id ) ) {
				continue;
			}
			$fields[] = array(
				'label' => sprintf( '#%d %s', (int) $field->id, (string) $field->label ),
				'value' => (string) $field->id,
			);
		}

		$map_fields = array();
		foreach ( Field_Keys::labels() as $key => $label ) {
			$map_fields[] = array(
				'label'   => $label,
				'type'    => 'select',
				'name'    => 'field_map_' . $key,
				'choices' => array_merge(
					array(
						array(
							'label' => __( '— Select field —', 'pandlens-adresgegevens' ),
							'value' => '',
						),
					),
					$fields
				),
			);
		}

		$input_fields = array(
			array(
				'label'   => esc_html__( 'Postcode field', 'pandlens-adresgegevens' ),
				'type'    => 'select',
				'name'    => 'input_postcode',
				'choices' => array_merge(
					array(
						array(
							'label' => '—',
							'value' => '',
						),
					),
					$fields
				),
			),
			array(
				'label'   => esc_html__( 'House number field', 'pandlens-adresgegevens' ),
				'type'    => 'select',
				'name'    => 'input_huisnummer',
				'choices' => array_merge(
					array(
						array(
							'label' => '—',
							'value' => '',
						),
					),
					$fields
				),
			),
			array(
				'label'   => esc_html__( 'House letter field (optional)', 'pandlens-adresgegevens' ),
				'type'    => 'select',
				'name'    => 'input_huisletter',
				'choices' => array_merge(
					array(
						array(
							'label' => '—',
							'value' => '',
						),
					),
					$fields
				),
			),
			array(
				'label'   => esc_html__( 'Addition field (optional)', 'pandlens-adresgegevens' ),
				'type'    => 'select',
				'name'    => 'input_toevoeging',
				'choices' => array_merge(
					array(
						array(
							'label' => '—',
							'value' => '',
						),
					),
					$fields
				),
			),
		);

		return array(
			array(
				'title'  => esc_html__( 'Pandlens Adresgegevens', 'pandlens-adresgegevens' ),
				'fields' => array_merge(
					array(
						array(
							'label'   => esc_html__( 'Enable address lookup', 'pandlens-adresgegevens' ),
							'type'    => 'checkbox',
							'name'    => 'enabled',
							'choices' => array(
								array(
									'label' => esc_html__( 'Enabled', 'pandlens-adresgegevens' ),
									'name'  => 'enabled',
								),
							),
						),
						array(
							'label'   => esc_html__( 'Trigger lookup when this field changes', 'pandlens-adresgegevens' ),
							'type'    => 'select',
							'name'    => 'trigger_field',
							'choices' => array_merge(
								array(
									array(
										'label' => esc_html__( 'House number field', 'pandlens-adresgegevens' ),
										'value' => '',
									),
								),
								$fields
							),
						),
					),
					$input_fields,
					$map_fields
				),
			),
		);
	}

	/**
	 * @param array<string, mixed> $form
	 * @return array<string, mixed>
	 */
	public function get_form_settings( $form ): array {
		$settings = parent::get_form_settings( $form );
		if ( ! is_array( $settings ) ) {
			$settings = array();
		}

		$field_map = array();
		foreach ( Field_Keys::all() as $key ) {
			$name = 'field_map_' . $key;
			if ( isset( $settings[ $name ] ) && '' !== (string) $settings[ $name ] ) {
				$field_map[ $key ] = (int) $settings[ $name ];
			}
		}
		$settings['field_map'] = $field_map;
		$settings['inputs']    = array(
			'postcode'   => isset( $settings['input_postcode'] ) ? (int) $settings['input_postcode'] : 0,
			'huisnummer' => isset( $settings['input_huisnummer'] ) ? (int) $settings['input_huisnummer'] : 0,
			'huisletter' => isset( $settings['input_huisletter'] ) ? (int) $settings['input_huisletter'] : 0,
			'toevoeging' => isset( $settings['input_toevoeging'] ) ? (int) $settings['input_toevoeging'] : 0,
		);

		return $settings;
	}
}
