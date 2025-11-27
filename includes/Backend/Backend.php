<?php

namespace WcfAnimationBuilder\Backend;

/**
 * Backend Class
 *
 * @package WcfAnimationBuilder
 * @since 1.0.0
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

use WcfAnimationBuilder\Common\Assets\AssetLoader;
use WcfAnimationBuilder\Factory\ComponentFactory;
use WcfAnimationBuilder\Decorator\ConditionalAssetLoaderDecorator;

/**
 * Backend Class
 *
 * Handles all admin functionality for the plugin.
 */
final class Backend
{
    /**
     * Asset loader instance
     *
     * @var AssetLoader
     */
    private AssetLoader $asset_loader;

    /**
     * Initialize backend functionality
     *
     * @return void
     */
    public function init(): void
    {
        $this->asset_loader = ComponentFactory::create_asset_loader();
        $this->init_hooks();
    }

    /**
     * Initialize hooks
     *
     * @return void
     */
    private function init_hooks(): void
    {
        // Add admin hooks here
        add_action('admin_enqueue_scripts', [$this, 'enqueue_admin_assets']);
        add_action('admin_menu', [$this, 'add_admin_menu'],30);
        add_filter('show_admin_bar', array($this, 'hide_admin_bar_for_iframe'));
        add_action('admin_head', array($this, 'remove_notice_for_setting_page'));	
        add_action('wp_ajax_aae_save_anim_builder_settings', array($this, 'save_dashboard_settings'));	
        add_filter('page_row_actions', [$this, 'add_custom_quick_link'], 10, 2);
		add_filter('post_row_actions', [$this, 'add_custom_quick_link'], 10, 2);
    }

    function add_custom_quick_link($actions, $post)
	{
		if ( ! ( current_user_can( 'manage_options' ) ) ){
			return $actions;	
		}
		// Ensure this only applies to pages , posts
		if ($post->post_type === 'page' || $post->post_type === 'post') {
			$permalink_structure = get_option('permalink_structure');

			if ($permalink_structure) {
				$animation_builder_url = home_url('/aae-animation-builder/');
			} else {
				$animation_builder_url = home_url('/');
				$animation_builder_url = add_query_arg(array(
					'aae_builder' => 1,
				), $animation_builder_url);
			}

			$editor_url            = apply_filters('wcfanimationbuilder/editor/url', add_query_arg(array(
				'builder_url' => get_the_permalink($post->ID),
			), $animation_builder_url));

			$actions['wcfanimb_action'] = '<a target="_blank" href="' . esc_url($editor_url) . '">' . esc_html__('Build Animation', 'gsap-animation-builder-for-wordpress') . '</a>';
		}

		return $actions;
	}

    public function save_dashboard_settings()
	{

		check_ajax_referer('wcf_admin_nonce', 'nonce');

		if (! current_user_can('manage_options')) {
			wp_send_json_error(esc_html__('you are not allowed to do this action', 'gsap-animation-builder-for-wordpress'));
		}

		if (! isset($_POST['form_fields'])) {
			return;
		}

		if (! isset($_POST['setting_name'])) {
			return;
		}

		$form_data    = sanitize_text_field(wp_unslash($_POST['form_fields']));
		$setting_name = sanitize_text_field(wp_unslash($_POST['setting_name']));
		update_option($setting_name, $form_data);

		$data   = json_decode($form_data, true);
		$counts = $this->count_total_and_active_elements($data);

		$return_message = array(
			'message' => 'Settings Updated',
			'count'   => array(
				'total'  => $counts['total'],
				'active' => $counts['active'],
			),
		);
		wp_send_json($return_message);
	}

    /**
     * Enqueue admin scripts and styles
     *
     * @param string $hook The current admin page hook
     * @return void
     */
    public function enqueue_admin_assets(string $hook): void
    {         
     
    }

    function hide_admin_bar_for_iframe($show_admin_bar)
	{
		// Check if the 'iframe' query parameter is set
		if ($this->is_edit_mode()) {
			return false; // Disable admin bar
		}
		return $show_admin_bar;
	}     
    
    /**
     * Get asset loader instance
     *
     * @return AssetLoader Asset loader instance
     */
    public function get_asset_loader(): AssetLoader
    {
        return $this->asset_loader;
    }

    /**
     * Add admin menu
     *
     * @return void
     */
    public function add_admin_menu(): void
    {
       //add menu page	
		add_menu_page(
			esc_html__('Animation Builder', 'gsap-animation-builder-for-wordpress'),
			esc_html__('Animation Builder', 'gsap-animation-builder-for-wordpress'),
			'manage_options',
			'aae-anim-builder',
			array($this, 'setting_render'),
			'dashicons-admin-generic', // icon
			59 // position
		);
		
    }

    public function remove_notice_for_setting_page()
	{
	
		$page = isset($_GET['page']) ? sanitize_key($_GET['page']) : '';
		$php_self = isset($_SERVER['PHP_SELF']) ? sanitize_text_field(wp_unslash($_SERVER['PHP_SELF'])) : '';

		$is_builder_screen = (
			in_array($page, ['aae-anim-builder', 'aae-page-importer'], true)
			&& strpos($php_self, 'admin.php') !== false
		);


		if ($is_builder_screen) {

			remove_all_actions('admin_notices');
			remove_all_actions('all_admin_notices');
			remove_all_actions('network_admin_notices');
			remove_all_actions('user_admin_notices');
			remove_all_actions('update_nag');
		}
	}

    /**
	 * Render submenu
	 *
	 * Outputs the submenu content.
	 */
	public function setting_render()
	{

		echo '<div class="wrap">';
		echo '<div id="aae-anim-builder">Loading...</div>';
		echo '<div id="aae-anim-builder--toast"></div>';
		echo '</div>';
	}
}

