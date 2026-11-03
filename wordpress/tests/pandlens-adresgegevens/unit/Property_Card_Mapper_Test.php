<?php
/**
 * @package Pandlens\Adresgegevens
 */

declare(strict_types=1);

namespace Pandlens\Adresgegevens\Tests;

use Pandlens\Adresgegevens\Property_Card_Mapper;
use PHPUnit\Framework\TestCase;

/**
 * Property card mapper tests.
 */
class Property_Card_Mapper_Test extends TestCase {

	public function test_builds_registered_energy_label(): void {
		$fixture = $this->load_fixture( 'address-enrichment.json' );
		$mapper  = new Property_Card_Mapper();
		$card    = $mapper->build( $fixture, 'nl' );

		$this->assertSame( 'registered', $card['energy']['kind'] );
		$this->assertSame( 'A', $card['energy']['value'] );
		$this->assertStringContainsString( 'CC BY 4.0', $card['credit'] );
	}

	public function test_marks_computed_label_as_estimate(): void {
		$fixture = $this->load_fixture( 'address-enrichment.json' );
		unset( $fixture['energyLabel'] );
		$fixture['derived']['energy']['labelClass'] = array(
			'value'  => 'C',
			'status' => 'computed',
		);

		$mapper = new Property_Card_Mapper();
		$card   = $mapper->build( $fixture, 'en' );

		$this->assertSame( 'estimate', $card['energy']['kind'] );
	}

	/**
	 * @return array<string, mixed>
	 */
	private function load_fixture( string $name ): array {
		$path = dirname( __DIR__, 4 ) . '/fixtures/' . $name;
		$json = file_get_contents( $path );
		$this->assertNotFalse( $json );
		$data = json_decode( $json, true );
		$this->assertIsArray( $data );

		return $data;
	}
}
