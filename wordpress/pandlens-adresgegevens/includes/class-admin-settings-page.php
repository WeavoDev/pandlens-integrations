<?php
/**
 * Settings screen under Settings → Pandlens Adresgegevens.
 *
 * @package Pandlens\Adresgegevens
 */

declare(strict_types=1);

namespace Pandlens\Adresgegevens;

/**
 * Admin UI for API key and integration defaults.
 */
class Admin_Settings_Page {

	private Settings $settings;

	private Api_Client $api_client;

	public function __construct( Settings $settings, Api_Client $api_client ) {
		$this->settings   = $settings;
		$this->api_client = $api_client;
	}

	public function register_menu(): void {
		add_options_page(
			__( 'Pandlens Adresgegevens', 'pandlens-adresgegevens' ),
			__( 'Pandlens Adresgegevens', 'pandlens-adresgegevens' ),
			'manage_options',
			'pandlens-adresgegevens',
			array( $this, 'render_page' )
		);
	}

	public function register_settings(): void {
		register_setting(
			'pandlens_adresgegevens',
			Settings::OPTION_KEY,
			array(
				'type'              => 'array',
				'sanitize_callback' => array( $this->settings, 'sanitize' ),
				'default'           => array(),
			)
		);
	}

	public function enqueue_scripts( string $hook ): void {
		if ( 'settings_page_pandlens-adresgegevens' !== $hook ) {
			return;
		}

		wp_enqueue_style(
			'pandlens-adresgegevens-admin',
			PANDLENS_ADRESGEGEVENS_PLUGIN_URL . 'assets/css/admin.css',
			array(),
			PANDLENS_ADRESGEGEVENS_VERSION
		);

		wp_enqueue_script(
			'pandlens-adresgegevens-admin',
			PANDLENS_ADRESGEGEVENS_PLUGIN_URL . 'assets/js/admin.js',
			array( 'jquery' ),
			PANDLENS_ADRESGEGEVENS_VERSION,
			true
		);

		wp_localize_script(
			'pandlens-adresgegevens-admin',
			'PandlensAdresgegevensAdmin',
			array(
				'ajaxUrl' => admin_url( 'admin-ajax.php' ),
				'nonce'   => wp_create_nonce( 'pandlens_adresgegevens_admin' ),
				'strings' => array(
					'testing' => __( 'Testing connection…', 'pandlens-adresgegevens' ),
					'success' => __( 'Connected to Pandlens.', 'pandlens-adresgegevens' ),
					'failed'  => __( 'Connection failed.', 'pandlens-adresgegevens' ),
				),
			)
		);
	}

	public function render_page(): void {
		if ( ! current_user_can( 'manage_options' ) ) {
			return;
		}

		$options = $this->settings->all();
		?>
		<div class="wrap pl-ag-admin">
			<h1><?php echo esc_html__( 'Pandlens Adresgegevens', 'pandlens-adresgegevens' ); ?></h1>
			<p><?php echo esc_html__( 'Autofill Dutch address and building fields in your forms using the Pandlens API. Your API key stays on the server; visitors never see it.', 'pandlens-adresgegevens' ); ?></p>

			<form method="post" action="options.php">
				<?php settings_fields( 'pandlens_adresgegevens' ); ?>

				<table class="form-table" role="presentation">
					<tr>
						<th scope="row"><label for="pl-ag-api-key"><?php echo esc_html__( 'API key', 'pandlens-adresgegevens' ); ?></label></th>
						<td>
							<input type="password" class="regular-text" id="pl-ag-api-key" name="<?php echo esc_attr( Settings::OPTION_KEY ); ?>[api_key]" value="<?php echo esc_attr( (string) $options['api_key'] ); ?>" autocomplete="off" />
							<p class="description">
								<?php
								printf(
									/* translators: %s: signup URL */
									wp_kses_post( __( 'Create a free key at <a href="%s" target="_blank" rel="noopener noreferrer">pandlens.nl/signup</a>.', 'pandlens-adresgegevens' ) ),
									esc_url( 'https://pandlens.nl/signup' )
								);
								?>
							</p>
						</td>
					</tr>
					<tr>
						<th scope="row"><label for="pl-ag-rate-limit"><?php echo esc_html__( 'Lookups per minute (site proxy)', 'pandlens-adresgegevens' ); ?></label></th>
						<td>
							<input type="number" min="1" max="120" id="pl-ag-rate-limit" name="<?php echo esc_attr( Settings::OPTION_KEY ); ?>[proxy_rate_limit]" value="<?php echo esc_attr( (string) $options['proxy_rate_limit'] ); ?>" />
						</td>
					</tr>
				</table>

				<h2><?php echo esc_html__( 'Contact Form 7 field names', 'pandlens-adresgegevens' ); ?></h2>
				<p class="description"><?php echo esc_html__( 'Match your CF7 form field names. Other plugins use their own mapping screens.', 'pandlens-adresgegevens' ); ?></p>
				<table class="form-table" role="presentation">
					<?php
					$cf7_fields = array(
						'cf7_postcode_field'   => __( 'Postcode field', 'pandlens-adresgegevens' ),
						'cf7_huisnummer_field' => __( 'House number field', 'pandlens-adresgegevens' ),
						'cf7_huisletter_field' => __( 'House letter field', 'pandlens-adresgegevens' ),
						'cf7_toevoeging_field' => __( 'Addition field', 'pandlens-adresgegevens' ),
					);
					foreach ( $cf7_fields as $key => $label ) :
						?>
						<tr>
							<th scope="row"><label for="pl-ag-<?php echo esc_attr( $key ); ?>"><?php echo esc_html( $label ); ?></label></th>
							<td>
								<input type="text" class="regular-text" id="pl-ag-<?php echo esc_attr( $key ); ?>" name="<?php echo esc_attr( Settings::OPTION_KEY ); ?>[<?php echo esc_attr( $key ); ?>]" value="<?php echo esc_attr( (string) $options[ $key ] ); ?>" />
							</td>
						</tr>
					<?php endforeach; ?>
				</table>

				<?php submit_button(); ?>
			</form>

			<hr />
			<h2><?php echo esc_html__( 'Connection test', 'pandlens-adresgegevens' ); ?></h2>
			<p>
				<button type="button" class="button button-secondary" id="pl-ag-test-connection"><?php echo esc_html__( 'Test Pandlens connection', 'pandlens-adresgegevens' ); ?></button>
			</p>
			<div id="pl-ag-test-result" class="pl-ag-admin__test-result" aria-live="polite"></div>
		</div>
		<?php
	}

	public function ajax_test_connection(): void {
		check_ajax_referer( 'pandlens_adresgegevens_admin', 'nonce' );

		if ( ! current_user_can( 'manage_options' ) ) {
			wp_send_json_error( array( 'message' => __( 'Forbidden.', 'pandlens-adresgegevens' ) ), 403 );
		}

		try {
			$usage = $this->api_client->get_usage();
			wp_send_json_success(
				array(
					'plan'      => $usage['plan'] ?? '',
					'used'      => $usage['usedThisMonth'] ?? 0,
					'remaining' => $usage['remainingThisMonth'] ?? null,
					'quota'     => $usage['monthlyQuota'] ?? null,
					'month'     => $usage['month'] ?? '',
				)
			);
		} catch ( Api_Exception $exception ) {
			$payload = array(
				'message' => $exception->getMessage(),
				'error'   => $exception->get_error_slug(),
			);
			if ( 'unauthorized' === $exception->get_error_slug() ) {
				$payload['signup_url'] = 'https://pandlens.nl/signup';
			}
			wp_send_json_error( $payload, $exception->http_status() );
		}
	}
}
