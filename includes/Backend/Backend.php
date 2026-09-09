<?php

namespace MotionKit\Backend;

/**
 * Backend Class
 *
 * @package MotionKit
 * @since 1.0.0
 */

// Prevent direct access
if (!defined('ABSPATH')) {
  exit;
}

use MotionKit\Common\Assets\AssetLoader;
use MotionKit\Factory\ComponentFactory;
use MotionKit\Helpers\Helper;

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
    add_action('admin_enqueue_scripts', [$this, 'enqueue_admin_assets']);
    add_filter('page_row_actions', [$this, 'add_custom_quick_link'], 10, 2);
    add_filter('post_row_actions', [$this, 'add_custom_quick_link'], 10, 2);

    // Deferred so custom taxonomies are available.
    add_action('admin_init', [$this, 'register_term_quick_links']);
  }

  /**
   * Register term quick links for all public taxonomies.
   *
   * @return void
   */
  public function register_term_quick_links(): void
  {
    $taxonomies = get_taxonomies(['public' => true]);

    foreach ($taxonomies as $taxonomy) {
      add_filter("{$taxonomy}_row_actions", [$this, 'add_term_quick_link'], 10, 2);
    }
  }

  /**
   * Add "Build Animation" quick link to post/page row actions.
   *
   * @param array    $actions Row actions.
   * @param \WP_Post $post    Current post object.
   * @return array
   */
  public function add_custom_quick_link($actions, $post)
  {
    if (!current_user_can('manage_options')) {
      return $actions;
    }

    $public_types = get_post_types(['public' => true]);

    if (!in_array($post->post_type, $public_types, true)) {
      return $actions;
    }

    $page_url = get_the_permalink($post->ID);

    $actions['motionkit_action'] = self::build_animation_link($page_url);

    return $actions;
  }

  /**
   * The "Build Animation" anchor for one row.
   *
   * An unconnected site goes to the Connect page rather than the editor, and in
   * the same tab — a new window for an internal admin screen reads as a
   * mis-click. The title attribute is what stops that landing looking like a
   * broken link.
   *
   * @param string $page_url Permalink of the row's page.
   * @return string
   */
  private static function build_animation_link(string $page_url): string
  {
    $url = Helper::editor_launch_url($page_url);

    if (!Helper::is_editor_reachable()) {
      return '<a href="' . esc_url($url) . '" title="'
        . esc_attr__('Connect this site to MotionKit first', 'motionkit') . '">'
        . esc_html__('Build Animation', 'motionkit') . '</a>';
    }

    return '<a target="_blank" rel="noopener" href="' . esc_url($url) . '">'
      . esc_html__('Build Animation', 'motionkit') . '</a>';
  }

  /**
   * Add "Build Animation" quick link to taxonomy term row actions.
   *
   * @param array    $actions Row actions.
   * @param \WP_Term $term    Current term object.
   * @return array
   */
  public function add_term_quick_link($actions, $term)
  {
    if (!current_user_can('manage_options')) {
      return $actions;
    }

    $page_url = get_term_link($term);

    if (is_wp_error($page_url)) {
      return $actions;
    }

    $actions['motionkit_action'] = self::build_animation_link($page_url);

    return $actions;
  }

  /**
   * Enqueue admin scripts and styles
   *
   * @param string $hook The current admin page hook.
   * @return void
   */
  public function enqueue_admin_assets(string $hook): void
  {
  }

  /**
   * Get asset loader instance
   *
   * @return AssetLoader Asset loader instance.
   */
  public function get_asset_loader(): AssetLoader
  {
    return $this->asset_loader;
  }
}
