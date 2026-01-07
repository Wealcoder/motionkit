<?php

namespace WcfAnimationBuilder\Frontend;

/**
 * Frontend Class
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
 * Frontend Class
 *
 * Handles all frontend functionality for the plugin.
 */
final class Frontend
{
  /**
   * Asset loader instance
   *
   * @var AssetLoader
   */
  private AssetLoader $asset_loader;



  /**
   * Initialize frontend functionality
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
    // Asset loading
    add_action('wp_enqueue_scripts', [$this, 'enqueue_scripts']);

    // Template handling
    add_filter('body_class', [$this, 'add_body_classes']);
    add_action('wp_footer', [$this, 'html_selector']);
  }

  /**
   * Enqueue frontend scripts and styles
   *
   * @return void
   */
  public function enqueue_scripts(): void
  {
    // Enqueue frontend JavaScript
    $this->asset_loader->register_style(
      'wcf-animbuilder-class-selector',
      'assets/build/modules/animation-builder/animbuilder-copy.css',
      []

    );
  }

  public function html_selector()
  {

    if (isset($_GET['action']) && sanitize_text_field(wp_unslash($_GET['action'])) == 'animation-builder') {
      wp_enqueue_style('wcf-animbuilder-class-selector');
?>
      <div class="wcfanimb-skip-selector" id="wcf-anim-builder-structure"></div>
      <div id="wcfanim-selectorPopup" class="wcfanimb-popup wcfanimb-skip-selector" style="display: none;">
        <!-- selector content wrapper -->
        <div class="wcfanimb-wrapper wcfanimb-skip-selector">
          <!-- header -->
          <div id="wcf-ab-selector-header" class="wcfanimb-skip-selector">
            <!-- header left side content -->
            <div id="wcf-ab-selector-header-left" class="wcfanimb-skip-selector">
              <!-- icon -->
              <svg class="wcfanimb-skip-selector" width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle class="wcfanimb-skip-selector" cx="20" cy="20" r="20" fill="#1C7E92" />
                <path class="wcfanimb-skip-selector" d="M24.4452 28.8889C26.4988 28.8889 28.1636 27.7517 28.1636 26.3491C28.1636 23.6366 28.1939 22.5191 30.5674 20.898C31.2934 20.402 31.2934 19.598 30.5674 19.102C28.1939 17.4809 28.1636 16.3633 28.1636 13.6508C28.1636 12.2481 26.4988 11.1111 24.4452 11.1111M15.5563 28.8889C13.5027 28.8889 11.8379 27.7517 11.8379 26.3491C11.8379 23.6366 11.8077 22.5191 9.4342 20.898C8.70813 20.402 8.70813 19.598 9.43418 19.102C11.8077 17.4809 11.8379 16.3633 11.8379 13.6508C11.8379 12.2481 13.5027 11.1111 15.5563 11.1111" stroke="#FAFAFA" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
              <div class="wcfanimb-skip-selector">
                <!-- Title -->
                <p class="wcf-ab-selector-title wcfanimb-skip-selector">
                  <?php echo esc_html__('Class', 'gsap-animation-builder-for-wordpress') ?>
                </p>
                <!-- Description -->
                <p class="wcf-ab-selector-description wcfanimb-skip-selector">
                  <?php echo esc_html__('Copy your class or id', 'gsap-animation-builder-for-wordpress') ?>
                </p>
              </div>
            </div>
            <!-- close btn -->
            <div class="wcf-ab-selector-action-general wcfanimb-close-btn wcfanimb-skip-selector">
              <svg class="wcfanimb-skip-selector" width="18" height="18" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <g class="wcfanimb-skip-selector" clip-path="url(#a)" stroke="#e55f42" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                  <path class="wcfanimb-skip-selector" d="M14.667 8A6.667 6.667 0 1 0 1.334 8a6.667 6.667 0 0 0 13.333 0M10 10 6 6m0 4 4-4" />
                </g>
                <defs>
                  <clipPath class="wcfanimb-skip-selector" id="a">
                    <path class="wcfanimb-skip-selector" fill="#fff" d="M0 0h16v16H0z" />
                  </clipPath>
                </defs>
              </svg>
            </div>
          </div>
          <!-- Parent class section -->
          <div class="wcf-ab-selector-content wcfanimb-skip-selector">
            <!-- Parent class selector -->
            <div class="wcf-ab-slsingle-content wcfanimb-skip-selector">
              <div class="wcf-ab-selector-content-label wcfanimb-skip-selector">
                <span class="wcfanimb-skip-selector">
                  <?php echo esc_html__('Parent Class', 'gsap-animation-builder-for-wordpress') ?>
                </span>
                <svg class="wcf-ab-selector-action-general wcfanimb-skip-selector" id="wcf-ab-cpc-copy" width="23" height="23" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle class="wcfanimb-skip-selector" cx="10" cy="10" r="10" fill="#3f3f46" />
                  <g class="wcfanimb-skip-selector" clip-path="url(#a)" stroke="#e4e4e7" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5">
                    <path class="wcfanimb-skip-selector" d="M8.75 11.25c0-1.178 0-1.768.366-2.134s.956-.366 2.134-.366h.417c1.178 0 1.767 0 2.133.366s.367.956.367 2.134v.417c0 1.178 0 1.768-.367 2.134-.366.366-.955.366-2.133.366h-.417c-1.178 0-1.768 0-2.134-.366-.366-.367-.366-.956-.366-2.134z" />
                    <path class="wcfanimb-skip-selector" d="M12.083 8.75c-.001-1.232-.02-1.87-.378-2.307a1.7 1.7 0 0 0-.231-.231c-.461-.379-1.146-.379-2.516-.379s-2.055 0-2.516.379q-.126.104-.23.23c-.379.462-.379 1.147-.379 2.516 0 1.37 0 2.055.378 2.516q.105.127.231.231c.437.359 1.076.377 2.308.378" />
                  </g>
                  <defs class="wcfanimb-skip-selector">
                    <clipPath class="wcfanimb-skip-selector" id="a">
                      <path class="wcfanimb-skip-selector" fill="#fff" d="M5 5h10v10H5z" />
                    </clipPath>
                  </defs>
                </svg>
              </div>
              <!-- parent class displayed section -->
              <div class="wcfanimb-classes wcfanimb-skip-selector">
                <p id="wcfanimb-parent-class-content" class="wcfanimb-popupContent wcfanimb-skip-selector"></p>
              </div>
            </div>
            <!-- Parent id selector -->
            <div class="wcf-ab-slsingle-content wcfanimb-skip-selector">
              <div class="wcf-ab-selector-content-label wcfanimb-skip-selector">
                <span class="wcfanimb-skip-selector">
                  <?php echo esc_html__('ID', 'gsap-animation-builder-for-wordpress') ?>
                </span>
                <svg class="wcf-ab-selector-action-general wcfanimb-skip-selector" id="wcf-ab-cpid-copy" width="23" height="23" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle class="wcfanimb-skip-selector" cx="10" cy="10" r="10" fill="#3f3f46" />
                  <g class="wcfanimb-skip-selector" clip-path="url(#a)" stroke="#e4e4e7" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5">
                    <path class="wcfanimb-skip-selector" d="M8.75 11.25c0-1.178 0-1.768.366-2.134s.956-.366 2.134-.366h.417c1.178 0 1.767 0 2.133.366s.367.956.367 2.134v.417c0 1.178 0 1.768-.367 2.134-.366.366-.955.366-2.133.366h-.417c-1.178 0-1.768 0-2.134-.366-.366-.367-.366-.956-.366-2.134z" />
                    <path class="wcfanimb-skip-selector" d="M12.083 8.75c-.001-1.232-.02-1.87-.378-2.307a1.7 1.7 0 0 0-.231-.231c-.461-.379-1.146-.379-2.516-.379s-2.055 0-2.516.379q-.126.104-.23.23c-.379.462-.379 1.147-.379 2.516 0 1.37 0 2.055.378 2.516q.105.127.231.231c.437.359 1.076.377 2.308.378" />
                  </g>
                  <defs class="wcfanimb-skip-selector">
                    <clipPath class="wcfanimb-skip-selector" id="a">
                      <path class="wcfanimb-skip-selector" fill="#fff" d="M5 5h10v10H5z" />
                    </clipPath>
                  </defs>
                </svg>
              </div>
              <!-- parent id displayed section -->
              <div class="wcfanimb-classes wcfanimb-skip-selector">
                <p id="wcfanimb-parent-id-content" class="wcfanimb-popupContent wcfanimb-skip-selector"></p>
              </div>
            </div>
          </div>
          <!-- Current class section -->
          <div class="wcf-ab-selector-content wcfanimb-skip-selector">
            <!-- Current class selector -->
            <div class="wcf-ab-slsingle-content wcfanimb-skip-selector">
              <div class="wcf-ab-selector-content-label wcfanimb-skip-selector">
                <span class="wcfanimb-skip-selector">
                  <?php echo esc_html__('Current Class (Short)', 'gsap-animation-builder-for-wordpress') ?>
                </span>
                <svg class="wcf-ab-selector-action-general wcfanimb-skip-selector" id="wcf-ab-cccs-copy" width="23" height="23" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle class="wcfanimb-skip-selector" cx="10" cy="10" r="10" fill="#3f3f46" />
                  <g class="wcfanimb-skip-selector" clip-path="url(#a)" stroke="#e4e4e7" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5">
                    <path class="wcfanimb-skip-selector" d="M8.75 11.25c0-1.178 0-1.768.366-2.134s.956-.366 2.134-.366h.417c1.178 0 1.767 0 2.133.366s.367.956.367 2.134v.417c0 1.178 0 1.768-.367 2.134-.366.366-.955.366-2.133.366h-.417c-1.178 0-1.768 0-2.134-.366-.366-.367-.366-.956-.366-2.134z" />
                    <path class="wcfanimb-skip-selector" d="M12.083 8.75c-.001-1.232-.02-1.87-.378-2.307a1.7 1.7 0 0 0-.231-.231c-.461-.379-1.146-.379-2.516-.379s-2.055 0-2.516.379q-.126.104-.23.23c-.379.462-.379 1.147-.379 2.516 0 1.37 0 2.055.378 2.516q.105.127.231.231c.437.359 1.076.377 2.308.378" />
                  </g>
                  <defs class="wcfanimb-skip-selector">
                    <clipPath class="wcfanimb-skip-selector" id="a">
                      <path class="wcfanimb-skip-selector" fill="#fff" d="M5 5h10v10H5z" />
                    </clipPath>
                  </defs>
                </svg>
              </div>
              <!-- current class displayed section -->
              <div class="wcfanimb-classes wcfanimb-skip-selector">
                <p id="wcfanimb-current-class-content" class="wcfanimb-popupContent wcfanimb-skip-selector"></p>
              </div>
            </div>
            <!-- Current id selector -->
            <div class="wcf-ab-slsingle-content wcfanimb-skip-selector">
              <div class="wcf-ab-selector-content-label wcfanimb-skip-selector">
                <span class="wcfanimb-skip-selector">
                  <?php echo esc_html__('ID', 'gsap-animation-builder-for-wordpress') ?>
                </span>
                <svg class="wcf-ab-selector-action-general wcfanimb-skip-selector" id="wcf-ab-ccid-copy" width="23" height="23" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle class="wcfanimb-skip-selector" cx="10" cy="10" r="10" fill="#3f3f46" />
                  <g class="wcfanimb-skip-selector" clip-path="url(#a)" stroke="#e4e4e7" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5">
                    <path class="wcfanimb-skip-selector" d="M8.75 11.25c0-1.178 0-1.768.366-2.134s.956-.366 2.134-.366h.417c1.178 0 1.767 0 2.133.366s.367.956.367 2.134v.417c0 1.178 0 1.768-.367 2.134-.366.366-.955.366-2.133.366h-.417c-1.178 0-1.768 0-2.134-.366-.366-.367-.366-.956-.366-2.134z" />
                    <path class="wcfanimb-skip-selector" d="M12.083 8.75c-.001-1.232-.02-1.87-.378-2.307a1.7 1.7 0 0 0-.231-.231c-.461-.379-1.146-.379-2.516-.379s-2.055 0-2.516.379q-.126.104-.23.23c-.379.462-.379 1.147-.379 2.516 0 1.37 0 2.055.378 2.516q.105.127.231.231c.437.359 1.076.377 2.308.378" />
                  </g>
                  <defs class="wcfanimb-skip-selector">
                    <clipPath class="wcfanimb-skip-selector" id="a">
                      <path class="wcfanimb-skip-selector" fill="#fff" d="M5 5h10v10H5z" />
                    </clipPath>
                  </defs>
                </svg>
              </div>
              <!-- current class id displayed section -->
              <div class="wcfanimb-classes wcfanimb-skip-selector">
                <p id="wcfanimb-current-id-content" class="wcfanimb-popupContent wcfanimb-skip-selector"></p>
              </div>
            </div>
          </div>
          <!-- Current class (long) -->
          <div class="wcf-ab-ccl-content wcfanimb-skip-selector">
            <div class="wcf-ab-selector-content-label wcfanimb-skip-selector">
              <span class="wcfanimb-skip-selector">
                <?php echo esc_html__('Current Class (Long)', 'gsap-animation-builder-for-wordpress') ?></span>
              <svg class="wcf-ab-selector-action-general wcfanimb-skip-selector" id="wcf-ab-cccl-copy" width="23" height="23" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle class="wcfanimb-skip-selector" cx="10" cy="10" r="10" fill="#3f3f46" />
                <g class="wcfanimb-skip-selector" clip-path="url(#a)" stroke="#e4e4e7" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5">
                  <path class="wcfanimb-skip-selector" d="M8.75 11.25c0-1.178 0-1.768.366-2.134s.956-.366 2.134-.366h.417c1.178 0 1.767 0 2.133.366s.367.956.367 2.134v.417c0 1.178 0 1.768-.367 2.134-.366.366-.955.366-2.133.366h-.417c-1.178 0-1.768 0-2.134-.366-.366-.367-.366-.956-.366-2.134z" />
                  <path class="wcfanimb-skip-selector" d="M12.083 8.75c-.001-1.232-.02-1.87-.378-2.307a1.7 1.7 0 0 0-.231-.231c-.461-.379-1.146-.379-2.516-.379s-2.055 0-2.516.379q-.126.104-.23.23c-.379.462-.379 1.147-.379 2.516 0 1.37 0 2.055.378 2.516q.105.127.231.231c.437.359 1.076.377 2.308.378" />
                </g>
                <defs class="wcfanimb-skip-selector">
                  <clipPath class="wcfanimb-skip-selector" id="a">
                    <path class="wcfanimb-skip-selector" fill="#fff" d="M5 5h10v10H5z" />
                  </clipPath>
                </defs>
              </svg>
            </div>
            <!-- current class long displayed section -->
            <div class="wcfanimb-classes-long wcfanimb-skip-selector">
              <p id="wcfanimb-current-long-class-content" class="wcfanimb-popupContent wcfanimb-skip-selector"></p>
            </div>
          </div>
        </div>
      </div>
      <div id="wcf-ab-context-menu-wrapper"></div>
<?php
    }
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
   * Add custom body classes
   *
   * @param array $classes Existing body classes
   * @return array Modified body classes
   */
  public function add_body_classes(array $classes): array
  {
    // Add custom body classes here if needed
    return $classes;
  }

  /**
   * AJAX handler for getting animation data
   *
   * @return void
   */
  public function ajax_get_animation_data(): void
  {
    // Verify nonce
    $nonce = isset($_REQUEST['wcf_animation_builder_nonce'])
      ? sanitize_text_field(wp_unslash($_REQUEST['wcf_animation_builder_nonce']))
      : '';

    if (!wp_verify_nonce($nonce, 'wcf_animation_builder_nonce')) {
      wp_send_json_error(['message' => __('Security check failed.', 'gsap-animation-builder-for-wordpress')]);
    }

    // Get and sanitize data
    $post_id = absint($_GET['post_id'] ?? 0);

    if (empty($post_id)) {
      wp_send_json_error(['message' => __('Invalid post ID.', 'gsap-animation-builder-for-wordpress')]);
    }

    // Get animation data
    $animation_data = get_post_meta($post_id, '_wcf_animation_data', true);

    if (empty($animation_data)) {
      wp_send_json_error(['message' => __('No animation data found.', 'gsap-animation-builder-for-wordpress')]);
    }

    wp_send_json_success($animation_data);
  }

  /**
   * AJAX handler for saving animation
   *
   * @return void
   */
  public function ajax_save_animation(): void
  {
    // Verify nonce
    $nonce = isset($_REQUEST['wcf_animation_builder_nonce'])
      ? sanitize_text_field(wp_unslash($_REQUEST['wcf_animation_builder_nonce']))
      : '';

    if (!wp_verify_nonce($nonce, 'wcf_animation_builder_nonce')) {
      wp_send_json_error(['message' => __('Security check failed.', 'gsap-animation-builder-for-wordpress')]);
    }

    // Get and sanitize data
    $post_id = absint($_POST['post_id'] ?? 0);
    $animation_data = isset($_POST['animation_data']) ? sanitize_text_field(wp_unslash($_POST['animation_data'])) : '';

    if (empty($post_id) || empty($animation_data)) {
      wp_send_json_error(['message' => __('Invalid data provided.', 'gsap-animation-builder-for-wordpress')]);
    }

    // Save animation data
    update_post_meta($post_id, '_wcf_animation_data', $animation_data);

    wp_send_json_success(['message' => __('Animation saved successfully.', 'gsap-animation-builder-for-wordpress')]);
  }
}
