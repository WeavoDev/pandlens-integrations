<?php
/**
 * Address mapper tests.
 *
 * @package Pandlens\Adresgegevens
 */

declare(strict_types=1);

namespace Pandlens\Adresgegevens\Tests;

use Pandlens\Adresgegevens\Address_Mapper;
use Pandlens\Adresgegevens\Field_Keys;
use PHPUnit\Framework\TestCase;

final class Address_Mapper_Test extends TestCase {

	public function test_maps_core_fields(): void {
		$mapper = new Address_Mapper();
		$fields = $mapper->map(
			array(
				'address'       => array(
					'straat'     => 'Damrak',
					'woonplaats' => 'Amsterdam',
				),
				'bag'           => array(
					'verblijfsobject' => array(
						'gebruiksdoel'  => 'woonfunctie',
						'oppervlakteM2' => 88,
					),
					'pand'            => array(
						'bouwjaar' => 1910,
					),
				),
				'energyLabel'   => array(
					'labelClass' => 'C',
				),
				'neighbourhood' => array(
					'gemeentenaam'   => 'Amsterdam',
					'buurtnaam'      => 'Centrum',
					'administrative' => array(
						'provincienaam' => 'Noord-Holland',
					),
				),
			)
		);

		$this->assertSame( 'Damrak', $fields[ Field_Keys::STREET ] );
		$this->assertSame( 'Amsterdam', $fields[ Field_Keys::WOONPLAATS ] );
		$this->assertSame( '1910', $fields[ Field_Keys::BUILD_YEAR ] );
		$this->assertSame( '88', $fields[ Field_Keys::FLOOR_AREA ] );
		$this->assertSame( 'C', $fields[ Field_Keys::ENERGY_LABEL_CLASS ] );
		$this->assertSame( 'Centrum', $fields[ Field_Keys::BUURT ] );
		$this->assertSame( 'Noord-Holland', $fields[ Field_Keys::PROVINCIE ] );
	}
}
