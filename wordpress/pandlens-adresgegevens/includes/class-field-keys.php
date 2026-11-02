<?php
/**
 * Flat field keys exposed to forms and the block UI.
 *
 * @package Pandlens\Adresgegevens
 */

declare(strict_types=1);

namespace Pandlens\Adresgegevens;

/**
 * Canonical mapped field identifiers.
 */
final class Field_Keys {

	public const STREET             = 'street';
	public const WOONPLAATS         = 'woonplaats';
	public const GEMEENTE           = 'gemeente';
	public const PROVINCIE          = 'provincie';
	public const BUILD_YEAR         = 'build_year';
	public const FLOOR_AREA         = 'floor_area';
	public const USE                = 'use';
	public const ENERGY_LABEL_CLASS = 'energy_label_class';
	public const BUURT              = 'buurt';

	/**
	 * @return array<string, string> Machine key => translated label.
	 */
	public static function labels(): array {
		return array(
			self::STREET             => __( 'Street', 'pandlens-adresgegevens' ),
			self::WOONPLAATS         => __( 'City', 'pandlens-adresgegevens' ),
			self::GEMEENTE           => __( 'Municipality', 'pandlens-adresgegevens' ),
			self::PROVINCIE          => __( 'Province', 'pandlens-adresgegevens' ),
			self::BUILD_YEAR         => __( 'Build year', 'pandlens-adresgegevens' ),
			self::FLOOR_AREA         => __( 'Floor area (m²)', 'pandlens-adresgegevens' ),
			self::USE                => __( 'Use', 'pandlens-adresgegevens' ),
			self::ENERGY_LABEL_CLASS => __( 'Energy label', 'pandlens-adresgegevens' ),
			self::BUURT              => __( 'Neighbourhood', 'pandlens-adresgegevens' ),
		);
	}

	/**
	 * @return list<string>
	 */
	public static function all(): array {
		return array_keys( self::labels() );
	}
}
