<?php
/**
 * Maps Pandlens API payloads to form field values.
 *
 * @package Pandlens\Adresgegevens
 */

declare(strict_types=1);

namespace Pandlens\Adresgegevens;

/**
 * Extracts mapped values from a Pandlens address enrichment response.
 */
class Address_Mapper {

	/**
	 * @param array<string, mixed> $payload Decoded JSON from GET /v1/address/...
	 * @return array<string, string|null>
	 */
	public function map( array $payload ): array {
		$address       = $this->array_get( $payload, 'address' );
		$bag           = $this->array_get( $payload, 'bag' );
		$verblijf      = $this->array_get( $bag, 'verblijfsobject' );
		$pand          = $this->array_get( $bag, 'pand' );
		$energy        = $this->array_get( $payload, 'energyLabel' );
		$neighbourhood = $this->array_get( $payload, 'neighbourhood' );
		$admin         = $this->array_get( $neighbourhood, 'administrative' );

		$street = $this->string_or_null( $address, 'straat' );
		if ( null === $street ) {
			$street = $this->string_or_null( $verblijf, 'openbareRuimteNaam' );
		}

		$build_year = $this->int_or_null( $pand, 'bouwjaar' );
		if ( null === $build_year ) {
			$build_year = $this->int_or_null( $energy, 'constructionYear' );
		}

		$floor = $this->int_or_null( $verblijf, 'oppervlakteM2' );

		return array(
			Field_Keys::STREET             => $street,
			Field_Keys::WOONPLAATS         => $this->string_or_null( $address, 'woonplaats' ) ?? $this->string_or_null( $verblijf, 'woonplaatsNaam' ),
			Field_Keys::GEMEENTE           => $this->string_or_null( $neighbourhood, 'gemeentenaam' ),
			Field_Keys::PROVINCIE          => $this->string_or_null( $admin, 'provincienaam' ),
			Field_Keys::BUILD_YEAR         => null !== $build_year ? (string) $build_year : null,
			Field_Keys::FLOOR_AREA         => null !== $floor ? (string) $floor : null,
			Field_Keys::USE                => $this->string_or_null( $verblijf, 'gebruiksdoel' ),
			Field_Keys::ENERGY_LABEL_CLASS => $this->string_or_null( $energy, 'labelClass' ),
			Field_Keys::BUURT              => $this->string_or_null( $neighbourhood, 'buurtnaam' ),
		);
	}

	/**
	 * @param array<string, mixed> $data
	 * @return array<string, mixed>
	 */
	private function array_get( array $data, string $key ): array {
		if ( ! isset( $data[ $key ] ) || ! is_array( $data[ $key ] ) ) {
			return array();
		}

		return $data[ $key ];
	}

	/**
	 * @param array<string, mixed> $data
	 */
	private function string_or_null( array $data, string $key ): ?string {
		if ( ! isset( $data[ $key ] ) || ! is_scalar( $data[ $key ] ) ) {
			return null;
		}

		$value = trim( (string) $data[ $key ] );

		return '' === $value ? null : $value;
	}

	/**
	 * @param array<string, mixed> $data
	 */
	private function int_or_null( array $data, string $key ): ?int {
		if ( ! isset( $data[ $key ] ) || ! is_numeric( $data[ $key ] ) ) {
			return null;
		}

		return (int) $data[ $key ];
	}
}
