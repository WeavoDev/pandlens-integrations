<?php
/**
 * API errors surfaced to REST/AJAX callers.
 *
 * @package Pandlens\Adresgegevens
 */

declare(strict_types=1);

namespace Pandlens\Adresgegevens;

/**
 * Structured Pandlens or proxy failure.
 */
class Api_Exception extends \Exception {

	/** @var array<string, mixed> */
	private array $context;

	private string $error_slug;

	/**
	 * @param array<string, mixed> $context
	 */
	private function __construct( string $error_slug, string $message, int $http_status = 400, array $context = array() ) {
		parent::__construct( $message, $http_status );
		$this->error_slug       = $error_slug;
		$this->context          = $context;
		$this->context['error'] = $error_slug;
	}

	/**
	 * @param array<string, mixed> $context
	 * @throws self
	 */
	public static function create( string $error_slug, string $message, int $http_status = 400, array $context = array() ): self {
		// phpcs:ignore WordPress.Security.EscapeOutput.ExceptionNotEscaped -- Messages are localized at REST/AJAX boundaries.
		return new self( $error_slug, $message, $http_status, $context );
	}

	public function get_error_slug(): string {
		return $this->error_slug;
	}

	public function http_status(): int {
		return (int) $this->getCode();
	}

	/**
	 * @return array<string, mixed>
	 */
	public function context(): array {
		return $this->context;
	}

	/**
	 * @param array<string, mixed>|null $body
	 */
	public static function from_response( int $status, ?array $body, string $fallback_message ): self {
		$error   = is_array( $body ) && isset( $body['error'] ) ? (string) $body['error'] : 'api_error';
		$message = is_array( $body ) && isset( $body['message'] ) ? (string) $body['message'] : $fallback_message;
		$context = is_array( $body ) ? $body : array();

		return self::create( $error, $message, $status, $context );
	}
}
