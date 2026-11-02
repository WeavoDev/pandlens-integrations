<?php
/**
 * PHPUnit bootstrap (minimal WordPress stubs for unit tests).
 *
 * @package Pandlens\Adresgegevens
 */

declare(strict_types=1);

require_once dirname( __DIR__, 3 ) . '/pandlens-adresgegevens/includes/loader.php';

if ( ! defined( 'DAY_IN_SECONDS' ) ) {
	define( 'DAY_IN_SECONDS', 86400 );
}

if ( ! defined( 'MINUTE_IN_SECONDS' ) ) {
	define( 'MINUTE_IN_SECONDS', 60 );
}
