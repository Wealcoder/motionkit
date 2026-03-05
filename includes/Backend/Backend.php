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
		add_filter('page_row_actions', [$this, 'add_custom_quick_link'], 10, 2);
		add_filter('post_row_actions', [$this, 'add_custom_quick_link'], 10, 2);
	}

	function add_custom_quick_link($actions, $post)
	{
		if (! (current_user_can('manage_options'))) {
			return $actions;
		}
		// Ensure this only applies to pages , posts
		if ($post->post_type === 'page' || $post->post_type === 'post') {
			$editor_url = apply_filters('motionkit/editor/url', add_query_arg(array(
				'site' => get_the_permalink($post->ID),
			), 'https://editor.motionkit.io/'));

			$actions['wcfanimb_action'] = '<a target="_blank" href="' . esc_url($editor_url) . '">' . esc_html__('Build Animation', 'motionkit') . '</a>';
		}

		return $actions;
	}

	/**
	 * Enqueue admin scripts and styles
	 *
	 * @param string $hook The current admin page hook
	 * @return void
	 */
	public function enqueue_admin_assets(string $hook): void {}

	/**
	 * Get asset loader instance
	 *
	 * @return AssetLoader Asset loader instance
	 */
	public function get_asset_loader(): AssetLoader
	{
		return $this->asset_loader;
	}
	
}
