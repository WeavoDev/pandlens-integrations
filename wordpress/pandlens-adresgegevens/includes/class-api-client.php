<?php
/**
 * Server-side Pandlens HTTP client.
 *
 * @package Pandlens\Adresgegevens
 */

declare(strict_types=1);

namespace Pandlens\Adresgegevens;

/**
 * Calls api.pandlens.nl with the stored API key.
 */
class Api_Client {

	private const API_BASE = 'https://api.pandlens.nl';

	private Settings $settings;

	private Address_Normalizer $normalizer;

	private Address_Cache $cache;

	private Rate_Limiter $rate_limiter;

	private Address_Mapper $mapper;

	private Property_Card_Mapper $property_card_mapper;

	public function __construct( Settings $settings ) {
		$this->settings              = $settings;
		$this->normalizer            = new Address_Normalizer();
		$this->cache                 = new Address_Cache();
		$this->rate_limiter          = new Rate_Limiter();
		$this->mapper                = new Address_Mapper();
		$this->property_card_mapper  = new Property_Card_Mapper();
	}

	/**
	 * @return array{fields: array<string, string|null>, raw: array<string, mixed>, cached: bool}
	 * @throws Api_Exception
	 */
	public function lookup( string $postcode, string $huisnummer, string $huisletter = '', string $toevoeging = '', bool $enforce_proxy_limit = true ): array {
		if ( ! $this->settings->has_api_key() ) {
			throw Api_Exception::create( 'missing_api_key', 'Pandlens API key is not configured.', 503 );
		}

		$parts = $this->normalizer->normalize( $postcode, $huisnummer, $huisletter, $toevoeging );
		if ( null === $parts ) {
			throw Api_Exception::create( 'validation_error', 'Enter a valid Dutch postcode and house number.', 400 );
		}

		if ( $enforce_proxy_limit ) {
			$this->rate_limiter->assert_allowed( $this->settings );
		}

		$hash   = $this->normalizer->cache_key( $parts );
		$cached = $this->cache->get( $hash );
		if ( is_array( $cached ) ) {
			return array(
				'fields' => $this->mapper->map( $cached ),
				'raw'    => $cached,
				'cached' => true,
			);
		}

		$url = sprintf(
			'%s/v1/address/%s/%d',
			self::API_BASE,
			rawurlencode( $parts['postcode'] ),
			$parts['huisnummer']
		);

		$query = array();
		if ( '' !== $parts['huisletter'] ) {
			$query['huisletter'] = $parts['huisletter'];
		}
		if ( '' !== $parts['toevoeging'] ) {
			$query['toevoeging'] = $parts['toevoeging'];
		}
		if ( ! empty( $query ) ) {
			$url .= '?' . http_build_query( $query, '', '&', PHP_QUERY_RFC3986 );
		}

		$response = $this->request( 'GET', $url );
		$this->cache->set( $hash, $response );

		return array(
			'fields' => $this->mapper->map( $response ),
			'raw'    => $response,
			'cached' => false,
		);
	}

	/**
	 * @return array{fields: array<string, string|null>, card: array<string, mixed>, raw: array<string, mixed>, cached: bool}
	 * @throws Api_Exception
	 */
	public function lookup_property_card( string $postcode, string $huisnummer, string $huisletter = '', string $toevoeging = '', string $lang = 'nl', bool $enforce_proxy_limit = true ): array {
		$result = $this->lookup( $postcode, $huisnummer, $huisletter, $toevoeging, $enforce_proxy_limit );

		return array(
			'fields' => $result['fields'],
			'card'   => $this->property_card_mapper->build( $result['raw'], $lang ),
			'raw'    => $result['raw'],
			'cached' => $result['cached'],
		);
	}

	/**
	 * @return array<string, mixed>
	 * @throws Api_Exception
	 */
	public function get_usage(): array {
		if ( ! $this->settings->has_api_key() ) {
			throw Api_Exception::create( 'missing_api_key', 'Pandlens API key is not configured.', 503 );
		}

		return $this->request( 'GET', self::API_BASE . '/v1/usage' );
	}

	/**
	 * @return array<string, mixed>
	 * @throws Api_Exception
	 */
	private function request( string $method, string $url ): array {
		$args = array(
			'method'  => $method,
			'timeout' => 20,
			'headers' => array(
				'Accept'    => 'application/json',
				'X-Api-Key' => $this->settings->get_api_key(),
			),
		);

		$result = wp_remote_request( $url, $args );
		if ( is_wp_error( $result ) ) {
			throw Api_Exception::create( 'network_error', 'Could not reach Pandlens.', 502 );
		}

		$status   = (int) wp_remote_retrieve_response_code( $result );
		$body_raw = wp_remote_retrieve_body( $result );
		$body     = json_decode( $body_raw, true );
		if ( 429 === $status ) {
			$reset_header = wp_remote_retrieve_header( $result, 'x-ratelimit-reset' );
			$reset        = is_numeric( $reset_header ) ? (int) $reset_header : 60;
			$this->rate_limiter->record_api_backoff( $reset );
		}

		if ( $status >= 200 && $status < 300 && is_array( $body ) ) {
			return $body;
		}

		if ( 401 === $status ) {
			throw Api_Exception::create(
				'unauthorized',
				'Invalid Pandlens API key.',
				401,
				array(
					'signup_url' => 'https://pandlens.nl/signup',
				)
			);
		}

		if ( 402 === $status ) {
			$this->throw_from_response( $status, is_array( $body ) ? $body : null, 'Monthly Pandlens lookup quota exceeded.' );
		}

		if ( 404 === $status && is_array( $body ) ) {
			$this->throw_from_response( $status, $body, 'Address not found.' );
		}

		if ( 429 === $status ) {
			$this->throw_from_response( $status, is_array( $body ) ? $body : null, 'Pandlens rate limit exceeded.' );
		}

		$this->throw_from_response( $status, is_array( $body ) ? $body : null, 'Unexpected Pandlens API response.' );
	}

	/**
	 * @param array<string, mixed>|null $body
	 * @throws Api_Exception
	 */
	private function throw_from_response( int $status, ?array $body, string $fallback ): void {
		// phpcs:ignore WordPress.Security.EscapeOutput.ExceptionNotEscaped -- Localized at REST/AJAX boundaries.
		throw Api_Exception::from_response( $status, $body, $fallback );
	}
}
