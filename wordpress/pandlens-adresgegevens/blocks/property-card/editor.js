( function ( wp ) {
	var registerBlockType = wp.blocks.registerBlockType;
	var createElement = wp.element.createElement;
	var InspectorControls = wp.blockEditor.InspectorControls;
	var PanelBody = wp.components.PanelBody;
	var SelectControl = wp.components.SelectControl;
	var TextControl = wp.components.TextControl;

	registerBlockType( 'pandlens/property-card', {
		edit: function ( props ) {
			var attributes = props.attributes;
			return createElement(
				'div',
				{ className: 'pl-pc-editor' },
				createElement(
					InspectorControls,
					null,
					createElement(
						PanelBody,
						{ title: 'Pandlens' },
						createElement( SelectControl, {
							label: 'Language',
							value: attributes.lang,
							options: [
								{ label: 'Nederlands', value: 'nl' },
								{ label: 'English', value: 'en' },
							],
							onChange: function ( value ) {
								props.setAttributes( { lang: value } );
							},
						} ),
						createElement( TextControl, {
							label: 'Accent colour (hex)',
							value: attributes.accentColor,
							onChange: function ( value ) {
								props.setAttributes( { accentColor: value } );
							},
						} )
					)
				),
				createElement( 'p', null, 'Pandlens woningkaart (property card)' )
			);
		},
	} );
} )( window.wp );
