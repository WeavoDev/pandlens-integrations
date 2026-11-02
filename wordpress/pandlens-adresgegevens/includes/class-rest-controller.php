<?php
/**
 * REST API proxy for address lookups.
 *
 * @package Pandlens\Adresgegevens
 */

declare(strict_types=1);

namespace Pandlens\Adresgegevens;

use WP_Error;
use WP_REST_Request;
use WP_REST_Response;
use WP_REST_Server;

/**
 * Registers public lookup and admin usage routes.
 */
class Rest_Controller {

	private Api_Client $api_client;

	public function __construct( Api_Client $api_client ) {
		$this->api_client = $api_client;
	}

	public function register_routes(): void {
		register_rest_route(
			'pandlens-adresgegevens/v1',
			'/address',
			array(
				'methods'             => WP_REST_Server::CREATABLE,
				'callback'            => array( $this, 'lookup' ),
				'permission_callback' => array( $this, 'verify_public_nonce' ),
				'args'                => array(
					'postcode'   => array(
						'required'          => true,
						'type'              => 'string',
						'sanitize_callback' => 'sanitize_text_field',
					),
					'huisnummer' => array(
						'required'          => true,
						'type'              => 'string',
						'sanitize_callback' => 'sanitize_text_field',
					),
					'huisletter' => array(
						'required'          => false,
						'type'              => 'string',
						'sanitize_callback' => 'sanitize_text_field',
					),
					'toevoeging' => array(
						'required'          => false,
						'type'              => 'string',
						'sanitize_callback' => 'sanitize_text_field',
					),
				),
			)
		);

		register_rest_route(
			'pandlens-adresgegevens/v1',
			'/usage',
			array(
				'methods'             => WP_REST_Server::READABLE,
				'callback'            => array( $this, 'usage' ),
				'permission_callback' => static function (): bool {
					return current_user_can( 'manage_options' );
				},
			)
		);
	}

	/**
	 * @return bool|WP_Error
	 */
	public function verify_public_nonce( WP_REST_Request $request ) {
		$nonce = $request->get_header( 'X-WP-Nonce' );
		if ( ! $nonce ) {
			$nonce = $request->get_param( '_wpnonce' );
		}
		if ( ! is_string( $nonce ) || ! wp_verify_nonce( $nonce, 'wp_rest' ) ) {
			return new WP_Error(
				'pandlens_rest_nonce',
				__( 'Invalid security token. Refresh the page and try again.', 'pandlens-adresgegevens' ),
				array( 'status' => 403 )
			);
		}

		return true;
	}

	/**
	 * @return WP_REST_Response|WP_Error
	 */
	public function lookup( WP_REST_Request $request ) {
		try {
			$result = $this->api_client->lookup(
				(string) $request->get_param( 'postcode' ),
				(string) $request->get_param( 'huisnummer' ),
				(string) ( $request->get_param( 'huisletter' ) ?? '' ),
				(string) ( $request->get_param( 'toevoeging' ) ?? '' )
			);

			return new WP_REST_Response(
				array(
					'success' => true,
					'fields'  => $result['fields'],
					'cached'  => $result['cached'],
				),
				200
			);
		} catch ( Api_Exception $exception ) {
			return $this->error_response( $exception );
		}
	}

	/**
	 * @return WP_REST_Response|WP_Error
	 */
	public function usage( WP_REST_Request $request ) {
		unset( $request );
		try {
			$usage = $this->api_client->get_usage();

			return new WP_REST_Response(
				array(
					'success' => true,
					'usage'   => $usage,
				),
				200
			);
		} catch ( Api_Exception $exception ) {
			return $this->error_response( $exception );
		}
	}

	/**
	 * @return WP_Error
	 */
	private function error_response( Api_Exception $exception ): WP_Error {
		$data = array(
			'status'  => $exception->http_status(),
			'error'   => $exception->get_error_slug(),
			'context' => $exception->context(),
		);

		if ( 'unauthorized' === $exception->get_error_slug() ) {
			$data['signup_url'] = 'https://pandlens.nl/signup';
		}

		if ( 'address_ambiguous' === $exception->get_error_slug() ) {
			$data['candidates'] = $exception->context()['candidates'] ?? array();
		}

		return new WP_Error(
			'pandlens_' . $exception->get_error_slug(),
			$exception->getMessage(),
			$data
		);
	}
}
