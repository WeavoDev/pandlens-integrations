<?php
/**
 * Normalizes Dutch postcode and house number input.
 *
 * @package Pandlens\Adresgegevens
 */

declare(strict_types=1);

namespace Pandlens\Adresgegevens;

/**
 * Validates and formats lookup parameters.
 */
class Address_Normalizer {

	/**
	 * @return array{postcode: string, huisnummer: int, huisletter: string, toevoeging: string}|null
	 */
	public function normalize( string $postcode, string $huisnummer, string $huisletter = '', string $toevoeging = '' ): ?array {
		$postcode = strtoupper( preg_replace( '/\s+/', '', $postcode ) ?? '' );
		if ( ! preg_match( '/^[1-9][0-9]{3}[A-Z]{2}$/', $postcode ) ) {
			return null;
		}

		$huisnummer = trim( $huisnummer );
		if ( '' === $huisnummer || ! ctype_digit( $huisnummer ) ) {
			return null;
		}

		$num = (int) $huisnummer;
		if ( $num < 1 || $num > 99999 ) {
			return null;
		}

		$huisletter = strtoupper( preg_replace( '/[^A-Z]/', '', $huisletter ) ?? '' );
		if ( strlen( $huisletter ) > 1 ) {
			$huisletter = substr( $huisletter, 0, 1 );
		}

		$toevoeging = trim( $toevoeging );
		if ( strlen( $toevoeging ) > 10 ) {
			$toevoeging = substr( $toevoeging, 0, 10 );
		}

		return array(
			'postcode'   => $postcode,
			'huisnummer' => $num,
			'huisletter' => $huisletter,
			'toevoeging' => $toevoeging,
		);
	}

	/**
	 * Cache key fragment for transients.
	 *
	 * @param array{postcode: string, huisnummer: int, huisletter: string, toevoeging: string} $parts
	 */
	public function cache_key( array $parts ): string {
		return md5(
			implode(
				'|',
				array(
					$parts['postcode'],
					(string) $parts['huisnummer'],
					$parts['huisletter'],
					$parts['toevoeging'],
				)
			)
		);
	}
}
