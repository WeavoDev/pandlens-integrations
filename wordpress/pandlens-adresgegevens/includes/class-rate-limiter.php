<?php
/**
 * Site-side rate limiting for the public lookup proxy.
 *
 * @package Pandlens\Adresgegevens
 */

declare(strict_types=1);

namespace Pandlens\Adresgegevens;

/**
 * Limits anonymous lookup volume and respects Pandlens API backoff headers.
 */
class Rate_Limiter {

	private const BUCKET_PREFIX = 'pl_ag_rl_';

	private const BACKOFF_OPTION = 'pandlens_adresgegevens_api_backoff_until';

	public static function seed_defaults(): void {
		if ( false === get_option( Settings::OPTION_KEY, false ) ) {
			add_option( Settings::OPTION_KEY, array(), '', false );
		}
	}

	/**
	 * @throws Api_Exception When the client must wait.
	 */
	public function assert_allowed( Settings $settings ): void {
		$backoff_until = (int) get_option( self::BACKOFF_OPTION, 0 );
		if ( $backoff_until > time() ) {
			$this->throw_rate_limit(
				array( 'retry_after' => $backoff_until - time() )
			);
		}

		$limit  = $settings->get_proxy_rate_limit();
		$bucket = self::BUCKET_PREFIX . $this->client_key();
		$data   = get_transient( $bucket );
		if ( ! is_array( $data ) ) {
			$data = array(
				'count'   => 0,
				'started' => time(),
			);
		}

		if ( time() - (int) $data['started'] >= MINUTE_IN_SECONDS ) {
			$data = array(
				'count'   => 0,
				'started' => time(),
			);
		}

		if ( (int) $data['count'] >= $limit ) {
			$this->throw_rate_limit(
				array( 'retry_after' => MINUTE_IN_SECONDS - ( time() - (int) $data['started'] ) )
			);
		}

		++$data['count'];
		set_transient( $bucket, $data, MINUTE_IN_SECONDS );
	}

	public function record_api_backoff( int $seconds ): void {
		$seconds = max( 1, min( 300, $seconds ) );
		update_option( self::BACKOFF_OPTION, time() + $seconds, false );
	}

	private function client_key(): string {
		$ip = '';
		if ( isset( $_SERVER['REMOTE_ADDR'] ) ) {
			$ip = sanitize_text_field( wp_unslash( (string) $_SERVER['REMOTE_ADDR'] ) );
		}

		return md5( $ip );
	}

	/**
	 * @param array<string, mixed> $context
	 * @throws Api_Exception
	 */
	private function throw_rate_limit( array $context ): void {
		// phpcs:ignore WordPress.Security.EscapeOutput.ExceptionNotEscaped -- Localized at REST/AJAX boundaries.
		throw Api_Exception::create( 'rate_limit_exceeded', 'Too many requests.', 429, $context );
	}
}
