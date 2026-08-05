<?php

namespace MotionKit\Backend;

/**
 * Backend Class
 *
 * @package MotionKit
 * @since 1.0.0
 */

// Prevent direct access
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

use MotionKit\Common\Assets\AssetLoader;
use MotionKit\Factory\ComponentFactory;
use MotionKit\Auth\OAuthHandler;
use MotionKit\Auth\JwtTokenManager;

/**
 * Backend Class
 *
 * Handles all admin functionality for the plugin.
 */
final class Backend {

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
	public function init(): void {
		$this->asset_loader = ComponentFactory::create_asset_loader();
		$this->init_hooks();
	}

	/**
	 * Initialize hooks
	 *
	 * @return void
	 */
	private function init_hooks(): void {
		add_action( 'admin_enqueue_scripts', array( $this, 'enqueue_admin_assets' ) );
		add_filter( 'page_row_actions', array( $this, 'add_custom_quick_link' ), 10, 2 );
		add_filter( 'post_row_actions', array( $this, 'add_custom_quick_link' ), 10, 2 );

		// Deferred so custom taxonomies are available.
		add_action( 'admin_init', array( $this, 'register_term_quick_links' ) );
	}

	/**
	 * Register term quick links for all public taxonomies.
	 *
	 * @return void
	 */
	public function register_term_quick_links(): void {
		$taxonomies = get_taxonomies( array( 'public' => true ) );

		foreach ( $taxonomies as $taxonomy ) {
			add_filter( "{$taxonomy}_row_actions", array( $this, 'add_term_quick_link' ), 10, 2 );
		}
	}

	/**
	 * Add "Build Animation" quick link to post/page row actions.
	 *
	 * @param array    $actions Row actions.
	 * @param \WP_Post $post    Current post object.
	 * @return array
	 */
	public function add_custom_quick_link( $actions, $post ) {
		if ( ! current_user_can( 'manage_options' ) ) {
			return $actions;
		}

		$public_types = get_post_types( array( 'public' => true ) );

		if ( ! in_array( $post->post_type, $public_types, true ) ) {
			return $actions;
		}

		$page_url   = get_the_permalink( $post->ID );

		// Always attach a session JWT — even before the site is connected,
		// JwtTokenManager falls back to a local HMAC-signed token, so
		// Frontend::is_editor_preview() can require a valid token
		// unconditionally instead of trusting ?action=motionkit-editor alone.
		$query_args = array(
			'site'            => $page_url,
			'platform'        => 'wordpress',
			'motionkit_token' => JwtTokenManager::generate( $page_url ),
		);

		$editor_url = apply_filters( 'motionkit/editor/url', add_query_arg( $query_args, 'https://editor.motionkit.io/' ) );

		$actions['motionkit_action'] = '<a target="_blank" href="' . esc_url( $editor_url ) . '">' . esc_html__( 'Build Animation', 'motionkit' ) . '</a>';

		return $actions;
	}

	/**
	 * Add "Build Animation" quick link to taxonomy term row actions.
	 *
	 * @param array    $actions Row actions.
	 * @param \WP_Term $term    Current term object.
	 * @return array
	 */
	public function add_term_quick_link( $actions, $term ) {
		if ( ! current_user_can( 'manage_options' ) ) {
			return $actions;
		}

		$page_url = get_term_link( $term );

		if ( is_wp_error( $page_url ) ) {
			return $actions;
		}

		// Always attach a session JWT — see add_custom_quick_link() above.
		$query_args = array(
			'site'            => $page_url,
			'platform'        => 'wordpress',
			'motionkit_token' => JwtTokenManager::generate( $page_url ),
		);

		$editor_url = apply_filters( 'motionkit/editor/url', add_query_arg( $query_args, 'https://editor.motionkit.io/' ) );

		$actions['motionkit_action'] = '<a target="_blank" href="' . esc_url( $editor_url ) . '">' . esc_html__( 'Build Animation', 'motionkit' ) . '</a>';

		return $actions;
	}

	/**
	 * Enqueue admin scripts and styles
	 *
	 * @param string $hook The current admin page hook.
	 * @return void
	 */
	public function enqueue_admin_assets( string $hook ): void {}

	/**
	 * Get asset loader instance
	 *
	 * @return AssetLoader Asset loader instance.
	 */
	public function get_asset_loader(): AssetLoader {
		return $this->asset_loader;
	}
}
