<?php
/**
 * Address normalizer tests.
 *
 * @package Pandlens\Adresgegevens
 */

declare(strict_types=1);

namespace Pandlens\Adresgegevens\Tests;

use Pandlens\Adresgegevens\Address_Normalizer;
use PHPUnit\Framework\TestCase;

final class Address_Normalizer_Test extends TestCase {

	public function test_normalizes_postcode_with_space(): void {
		$normalizer = new Address_Normalizer();
		$result     = $normalizer->normalize( '1234 AB', '12' );

		$this->assertIsArray( $result );
		$this->assertSame( '1234AB', $result['postcode'] );
		$this->assertSame( 12, $result['huisnummer'] );
	}

	public function test_rejects_invalid_postcode(): void {
		$normalizer = new Address_Normalizer();
		$this->assertNull( $normalizer->normalize( '0000AA', '1' ) );
	}

	public function test_cache_key_is_stable(): void {
		$normalizer = new Address_Normalizer();
		$parts      = array(
			'postcode'   => '1234AB',
			'huisnummer' => 1,
			'huisletter' => 'A',
			'toevoeging' => 'bis',
		);

		$this->assertSame( $normalizer->cache_key( $parts ), $normalizer->cache_key( $parts ) );
	}
}
