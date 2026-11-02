( function ( $ ) {
	'use strict';

	var cfg = window.PandlensAdresgegevensAdmin || {};

	$( '#pl-ag-test-connection' ).on( 'click', function () {
		var $btn = $( this );
		var $out = $( '#pl-ag-test-result' );
		$btn.prop( 'disabled', true );
		$out.text( cfg.strings.testing || 'Testing…' );

		$.post( cfg.ajaxUrl, {
			action: 'pandlens_adresgegevens_test_connection',
			nonce: cfg.nonce,
		} )
			.done( function ( response ) {
				if ( ! response.success ) {
					$out.text( ( response.data && response.data.message ) || cfg.strings.failed );
					return;
				}
				var d = response.data;
				$out.text(
					( cfg.strings.success || 'Connected.' ) +
						' ' +
						'Plan: ' +
						( d.plan || '—' ) +
						', used: ' +
						d.used +
						', remaining: ' +
						( d.remaining != null ? d.remaining : '—' )
				);
			} )
			.fail( function () {
				$out.text( cfg.strings.failed || 'Failed.' );
			} )
			.always( function () {
				$btn.prop( 'disabled', false );
			} );
	} );
} )( jQuery );
