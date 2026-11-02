( function ( wp ) {
	if ( ! wp || ! wp.blocks ) {
		return;
	}

	var registerBlockType = wp.blocks.registerBlockType;
	var createElement = wp.element.createElement;
	var useBlockProps = wp.blockEditor.useBlockProps;
	var InspectorControls = wp.blockEditor.InspectorControls;
	var PanelBody = wp.components.PanelBody;
	var ToggleControl = wp.components.ToggleControl;

	registerBlockType( 'pandlens/adres-opzoeken', {
		edit: function ( props ) {
			var blockProps = useBlockProps( { className: 'pl-ag-block-editor' } );

			return createElement(
				'div',
				blockProps,
				createElement(
					InspectorControls,
					null,
					createElement(
						PanelBody,
						{ title: 'Pandlens' },
						createElement( ToggleControl, {
							label: 'Show lookup results on the page',
							checked: props.attributes.showResults,
							onChange: function ( value ) {
								props.setAttributes( { showResults: value } );
							},
						} )
					)
				),
				createElement( 'p', null, 'Adres opzoeken (Pandlens)' ),
				createElement( 'p', null, 'Postcode + house number lookup appears here on the site.' )
			);
		},
		save: function () {
			return null;
		},
	} );
} )( window.wp );
