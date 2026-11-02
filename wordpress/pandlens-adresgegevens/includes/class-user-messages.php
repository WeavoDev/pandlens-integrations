<?php
/**
 * User-facing translated messages keyed by error slug.
 *
 * @package Pandlens\Adresgegevens
 */

declare(strict_types=1);

namespace Pandlens\Adresgegevens;

/**
 * Maps internal error slugs to localized strings at HTTP/AJAX boundaries.
 */
final class User_Messages {

	public static function for_slug( string $slug, string $fallback = '' ): string {
		$messages = array(
			'missing_api_key'        => __( 'Pandlens API key is not configured.', 'pandlens-adresgegevens' ),
			'validation_error'       => __( 'Enter a valid Dutch postcode and house number.', 'pandlens-adresgegevens' ),
			'network_error'          => __( 'Could not reach Pandlens. Try again later.', 'pandlens-adresgegevens' ),
			'unauthorized'           => __( 'Invalid Pandlens API key. Get a free key at pandlens.nl/signup.', 'pandlens-adresgegevens' ),
			'monthly_quota_exceeded' => __( 'Monthly Pandlens lookup quota exceeded.', 'pandlens-adresgegevens' ),
			'address_not_found'      => __( 'Address not found.', 'pandlens-adresgegevens' ),
			'address_ambiguous'      => __( 'Multiple units match this address. Choose a suffix.', 'pandlens-adresgegevens' ),
			'rate_limit_exceeded'    => __( 'Pandlens rate limit exceeded. Please wait and try again.', 'pandlens-adresgegevens' ),
			'api_error'              => __( 'Unexpected Pandlens API response.', 'pandlens-adresgegevens' ),
		);

		if ( isset( $messages[ $slug ] ) ) {
			return $messages[ $slug ];
		}

		return '' !== $fallback ? $fallback : $messages['api_error'];
	}
}
