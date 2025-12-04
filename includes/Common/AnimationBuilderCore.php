<?php

namespace WcfAnimationBuilder\Common;

use WcfAnimationBuilder\Traits\AnimationBuilderTrait;

if (! defined('ABSPATH')) {
	exit; // Exit if accessed directly
}

class AnimationBuilderCore
{
	use AnimationBuilderTrait;
	/**
	 * Instance
	 *
	 * @since 1.0.0
	 * @access private
	 * @static
	 *
	 * @var Plugin The single instance of the class.
	 */
	private static $instance = null;

	public $page_type = null;
	/**
	 * Instance
	 *
	 * Ensures only one instance of the class is loaded or can be loaded.
	 *
	 * @return Plugin An instance of the class.
	 * @since 1.2.0
	 * @access public
	 */
	public static function instance()
	{
		if (is_null(self::$instance)) {
			self::$instance = new self();
		}

		return self::$instance;
	}

	/**
     * Initialize compatibility checks
     *
     * @return void
     */
    public function init(): void
    {
        $this->init_hooks();

    }

	/**
	 *  Plugin class constructor
	 *
	 * Register plugin action hooks and filters
	 *
	 * @since 1.2.0
	 * @access public
	 */
	public function init_hooks()
	{

		add_action('admin_bar_menu', [$this, 'button_interface'], 500);
		add_action('init', [$this, 'custom_rewrite_rules']);
		add_filter('query_vars', [$this, 'custom_query_vars']);
		add_action('template_redirect', [$this, 'animation_builder_template_redirect']);
		add_action('wp_enqueue_scripts', [$this, 'config_enqueue_script'], 60);

		add_action('wp_ajax_wcf_anim_builder_configs_store', [$this, 'configs_store']);
		add_action('wp_ajax_wcf_anim_builder_configs_delete', [$this, 'configs_delete']);

		//editor
		 $this->page_type = AnimationBuilderPageType::instance();
		 $builder = AnimationBuilderEditor::instance();
		 $builder->setPageType($this->page_type);
	}


	public function configs_store()
	{
		// Verify nonce
		check_ajax_referer('wcf-admin-preview-nonce', 'wcf_nonce');

		// Check user permissions
		if (!current_user_can('manage_options')) {
			wp_send_json_error(['msg' => esc_html__('Unauthorized access', 'gsap-animation-builder-for-wordpress')], 403);
		}

		// Get and sanitize the JSON data
		$pageTypeConfigs = isset($_POST['pageTypeConfigs']) ? sanitize_text_field( wp_unslash($_POST['pageTypeConfigs']) ) : '';
		$animationConfigs = isset($_POST['animationConfigs']) ? sanitize_text_field( wp_unslash($_POST['animationConfigs']) ): '';

		// Validate JSON structure
		if (empty($pageTypeConfigs) || empty($animationConfigs)) {
			wp_send_json_error(['msg' => esc_html__('Missing configuration data', 'gsap-animation-builder-for-wordpress')], 400);
		}

		// Decode JSON and check for errors
		$pageTypeConfigs = json_decode($pageTypeConfigs, true);
		$animationConfigs = json_decode($animationConfigs, true);

		if (json_last_error() !== JSON_ERROR_NONE) {
			wp_send_json_error(['msg' => esc_html__('Invalid JSON format', 'gsap-animation-builder-for-wordpress')], 400);
		}

		// Further validation on the decoded data to ensure expected structure
		if (!is_array($pageTypeConfigs) || !is_array($animationConfigs)) {
			wp_send_json_error(['msg' => esc_html__('Invalid configuration structure', 'gsap-animation-builder-for-wordpress')], 400);
		}

		// Save configurations
		$this->page_type->saveConfig($pageTypeConfigs, $animationConfigs);
		wp_send_json_success(['msg' => esc_html__('Configurations updated successfully', 'gsap-animation-builder-for-wordpress'), 'configs' => $animationConfigs]);
	}
	public function configs_delete()
	{
		// Verify nonce
		check_ajax_referer('wcf-admin-preview-nonce', 'wcf_nonce');

		// Check user permissions
		if (!current_user_can('manage_options')) {
			wp_send_json_error(['msg' => esc_html__('Unauthorized access', 'gsap-animation-builder-for-wordpress')], 403);
		}

		// Get and sanitize the JSON data
		$pageTypeConfigs = isset($_POST['pageTypeConfigs']) ? sanitize_text_field( wp_unslash($_POST['pageTypeConfigs']) ): '';

		// Validate JSON structure
		if (empty($pageTypeConfigs)) {
			wp_send_json_error(['msg' => esc_html__('Missing configuration data', 'gsap-animation-builder-for-wordpress')], 400);
		}

		// Decode JSON and check for errors
		$pageTypeConfigs = json_decode($pageTypeConfigs, true);

		if (json_last_error() !== JSON_ERROR_NONE) {
			wp_send_json_error(['msg' => esc_html__('Invalid Json Format', 'gsap-animation-builder-for-wordpress')], 400);
		}

		// Further validation on the decoded data
		if (!is_array($pageTypeConfigs)) {
			wp_send_json_error(['msg' => esc_html__('Invalid configuration structure', 'gsap-animation-builder-for-wordpress')], 400);
		}
		// Delete configurations
		$this->page_type->deleteConfig($pageTypeConfigs);

		wp_send_json_success(['msg' => esc_html__('Configurations deleted successfully', 'gsap-animation-builder-for-wordpress')]);
	}

	public function config_enqueue_script()
	{

		if (isset($_GET['action']) && sanitize_text_field( wp_unslash($_GET['action']) ) == 'animation-builder') {
			wp_enqueue_style('wcf-animbuilder-class-selector');
		}

		if (isset($_GET['action']) && sanitize_text_field( wp_unslash($_GET['action']) ) == 'animation-builder') {

			$deps = $this->register_builder_dependency();

			wp_enqueue_style(
				'aae-animation-builder-preview',
				WCF_ANIMATION_BUILDER_PLUGIN_URL . 'assets/build/modules/animation-builder/preview.css'
			);
			wp_register_script('wcf-animation-builder-preview', WCF_ANIMATION_BUILDER_PLUGIN_URL . '/assets/build/modules/animation-builder/preview.js', $deps, time(), true);
			wp_enqueue_script('wcf-animation-builder-preview');

			wp_register_script('wcf-custom-animation', WCF_ANIMATION_BUILDER_PLUGIN_URL . '/assets/build/modules/animation-builder/frontend/customAnimation.js', $deps, time(), true);
			wp_enqueue_script('wcf-custom-animation');

       	$config          = include plugin_dir_path(__FILE__) . '/configs/animation-builder-assets.php'; // adjust path
        $active_elements = $this->get_active_element_keys("wcf_anim_builder_free_animation_settings");
        if (is_array($active_elements) && is_array($config)) {
          foreach ($active_elements as $key) {
            if (isset($config['js'][$key])) {
              $element = $config['js'][$key];
              wp_enqueue_script($key, $element['src'], $element['deps'], WCF_ANIMATION_BUILDER_VERSION, true);
            }
          }
        }

			do_action('wcf_animation_builder/frontend/presets/enqueue_element_scripts');


			$config = include plugin_dir_path(__FILE__) . 'configs/animation-builder-device.php'; // adjust path

			// sanitize / normalize
			$devices = array_map(function ($d) {
				return [
					'key'        => sanitize_key($d['key']),
					'title'      => wp_strip_all_tags($d['title']),
					'viewWidth'  => esc_attr($d['viewWidth']),
					'mediaQuery' => wp_strip_all_tags($d['mediaQuery']),
				];
			}, $config);


			wp_localize_script(
				'wcf-animation-builder-preview',
				'wcf_anim_preview_object',
				array(
					'ajaxurl'          => admin_url('admin-ajax.php'),
					'type'             => 'wcf-animation-builder',
					'nonce'            => wp_create_nonce('wcf-admin-preview-nonce'),
					'animation_config' => is_array($this->page_type->getConfig()) ? $this->page_type->getConfig() : [],
					'pageTypeConfigs'  => $this->page_type->getCurrentPageType(),
					'device_config'    => $devices,
				)
			);
		} else {

			if (is_user_logged_in()) {

				$custom_css = "
					#wpadminbar ul li.wcf--admin--animation--builder--button {
						background-color:hsl(13 97% 64%);
					}
					#wpadminbar:not(.mobile) .ab-top-menu>li.wcf--admin--animation--builder--button:hover>.ab-item,
					#wpadminbar ul li.wcf--admin--animation--builder--button:hover{
						background-color:hsl(13 97% 64%);
						opacity: 0.9;
						color: white;
					}
				";

				wp_add_inline_style('admin-bar', $custom_css);
			}

			if ($pageConfigs = $this->page_type->getConfig()) {
				$is_custom = false;
				$this->getActivePresets($pageConfigs, $is_custom);

				$deps = $this->register_builder_dependency();
				$deps = array_filter($deps, function($item) {
					return $item !== 'wp-element';
				});

				$deps = array_values($deps);
				
				wp_register_script('wcf-anim-builder-frontend', WCF_ANIMATION_BUILDER_PLUGIN_URL . 'assets/build/modules/animation-builder/frontend.js', $deps, time(), true);
				wp_enqueue_script('wcf-anim-builder-frontend');

				wp_register_script('wcf-custom-animation', WCF_ANIMATION_BUILDER_PLUGIN_URL . 'assets/build/modules/animation-builder/frontend/customAnimation.js', $deps, time(), true);
				if ($is_custom) {
					wp_enqueue_script('wcf-custom-animation');
				}
        $config          = include plugin_dir_path(__FILE__) . '/configs/animation-builder-assets.php'; // adjust path
        $active_elements = $this->get_active_element_keys("wcf_anim_builder_free_animation_settings");
        if (is_array($active_elements) && is_array($config)) {
          foreach ($active_elements as $key) {
            if (isset($config['js'][$key])) {
              $element = $config['js'][$key];
              wp_enqueue_script($key, $element['src'], $element['deps'], WCF_ANIMATION_BUILDER_VERSION, true);
            }
          }
        }

				do_action('wcf_animation_builder/frontend/presets/enqueue_element_scripts');

				$config = include plugin_dir_path(__FILE__) . 'configs/animation-builder-device.php'; // adjust path

				// sanitize / normalize
				$devices = array_map(function ($d) {
					return [
						'key'        => sanitize_key($d['key']),
						'title'      => wp_strip_all_tags($d['title']),
						'viewWidth'  => esc_attr($d['viewWidth']),
						'mediaQuery' => wp_strip_all_tags($d['mediaQuery']),
					];
				}, $config);

				wp_localize_script(
					'wcf-anim-builder-frontend',
					'wcfanimb',
					[
						'animation_config' => is_array($pageConfigs) ? $pageConfigs : [],
						'device_config'    => $devices,
					]
				);
			}
		}
	}


	public function register_builder_dependency()
	{

		return  apply_filters('wcf_animation_builder_core_lib_deps', ['wp-element']); //
	}
	public function register_editor_scripts()
	{


		if (get_query_var('aae_builder') == 1) {
			// Safely include the template only once
			$template_path = WCF_ANIMATION_BUILDER_PLUGIN_DIR . 'templates/animation-builder-template.php';

			if (file_exists($template_path)) {
				do_action('wcfanimationbuilder/head/enqueue');
			}
		}
	}


	function custom_rewrite_rules()
	{

		add_rewrite_rule(
			'^aae-animation-builder/?$', // Regex to match
			'index.php?aae_builder=1', // Redirect to index.php
			'top'
		);
	}

	function custom_query_vars($vars)
	{
		$vars[] = 'aae_builder';
		return $vars;
	}

	function animation_builder_template_redirect()
	{

		if (is_admin()) {
			return; // Do nothing in the admin area
		}

		if (get_query_var('aae_builder') == 1) {
			// Safely include the template only once
			$template_path = WCF_ANIMATION_BUILDER_PLUGIN_DIR . 'templates/animation-builder-template.php';


			if (file_exists($template_path)) {
				include_once $template_path;
			} else {
				// Optional: Handle the case where the template file is missing
				wp_die('Template file not found!');
			}
			exit; // Prevent WordPress from loading other templates
		}
	}
	function wp_get_current_url() {

		// Detect HTTPS
		$scheme = is_ssl() ? 'https' : 'http';

		// Raw host
		$host = isset( $_SERVER['HTTP_HOST'] )
			? esc_url_raw( wp_unslash( $_SERVER['HTTP_HOST'] ) )
			: '';

		// Just in case the host contains a protocol, strip it
		$host = preg_replace( '#^https?://#i', '', $host );

		// Sanitize request URI as URL part
		$request_uri = isset( $_SERVER['REQUEST_URI'] )
			? esc_url_raw( wp_unslash( $_SERVER['REQUEST_URI'] ) )
			: '';

		// Remove unwanted query args
		$strip = array(
			'preview',
			'preview_id',
			'preview_nonce',
			'aaeid',
		);

		$request_uri = remove_query_arg( $strip, $request_uri );

		// Final URL
		$url = "{$scheme}://{$host}{$request_uri}";

		// esc_url() only when outputting in HTML
		return $url;
	}


	public function button_interface($wp_admin_bar)
	{

		if (is_admin()) {
			return;
		}

		$permalink_structure = get_option('permalink_structure');

		if ($permalink_structure) {
			$animation_builder_url = home_url('/aae-animation-builder/');
		} else {
			$animation_builder_url = home_url('/');
			$animation_builder_url = add_query_arg(array(
				'aae_builder' => 1,
			), $animation_builder_url);
		}

		$editor_url = apply_filters('wcfanimationbuilder/admin/bar/url', add_query_arg(array(
			'builder_url' => $this->wp_get_current_url(),
		), $animation_builder_url));

		if (current_user_can('manage_options')) {
			$args = array(
				'id'    => 'wcf--admin--animation--builder--button', // Unique ID for the button
				'title' => '<svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
						<path d="M7.9608 13.3467L8.619 11.8391C9.20482 10.4975 10.2592 9.42945 11.5744 8.84565L13.3861 8.04143C13.9621 7.78575 13.9621 6.94776 13.3861 6.69208L11.6309 5.91296C10.2819 5.31414 9.20865 4.20661 8.63287 2.81921L7.96612 1.21255C7.7187 0.616324 6.89489 0.616326 6.64747 1.21255L5.9807 2.81919C5.40493 4.20661 4.33165 5.31414 2.98264 5.91296L1.22743 6.69208C0.651402 6.94776 0.651402 7.78575 1.22743 8.04143L3.03922 8.84565C4.35442 9.42945 5.40878 10.4975 5.99456 11.8391L6.6528 13.3467C6.90582 13.9262 7.70775 13.9262 7.9608 13.3467ZM14.551 17.0174L14.7361 16.5932C15.0661 15.8367 15.6605 15.2344 16.4021 14.9049L16.9724 14.6515C17.2809 14.5145 17.2809 14.0662 16.9724 13.9292L16.4341 13.6899C15.6733 13.352 15.0683 12.7274 14.7439 11.9452L14.5539 11.4867C14.4214 11.1672 13.9796 11.1672 13.8471 11.4867L13.657 11.9452C13.3327 12.7274 12.7277 13.352 11.967 13.6899L11.4286 13.9292C11.1202 14.0662 11.1202 14.5145 11.4286 14.6515L11.9989 14.9049C12.7405 15.2344 13.3348 15.8367 13.6648 16.5932L13.85 17.0174C13.9855 17.328 14.4155 17.328 14.551 17.0174Z" fill="white"/>
						</svg>' . esc_html__('Build Animation', 'gsap-animation-builder-for-wordpress'),
				'parent' => 'top-secondary',
				'href'  => esc_url($editor_url),  // The URL the button should link to
				'meta'  => array(
					'class' => 'wcf--admin--animation--builder--button',
					'onclick' => '', // JavaScript action
					'target' => '_blank',
				),
			);

			$wp_admin_bar->add_node($args);
		}
	}
}



