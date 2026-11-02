( function () {
	'use strict';

	var cfg = window.PandlensAdresgegevens || {};
	var extra = window.PandlensAdresgegevensExtra || {};

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

	function requestLookup( payload ) {
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

	function showMessage( root, message, type ) {
		var el = root.querySelector( '.pl-ag__message' );
		if ( ! el ) {
			return;
		}
		el.textContent = message || '';
		el.className = 'pl-ag__message' + ( type ? ' pl-ag__message--' + type : '' );
	}

	function renderResults( root, fields, showResults ) {
		var box = root.querySelector( '.pl-ag__results' );
		if ( ! box ) {
			return;
		}
		if ( ! showResults || showResults === 'no' ) {
			box.hidden = true;
			return;
		}
		var labels = mergeConfig().labels || {};
		var html = '<dl>';
		Object.keys( fields ).forEach( function ( key ) {
			if ( ! fields[ key ] ) {
				return;
			}
			html += '<dt>' + escapeHtml( labels[ key ] || key ) + '</dt>';
			html += '<dd>' + escapeHtml( fields[ key ] ) + '</dd>';
		} );
		html += '</dl>';
		box.innerHTML = html;
		box.hidden = false;
	}

	function escapeHtml( value ) {
		return String( value )
			.replace( /&/g, '&amp;' )
			.replace( /</g, '&lt;' )
			.replace( />/g, '&gt;' )
			.replace( /"/g, '&quot;' );
	}

	function renderCandidates( root, candidates, onPick ) {
		var box = root.querySelector( '.pl-ag__candidates' );
		if ( ! box ) {
			return;
		}
		box.innerHTML = '';
		if ( ! candidates || ! candidates.length ) {
			box.hidden = true;
			return;
		}
		var config = mergeConfig();
		var label = ( config.messages && config.messages.ambiguous ) || 'Choose:';
		var p = document.createElement( 'p' );
		p.textContent = label;
		box.appendChild( p );
		candidates.forEach( function ( candidate ) {
			var btn = document.createElement( 'button' );
			btn.type = 'button';
			btn.className = 'button pl-ag__candidate';
			btn.textContent = formatCandidate( candidate );
			btn.addEventListener( 'click', function () {
				onPick( candidate );
			} );
			box.appendChild( btn );
		} );
		box.hidden = false;
	}

	function formatCandidate( candidate ) {
		var parts = [];
		if ( candidate.huisletter ) {
			parts.push( candidate.huisletter );
		}
		if ( candidate.toevoeging ) {
			parts.push( candidate.toevoeging );
		}
		return parts.length ? parts.join( ' / ' ) : '—';
	}

	function handleError( root, status, body ) {
		var config = mergeConfig();
		var messages = config.messages || {};
		var code = body && body.code ? String( body.code ).replace( /^pandlens_/, '' ) : '';
		var data = body && body.data ? body.data : {};
		if ( ! code && data.error ) {
			code = data.error;
		}

		if ( code === 'address_ambiguous' && data.candidates ) {
			return { ambiguous: true, candidates: data.candidates };
		}

		var message = ( body && body.message ) || messages.notFound || 'Error';
		if ( code === 'monthly_quota_exceeded' || status === 402 ) {
			message = messages.quota || message;
		} else if ( code === 'rate_limit_exceeded' || status === 429 ) {
			message = messages.rateLimit || message;
		} else if ( code === 'unauthorized' || status === 401 ) {
			message = messages.unauthorized || message;
		} else if ( code === 'address_not_found' ) {
			message = messages.notFound || message;
		}

		showMessage( root, message, 'error' );
		return { ambiguous: false };
	}

	function fillMappedFields( fields, mapping, formId ) {
		Object.keys( mapping ).forEach( function ( key ) {
			var target = mapping[ key ];
			var value = fields[ key ];
			if ( value == null || value === '' ) {
				return;
			}
			if ( typeof target === 'number' || ( typeof target === 'string' && /^[0-9]+$/.test( target ) ) ) {
				var input = document.getElementById( 'input_' + formId + '_' + target );
				if ( input ) {
					input.value = value;
					input.dispatchEvent( new Event( 'change', { bubbles: true } ) );
				}
				return;
			}
			if ( typeof target === 'string' ) {
				var byName = document.querySelector( '[name="' + target + '"]' );
				if ( byName ) {
					byName.value = value;
					byName.dispatchEvent( new Event( 'change', { bubbles: true } ) );
				}
			}
		} );
	}

	function bindShortcodeRoot( root ) {
		var submit = root.querySelector( '.pl-ag__submit' );
		if ( ! submit ) {
			return;
		}

		function readInputs() {
			return {
				postcode: ( root.querySelector( '.pl-ag__postcode' ) || {} ).value || '',
				huisnummer: ( root.querySelector( '.pl-ag__huisnummer' ) || {} ).value || '',
				huisletter: ( root.querySelector( '.pl-ag__huisletter' ) || {} ).value || '',
				toevoeging: ( root.querySelector( '.pl-ag__toevoeging' ) || {} ).value || '',
			};
		}

		function runLookup( payload ) {
			var config = mergeConfig();
			showMessage( root, config.messages.loading || '…', 'info' );
			renderCandidates( root, [], function () {} );

			return requestLookup( payload ).then( function ( result ) {
				if ( result.ok && result.body && result.body.success ) {
					showMessage( root, '', '' );
					renderResults( root, result.body.fields, root.getAttribute( 'data-pl-ag-show-results' ) );
					return;
				}

				var err = handleError( root, result.status, result.body );
				if ( err.ambiguous ) {
					renderCandidates( root, err.candidates, function ( candidate ) {
						var base = readInputs();
						base.huisletter = candidate.huisletter || base.huisletter;
						base.toevoeging = candidate.toevoeging || base.toevoeging;
						runLookup( base );
					} );
				}
			} );
		}

		submit.addEventListener( 'click', function () {
			runLookup( readInputs() );
		} );
	}

	function initCf7() {
		var config = mergeConfig();
		if ( config.mode !== 'cf7' || ! config.inputs ) {
			return;
		}

		document.querySelectorAll( 'form[data-pl-ag-cf7="1"]' ).forEach( function ( form ) {
			var hn = form.querySelector( '[name="' + config.inputs.huisnummer + '"]' );
			if ( ! hn ) {
				return;
			}
			hn.addEventListener( 'change', function () {
				var payload = {
					postcode: ( form.querySelector( '[name="' + config.inputs.postcode + '"]' ) || {} ).value || '',
					huisnummer: hn.value || '',
					huisletter: ( form.querySelector( '[name="' + config.inputs.huisletter + '"]' ) || {} ).value || '',
					toevoeging: ( form.querySelector( '[name="' + config.inputs.toevoeging + '"]' ) || {} ).value || '',
				};
				requestLookup( payload ).then( function ( result ) {
					if ( result.ok && result.body && result.body.success && config.fieldMap ) {
						fillMappedFields( result.body.fields, config.fieldMap, 0 );
					}
				} );
			} );
		} );
	}

	function fieldValue( formId, fieldId ) {
		if ( ! fieldId ) {
			return '';
		}
		var input = document.getElementById( 'input_' + formId + '_' + fieldId );
		return input ? input.value : '';
	}

	function initGravityForms() {
		var config = mergeConfig();
		if ( config.mode !== 'gravityforms' || ! config.fieldMap || ! config.formId ) {
			return;
		}

		var inputs = config.inputs || {};
		var triggerId = config.triggerField || inputs.huisnummer;
		var trigger = document.getElementById( 'input_' + config.formId + '_' + triggerId );
		if ( ! trigger ) {
			return;
		}

		trigger.addEventListener( 'change', function () {
			var payload = {
				postcode: fieldValue( config.formId, inputs.postcode ),
				huisnummer: fieldValue( config.formId, inputs.huisnummer ) || trigger.value,
				huisletter: fieldValue( config.formId, inputs.huisletter ),
				toevoeging: fieldValue( config.formId, inputs.toevoeging ),
			};
			requestLookup( payload ).then( function ( result ) {
				if ( result.ok && result.body && result.body.success ) {
					fillMappedFields( result.body.fields, config.fieldMap, config.formId );
				}
			} );
		} );
	}

	function initGeneric() {
		document.querySelectorAll( '[data-pl-ag-root="1"]' ).forEach( bindShortcodeRoot );
	}

	document.addEventListener( 'DOMContentLoaded', function () {
		initGeneric();
		initCf7();
		initGravityForms();
	} );
} )();
