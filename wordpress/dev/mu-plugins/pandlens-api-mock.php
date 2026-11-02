<?php
/**
 * Local Pandlens API mock (mu-plugin for dev site only).
 *
 * @package PandlensDev
 */

defined( 'ABSPATH' ) || exit;

/**
 * Intercepts outbound requests to api.pandlens.nl during local testing.
 *
 * @param false|array<string, mixed>|WP_Error $preempt Preempt value.
 * @param array<string, mixed>                $args    Request args.
 * @param string                              $url     Request URL.
 * @return false|array<string, mixed>|WP_Error
 */
function pandlens_dev_mock_http( $preempt, $args, $url ) {
	if ( false === strpos( $url, 'https://api.pandlens.nl' ) ) {
		return $preempt;
	}

	$key = '';
	if ( isset( $args['headers']['X-Api-Key'] ) ) {
		$key = (string) $args['headers']['X-Api-Key'];
	} elseif ( isset( $args['headers']['x-api-key'] ) ) {
		$key = (string) $args['headers']['x-api-key'];
	}

	if ( 'invalid-key' === $key ) {
		return array(
			'response' => array( 'code' => 401 ),
			'body'     => '',
			'headers'  => array(),
		);
	}

	if ( 'quota-key' === $key ) {
		return array(
			'response' => array( 'code' => 402 ),
			'body'     => wp_json_encode(
				array(
					'error'   => 'monthly_quota_exceeded',
					'message' => 'Monthly quota exceeded',
				)
			),
			'headers'  => array( 'content-type' => 'application/json' ),
		);
	}

	if ( 'rate-key' === $key ) {
		return array(
			'response' => array( 'code' => 429 ),
			'body'     => wp_json_encode(
				array(
					'error'   => 'rate_limit_exceeded',
					'message' => 'Rate limit exceeded',
				)
			),
			'headers'  => array(
				'content-type'        => 'application/json',
				'x-ratelimit-reset'   => '30',
			),
		);
	}

	$path = wp_parse_url( $url, PHP_URL_PATH );
	if ( ! is_string( $path ) ) {
		return $preempt;
	}

	if ( '/v1/usage' === $path ) {
		return array(
			'response' => array( 'code' => 200 ),
			'body'     => wp_json_encode(
				array(
					'plan'               => 'Developer',
					'usedThisMonth'      => 12,
					'monthlyQuota'       => 500,
					'remainingThisMonth' => 488,
					'monthlyPriceEur'    => 0,
					'costThisMonthEur'   => 0,
					'month'              => gmdate( 'Y-m-01' ),
				)
			),
			'headers'  => array( 'content-type' => 'application/json' ),
		);
	}

	if ( preg_match( '#^/v1/address/([A-Z0-9]+)/(\d+)#', $path, $m ) ) {
		$postcode   = $m[1];
		$huisnummer = (int) $m[2];
		$query      = array();
		wp_parse_str( (string) wp_parse_url( $url, PHP_URL_QUERY ), $query );
		$huisletter = isset( $query['huisletter'] ) ? strtoupper( (string) $query['huisletter'] ) : '';
		$toevoeging = isset( $query['toevoeging'] ) ? (string) $query['toevoeging'] : '';

		if ( '1234AB' === $postcode && 1 === $huisnummer && '' === $huisletter && '' === $toevoeging ) {
			return array(
				'response' => array( 'code' => 404 ),
				'body'     => wp_json_encode(
					array(
						'error'      => 'address_ambiguous',
						'message'    => 'Multiple units found',
						'candidates' => array(
							array( 'huisletter' => 'A', 'toevoeging' => null ),
							array( 'huisletter' => null, 'toevoeging' => 'bis' ),
						),
					)
				),
				'headers'  => array( 'content-type' => 'application/json' ),
			);
		}

		if ( '9999ZZ' === $postcode ) {
			return array(
				'response' => array( 'code' => 404 ),
				'body'     => wp_json_encode(
					array(
						'error'   => 'address_not_found',
						'message' => 'Not found',
					)
				),
				'headers'  => array( 'content-type' => 'application/json' ),
			);
		}

		$payload = array(
			'address'      => array(
				'postcode'   => $postcode,
				'huisnummer' => $huisnummer,
				'huisletter' => $huisletter ?: null,
				'toevoeging' => $toevoeging ?: null,
				'straat'     => 'Damrak',
				'woonplaats' => 'Amsterdam',
			),
			'bag'          => array(
				'sourceAsOf'      => gmdate( 'Y-m-d' ),
				'verblijfsobject' => array(
					'identificatie'  => 'demo-vbo',
					'gebruiksdoel'   => 'woonfunctie',
					'oppervlakteM2'  => 92,
					'openbareRuimteNaam' => 'Damrak',
					'woonplaatsNaam' => 'Amsterdam',
				),
				'pand'            => array(
					'identificatie' => 'demo-pand',
					'bouwjaar'      => 1912,
				),
			),
			'energyLabel'  => array(
				'sourceAsOf' => gmdate( 'Y-m-d' ),
				'labelClass' => 'C',
			),
			'neighbourhood' => array(
				'sourceAsOf'     => gmdate( 'Y-m-d' ),
				'buurtcode'      => 'WK001',
				'wijkcode'       => 'WK001',
				'gemeentecode'   => '0363',
				'gemeentenaam'   => 'Amsterdam',
				'buurtnaam'      => 'Centrum',
				'keyFigures'     => array(),
				'administrative' => array(
					'provincienaam' => 'Noord-Holland',
					'provinciecode' => '27',
				),
			),
		);

		return array(
			'response' => array( 'code' => 200 ),
			'body'     => wp_json_encode( $payload ),
			'headers'  => array( 'content-type' => 'application/json' ),
		);
	}

	return $preempt;
}

add_filter( 'pre_http_request', 'pandlens_dev_mock_http', 10, 3 );
