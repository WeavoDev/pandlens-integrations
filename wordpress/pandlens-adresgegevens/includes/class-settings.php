<?php
/**
 * Plugin settings stored in wp_options.
 *
 * @package Pandlens\Adresgegevens
 */

declare(strict_types=1);

namespace Pandlens\Adresgegevens;

/**
 * Reads and writes plugin options. API key never leaves server-side code paths exposed to visitors.
 */
class Settings {

	public const OPTION_KEY = 'pandlens_adresgegevens_settings';

	/**
	 * Default per-IP lookups per minute on the WordPress proxy.
	 */
	public const DEFAULT_PROXY_RATE_LIMIT = 30;

	/**
	 * @return array<string, mixed>
	 */
	public function all(): array {
		$stored = get_option( self::OPTION_KEY, array() );
		if ( ! is_array( $stored ) ) {
			$stored = array();
		}

		return wp_parse_args(
			$stored,
			array(
				'api_key'              => '',
				'proxy_rate_limit'     => self::DEFAULT_PROXY_RATE_LIMIT,
				'cf7_postcode_field'   => 'postcode',
				'cf7_huisnummer_field' => 'huisnummer',
				'cf7_huisletter_field' => 'huisletter',
				'cf7_toevoeging_field' => 'toevoeging',
			)
		);
	}

	public function get_api_key(): string {
		$all = $this->all();
		$key = isset( $all['api_key'] ) ? (string) $all['api_key'] : '';

		return trim( $key );
	}

	public function has_api_key(): bool {
		return '' !== $this->get_api_key();
	}

	public function get_proxy_rate_limit(): int {
		$all   = $this->all();
		$limit = isset( $all['proxy_rate_limit'] ) ? (int) $all['proxy_rate_limit'] : self::DEFAULT_PROXY_RATE_LIMIT;

		return max( 1, min( 120, $limit ) );
	}

	/**
	 * @param array<string, mixed> $input Raw settings input.
	 * @return array<string, mixed>
	 */
	public function sanitize( array $input ): array {
		$current = $this->all();
		$output  = $current;

		if ( isset( $input['api_key'] ) ) {
			$output['api_key'] = sanitize_text_field( (string) $input['api_key'] );
		}

		if ( isset( $input['proxy_rate_limit'] ) ) {
			$output['proxy_rate_limit'] = max( 1, min( 120, (int) $input['proxy_rate_limit'] ) );
		}

		foreach ( array( 'cf7_postcode_field', 'cf7_huisnummer_field', 'cf7_huisletter_field', 'cf7_toevoeging_field' ) as $field ) {
			if ( isset( $input[ $field ] ) ) {
				$output[ $field ] = sanitize_key( (string) $input[ $field ] );
			}
		}

		return $output;
	}
}
