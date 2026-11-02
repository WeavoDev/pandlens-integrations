<?php
/**
 * Uninstall cleanup.
 *
 * @package Pandlens\Adresgegevens
 */

if ( ! defined( 'WP_UNINSTALL_PLUGIN' ) ) {
	exit;
}

delete_option( 'pandlens_adresgegevens_settings' );
delete_option( 'pandlens_adresgegevens_api_backoff_until' );

global $wpdb;

// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
$wpdb->query(
	$wpdb->prepare(
		"DELETE FROM {$wpdb->options} WHERE option_name LIKE %s OR option_name LIKE %s",
		$wpdb->esc_like( '_transient_pl_ag_' ) . '%',
		$wpdb->esc_like( '_transient_timeout_pl_ag_' ) . '%'
	)
);
