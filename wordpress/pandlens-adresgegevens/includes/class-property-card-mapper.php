<?php
/**
 * Maps Pandlens API payloads to a property card view model.
 *
 * @package Pandlens\Adresgegevens
 */

declare(strict_types=1);

namespace Pandlens\Adresgegevens;

/**
 * Builds JSON for the embeddable property card UI.
 */
class Property_Card_Mapper {

	private const CREDIT_NL = 'Pandlens combineert open data onder CC BY 4.0.';
	private const CREDIT_EN = 'Pandlens combines open data under CC BY 4.0.';

	/**
	 * @param array<string, mixed> $payload Decoded address enrichment JSON.
	 * @return array<string, mixed>
	 */
	public function build( array $payload, string $lang = 'nl' ): array {
		$is_en = 0 === strpos( strtolower( $lang ), 'en' );

		$address       = $this->arr( $payload, 'address' );
		$bag           = $this->arr( $payload, 'bag' );
		$verblijf      = $this->arr( $bag, 'verblijfsobject' );
		$pand          = $this->arr( $bag, 'pand' );
		$neighbourhood = $this->arr( $payload, 'neighbourhood' );
		$derived       = $this->arr( $payload, 'derived' );
		$derived_woz   = $this->arr( $derived, 'woz' );

		$street = $this->str( $address, 'straat' ) ?? $this->str( $verblijf, 'openbareRuimteNaam' ) ?? '';
		$city   = $this->str( $address, 'woonplaats' ) ?? $this->str( $verblijf, 'woonplaatsNaam' ) ?? '';
		$pc     = $this->str( $address, 'postcode' ) ?? '';
		$hn     = isset( $address['huisnummer'] ) ? (string) $address['huisnummer'] : '';

		$build_year = $this->int( $pand, 'bouwjaar' ) ?? $this->int( $this->arr( $payload, 'energyLabel' ), 'constructionYear' );
		$floor      = $this->int( $verblijf, 'oppervlakteM2' );
		$use        = $this->str( $verblijf, 'gebruiksdoel' );

		$facts = array();
		if ( null !== $build_year ) {
			$facts[] = array(
				'label' => $is_en ? 'Build year' : 'Bouwjaar',
				'value' => (string) $build_year,
			);
		}
		if ( null !== $floor ) {
			$facts[] = array(
				'label' => $is_en ? 'Floor area' : 'Woonoppervlakte',
				'value' => $floor . ' m²',
			);
		}
		if ( null !== $use ) {
			$facts[] = array(
				'label' => $is_en ? 'Use' : 'Gebruik',
				'value' => $use,
			);
		}

		$energy   = $this->resolve_energy( $payload, $is_en );
		$verdicts = $this->resolve_verdicts( $payload, $is_en );

		$buurt_lines = array();
		$area_name   = $this->str( $neighbourhood, 'buurtnaam' )
			?? $this->str( $neighbourhood, 'wijknaam' )
			?? $this->str( $neighbourhood, 'gemeentenaam' );
		if ( null !== $area_name ) {
			$buurt_lines[] = array(
				'label' => $is_en ? 'Neighbourhood' : 'Buurt',
				'value' => $area_name,
			);
		}

		$woz_value = $this->int( $neighbourhood, 'gemiddeldeWozWaardeEur' );
		$woz_year  = $this->int( $neighbourhood, 'wozPeiljaar' );
		if ( null !== $woz_value ) {
			$formatted = '€ ' . number_format_i18n( $woz_value, 0 );
			if ( null !== $woz_year ) {
				$formatted .= $is_en
					? ' (reference year ' . $woz_year . ')'
					: ' (peiljaar ' . $woz_year . ')';
			}
			$buurt_lines[] = array(
				'label' => $is_en ? 'Average WOZ value' : 'Gemiddelde WOZ',
				'value' => $formatted,
			);
		}

		$yoy_row = $this->arr( $derived_woz, 'buurtYoYPercent' );
		if ( isset( $yoy_row['value'] ) && is_numeric( $yoy_row['value'] ) ) {
			$buurt_lines[] = array(
				'label' => $is_en ? 'WOZ year on year' : 'WOZ jaar-op-jaar',
				'value' => number_format_i18n( (float) $yoy_row['value'], 1 ) . '%',
			);
		}

		$title_parts = trim( $street . ' ' . $hn );
		$subtitle    = trim( $pc . ( $pc && $city ? ' · ' : '' ) . $city );

		$fallback_title = '' !== $subtitle ? $subtitle : '—';
		$title          = '' !== $title_parts ? $title_parts : $fallback_title;

		return array(
			'lang'          => $is_en ? 'en' : 'nl',
			'title'         => $title,
			'subtitle'      => '' !== $title_parts ? $subtitle : '',
			'facts'         => $facts,
			'energy'        => $energy,
			'verdicts'      => $verdicts,
			'neighbourhood' => $buurt_lines,
			'credit'        => $is_en ? self::CREDIT_EN : self::CREDIT_NL,
		);
	}

	/**
	 * @param array<string, mixed> $payload
	 * @return array<string, mixed>|null
	 */
	private function resolve_energy( array $payload, bool $is_en ): ?array {
		$energy         = $this->arr( $payload, 'energyLabel' );
		$derived_energy = $this->arr( $this->arr( $payload, 'derived' ), 'energy' );
		$derived_label  = $this->arr( $derived_energy, 'labelClass' );

		$registered = $this->str( $energy, 'labelClass' );
		if ( null !== $registered ) {
			return array(
				'label'     => $is_en ? 'Energy label' : 'Energielabel',
				'value'     => $registered,
				'kind'      => 'registered',
				'kindLabel' => $is_en ? 'Registered label' : 'Geregistreerd label',
			);
		}

		$estimated = $this->str( $derived_label, 'value' );
		$status    = $this->str( $derived_label, 'status' );
		if ( null !== $estimated && null !== $status && 'observed' !== $status ) {
			return array(
				'label'     => $is_en ? 'Energy label' : 'Energielabel',
				'value'     => $estimated,
				'kind'      => 'estimate',
				'kindLabel' => $is_en ? 'Estimated label' : 'Geschat label',
			);
		}

		return null;
	}

	/**
	 * @param array<string, mixed> $payload
	 * @return list<array<string, string>>
	 */
	private function resolve_verdicts( array $payload, bool $is_en ): array {
		$verdicts     = array();
		$derived      = $this->arr( $payload, 'derived' );
		$installation = $this->arr( $derived, 'installation' );

		$solar_label      = $is_en ? 'Solar panels' : 'Zonnepanelen';
		$insulation_label = $is_en ? 'Insulation' : 'Isolatie';

		$solar_api = $this->str( $installation, 'solarVerdict' ) ?? $this->str( $installation, 'solar' );
		if ( null !== $solar_api ) {
			$verdicts[] = array(
				'id'    => 'solar',
				'label' => $solar_label,
				'text'  => $solar_api,
			);
		} else {
			$building3d = $this->arr( $payload, 'building3d' );
			if ( array_key_exists( 'zonnepanelen', $building3d ) && is_bool( $building3d['zonnepanelen'] ) ) {
				$verdicts[] = array(
					'id'    => 'solar',
					'label' => $solar_label,
					'text'  => $building3d['zonnepanelen']
						? ( $is_en ? 'Likely present' : 'Waarschijnlijk aanwezig' )
						: ( $is_en ? 'No indication on the roof' : 'Geen indicatie op het dak' ),
				);
			}
		}

		$insulation_api = $this->str( $installation, 'insulationVerdict' ) ?? $this->str( $installation, 'insulation' );
		if ( null !== $insulation_api ) {
			$verdicts[] = array(
				'id'    => 'insulation',
				'label' => $insulation_label,
				'text'  => $insulation_api,
			);
		} else {
			$age_row      = $this->arr( $this->arr( $derived, 'property' ), 'ageCategory' );
			$age_category = $this->str( $age_row, 'value' );
			if ( 'modern_insulated' === $age_category ) {
				$verdicts[] = array(
					'id'    => 'insulation',
					'label' => $insulation_label,
					'text'  => $is_en
						? 'Likely reasonable insulation (indicative)'
						: 'Redelijk tot goed geïsoleerd (indicatie)',
				);
			} elseif ( in_array( $age_category, array( 'pre_1945_uninsulated', 'legacy_poor' ), true ) ) {
				$verdicts[] = array(
					'id'    => 'insulation',
					'label' => $insulation_label,
					'text'  => $is_en
						? 'May have limited insulation (indicative)'
						: 'Mogelijk matige isolatie (indicatie)',
				);
			}
		}

		return $verdicts;
	}

	/**
	 * @param array<string, mixed> $data
	 * @return array<string, mixed>
	 */
	private function arr( array $data, string $key ): array {
		if ( ! isset( $data[ $key ] ) || ! is_array( $data[ $key ] ) ) {
			return array();
		}

		return $data[ $key ];
	}

	/**
	 * @param array<string, mixed> $data
	 */
	private function str( array $data, string $key ): ?string {
		if ( ! isset( $data[ $key ] ) || ! is_scalar( $data[ $key ] ) ) {
			return null;
		}

		$value = trim( (string) $data[ $key ] );

		return '' === $value ? null : $value;
	}

	/**
	 * @param array<string, mixed> $data
	 */
	private function int( array $data, string $key ): ?int {
		if ( ! isset( $data[ $key ] ) || ! is_numeric( $data[ $key ] ) ) {
			return null;
		}

		return (int) $data[ $key ];
	}
}
