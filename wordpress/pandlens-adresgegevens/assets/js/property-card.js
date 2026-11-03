( function () {
	'use strict';

	var cfg = window.PandlensPropertyCard || {};
	var extra = window.PandlensPropertyCardExtra || {};

	function mergeConfig() {
		var out = {};
		var key;
		for ( key in cfg ) {
			if ( Object.prototype.hasOwnProperty.call( cfg, key ) ) {
				out[ key ] = cfg[ key ];
			}
		}
		for ( key in extra ) {
			if ( Object.prototype.hasOwnProperty.call( extra, key ) ) {
				out[ key ] = extra[ key ];
			}
		}
		return out;
	}

	function escapeHtml( value ) {
		return String( value )
			.replace( /&/g, '&amp;' )
			.replace( /</g, '&lt;' )
			.replace( />/g, '&gt;' )
			.replace( /"/g, '&quot;' );
	}

	function requestCard( payload ) {
		var config = mergeConfig();
		return fetch( config.restUrl, {
			method: 'POST',
			credentials: 'same-origin',
			headers: {
				'Content-Type': 'application/json',
				'X-WP-Nonce': config.nonce,
			},
			body: JSON.stringify( payload ),
		} ).then( function ( response ) {
			return response.json().then( function ( body ) {
				return { ok: response.ok, status: response.status, body: body };
			} );
		} );
	}

	function applyPrefill( fields, map ) {
		if ( ! map || ! fields ) {
			return;
		}
		Object.keys( map ).forEach( function ( key ) {
			var selector = map[ key ];
			var value = fields[ key ];
			if ( ! selector || value == null || value === '' ) {
				return;
			}
			var node = document.querySelector( selector );
			if ( node && 'value' in node ) {
				node.value = value;
				node.dispatchEvent( new Event( 'change', { bubbles: true } ) );
			}
		} );
	}

	function renderCard( container, model ) {
		var energyHtml = '';
		if ( model.energy ) {
			var badge =
				model.energy.kind === 'estimate'
					? '<span class="pl-pc__badge">' + escapeHtml( model.energy.kindLabel ) + '</span>'
					: '';
			energyHtml =
				'<div class="pl-pc__energy"><span>' +
				escapeHtml( model.energy.label ) +
				'</span><span class="pl-pc__energy-value" aria-label="' +
				escapeHtml( model.energy.kindLabel ) +
				'">' +
				escapeHtml( model.energy.value ) +
				'</span>' +
				badge +
				'</div>';
		}

		var facts = ( model.facts || [] )
			.map( function ( row ) {
				return (
					'<div class="pl-pc__fact"><dt>' +
					escapeHtml( row.label ) +
					'</dt><dd>' +
					escapeHtml( row.value ) +
					'</dd></div>'
				);
			} )
			.join( '' );

		var verdicts = ( model.verdicts || [] )
			.map( function ( row ) {
				return (
					'<li><strong>' + escapeHtml( row.label ) + ':</strong> ' + escapeHtml( row.text ) + '</li>'
				);
			} )
			.join( '' );

		var buurt = ( model.neighbourhood || [] )
			.map( function ( row ) {
				return (
					'<div class="pl-pc__fact"><dt>' +
					escapeHtml( row.label ) +
					'</dt><dd>' +
					escapeHtml( row.value ) +
					'</dd></div>'
				);
			} )
			.join( '' );

		container.innerHTML =
			'<article class="pl-pc__card">' +
			'<header><h2 class="pl-pc__title">' +
			escapeHtml( model.title ) +
			'</h2>' +
			( model.subtitle ? '<p class="pl-pc__subtitle">' + escapeHtml( model.subtitle ) + '</p>' : '' ) +
			'</header>' +
			energyHtml +
			'<dl class="pl-pc__facts">' +
			facts +
			'</dl>' +
			( verdicts
				? '<section class="pl-pc__verdicts"><ul>' + verdicts + '</ul></section>'
				: '' ) +
			( buurt ? '<section class="pl-pc__buurt"><dl class="pl-pc__facts">' + buurt + '</dl></section>' : '' ) +
			'<p class="pl-pc__credit">' +
			escapeHtml( model.credit || '' ) +
			'</p></article>';
		container.hidden = false;
	}

	function mountRoot( root ) {
		var config = mergeConfig();
		var messages = config.messages || {};
		var lang = root.getAttribute( 'data-pl-pc-lang' ) || config.lang || 'nl';
		var accent = root.getAttribute( 'data-pl-pc-accent' ) || config.accent;
		if ( accent ) {
			root.style.setProperty( '--pl-accent', accent );
		}

		var prefillRaw = root.getAttribute( 'data-pl-prefill-map' );
		var prefillMap = config.prefillMap || {};
		if ( prefillRaw ) {
			try {
				prefillMap = JSON.parse( prefillRaw );
			} catch ( e ) {
				prefillMap = prefillMap;
			}
		}

		root.innerHTML =
			'<form class="pl-pc__form" novalidate>' +
			'<div class="pl-pc__fields">' +
			'<label class="pl-pc__field"><span>' +
			escapeHtml( messages.postcode || 'Postcode' ) +
			'</span><input type="text" name="postcode" autocomplete="postal-code" required /></label>' +
			'<label class="pl-pc__field"><span>' +
			escapeHtml( messages.house || 'House number' ) +
			'</span><input type="text" name="huisnummer" inputmode="numeric" required /></label>' +
			'<label class="pl-pc__field pl-pc__field--wide"><span>' +
			escapeHtml( messages.suffix || 'Suffix' ) +
			'</span><input type="text" name="toevoeging" /></label>' +
			'</div>' +
			'<button type="submit" class="pl-pc__submit">' +
			escapeHtml( messages.lookup || 'Look up' ) +
			'</button></form>' +
			'<div class="pl-pc__status" role="status" aria-live="polite"></div>' +
			'<div class="pl-pc__candidates" hidden></div>' +
			'<div class="pl-pc__card-host" hidden></div>';

		var form = root.querySelector( '.pl-pc__form' );
		var statusEl = root.querySelector( '.pl-pc__status' );
		var candidatesEl = root.querySelector( '.pl-pc__candidates' );
		var cardHost = root.querySelector( '.pl-pc__card-host' );

		function setStatus( text, type ) {
			statusEl.textContent = text || '';
			statusEl.className = 'pl-pc__status' + ( type ? ' pl-pc__status--' + type : '' );
		}

		function readForm() {
			var data = new FormData( form );
			return {
				postcode: data.get( 'postcode' ),
				huisnummer: data.get( 'huisnummer' ),
				toevoeging: data.get( 'toevoeging' ),
				lang: lang,
			};
		}

		function runLookup( payload ) {
			setStatus( messages.loading || '…', 'info' );
			cardHost.hidden = true;
			candidatesEl.hidden = true;

			return requestCard( payload ).then( function ( result ) {
				if ( result.ok && result.body && result.body.success ) {
					setStatus( '', '' );
					renderCard( cardHost, result.body.card );
					applyPrefill( result.body.fields, prefillMap );
					return;
				}

				var code = result.body && result.body.code ? String( result.body.code ).replace( /^pandlens_/, '' ) : '';
				var data = result.body && result.body.data ? result.body.data : {};
				if ( ! code && data.error ) {
					code = data.error;
				}

				if ( code === 'address_ambiguous' && data.candidates ) {
					candidatesEl.innerHTML = '';
					var intro = document.createElement( 'p' );
					intro.textContent = messages.ambiguous || 'Choose:';
					candidatesEl.appendChild( intro );
					data.candidates.forEach( function ( candidate ) {
						var btn = document.createElement( 'button' );
						btn.type = 'button';
						btn.className = 'pl-pc__candidate';
						var parts = [];
						if ( candidate.huisletter ) {
							parts.push( candidate.huisletter );
						}
						if ( candidate.toevoeging ) {
							parts.push( candidate.toevoeging );
						}
						btn.textContent = parts.length ? parts.join( ' / ' ) : '—';
						btn.addEventListener( 'click', function () {
							var base = readForm();
							base.huisletter = candidate.huisletter || base.huisletter;
							base.toevoeging = candidate.toevoeging || base.toevoeging;
							runLookup( base );
						} );
						candidatesEl.appendChild( btn );
					} );
					candidatesEl.hidden = false;
					setStatus( '', '' );
					return;
				}

				var message = ( result.body && result.body.message ) || messages.notFound || 'Error';
				if ( code === 'monthly_quota_exceeded' || result.status === 402 ) {
					message = messages.quota || message;
				} else if ( code === 'rate_limit_exceeded' || result.status === 429 ) {
					message = messages.rateLimit || message;
				}
				setStatus( message, 'error' );
			} );
		}

		form.addEventListener( 'submit', function ( event ) {
			event.preventDefault();
			runLookup( readForm() );
		} );
	}

	document.addEventListener( 'DOMContentLoaded', function () {
		document.querySelectorAll( '[data-pl-pc-root="1"]' ).forEach( mountRoot );
	} );
} )();
