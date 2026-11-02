<?php
/**
 * Plugin bootstrap.
 *
 * @package Pandlens\Adresgegevens
 */

declare(strict_types=1);

namespace Pandlens\Adresgegevens;

/**
 * Main plugin orchestrator.
 */
final class Plugin {

	private static ?Plugin $instance = null;

	private Settings $settings;

	private Api_Client $api_client;

	private Rest_Controller $rest;

	private Frontend_Assets $frontend_assets;

	private Shortcode $shortcode;

	private Block $block;

	private Admin_Settings_Page $admin_page;

	private function __construct() {
		$this->settings        = new Settings();
		$this->api_client      = new Api_Client( $this->settings );
		$this->rest            = new Rest_Controller( $this->api_client );
		$this->frontend_assets = new Frontend_Assets();
		$this->shortcode       = new Shortcode( $this->frontend_assets );
		$this->block           = new Block( $this->frontend_assets );
		$this->admin_page      = new Admin_Settings_Page( $this->settings, $this->api_client );
	}

	public static function instance(): Plugin {
		if ( null === self::$instance ) {
			self::$instance = new self();
		}

		return self::$instance;
	}

	public function init(): void {
		add_action( 'init', array( $this, 'load_textdomain' ) );
		add_action( 'init', array( $this->rest, 'register_routes' ) );
		add_action( 'init', array( $this->shortcode, 'register' ) );
		add_action( 'init', array( $this->block, 'register' ) );
		add_action( 'admin_menu', array( $this->admin_page, 'register_menu' ) );
		add_action( 'admin_init', array( $this->admin_page, 'register_settings' ) );
		add_action( 'admin_enqueue_scripts', array( $this->admin_page, 'enqueue_scripts' ) );
		add_action( 'wp_ajax_pandlens_adresgegevens_test_connection', array( $this->admin_page, 'ajax_test_connection' ) );

		Integrations\Gravity_Forms_Addon::register( $this->frontend_assets );
		Integrations\Contact_Form_7::register( $this->frontend_assets );
		Integrations\Wpforms::register( $this->frontend_assets );
		Integrations\Elementor_Forms::register( $this->frontend_assets );
	}

	public function load_textdomain(): void {
		load_plugin_textdomain(
			'pandlens-adresgegevens',
			false,
			dirname( plugin_basename( PANDLENS_ADRESGEGEVENS_PLUGIN_FILE ) ) . '/languages'
		);
	}

	public function settings(): Settings {
		return $this->settings;
	}

	public function api_client(): Api_Client {
		return $this->api_client;
	}
}
