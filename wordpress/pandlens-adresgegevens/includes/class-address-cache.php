<?php
/**
 * Transient cache for address lookups (24 hours).
 *
 * @package Pandlens\Adresgegevens
 */

declare(strict_types=1);

namespace Pandlens\Adresgegevens;

/**
 * Stores successful API payloads per normalized address.
 */
class Address_Cache {

	public const TTL = DAY_IN_SECONDS;

	private const PREFIX = 'pl_ag_addr_';

	/**
	 * @return array<string, mixed>|null
	 */
	public function get( string $hash ): ?array {
		$cached = get_transient( self::PREFIX . $hash );
		if ( ! is_array( $cached ) ) {
			return null;
		}

		return $cached;
	}

	/**
	 * @param array<string, mixed> $payload
	 */
	public function set( string $hash, array $payload ): void {
		set_transient( self::PREFIX . $hash, $payload, self::TTL );
	}
}
