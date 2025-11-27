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
use WcfAnimationBuilder\Helpers\Helper;

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
     * Smoother loader instance
     *
     * @var ScrollSmoother
     */
    private ScrollSmoother $smoother;

    /**
     * Initialize frontend functionality
     *
     * @return void
     */
    public function init(): void
    {
        $this->asset_loader = ComponentFactory::create_asset_loader();
        $this->smoother = new ScrollSmoother();
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
        // Scroll smoother wrapper
        if(defined( 'WCF_ADDONS_PRO_VERSION' )){
            return;
        }
        add_action('wp_body_open', [$this->smoother, 'start_wrapper'], 1);
        add_action('wp_footer', [$this->smoother, 'end_wrapper'], -1);
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
            'assets/css/animbuilder-copy.css',
            []
           
        );      
       
    }

    public function html_selector()
	{

		if (isset($_GET['action']) && sanitize_text_field( wp_unslash($_GET['action']) ) == 'animation-builder') {
			wp_enqueue_style('wcf-animbuilder-class-selector');
    ?>
			<div class="wcfanimb-skip-selector" id="wcf-anim-builder-structure"></div>
			<div id="wcfanim-selectorPopup" class="wcfanimb-popup wcfanimb-skip-selector" style="display: none;">
				<div class="wcfanimb-wrapper wcfanimb-skip-selector">
					<div class="wcfanimb-close-btn wcfanimb-skip-selector">
						<svg xmlns="http://www.w3.org/2000/svg" class="wcfanimb-skip-selector" width="12" height="12" viewBox="0 0 12 12" fill="none">
							<g clip-path="url(#clip0_4401_4730)">
								<path fill-rule="evenodd" clip-rule="evenodd" d="M10.9948 1.00483C11.2681 1.2782 11.2681 1.72141 10.9948 1.99478L1.99478 10.9948C1.72141 11.2681 1.2782 11.2681 1.00483 10.9948C0.731463 10.7214 0.731463 10.2782 1.00483 10.0048L10.0048 1.00483C10.2782 0.731463 10.7214 0.731463 10.9948 1.00483Z" fill="#94979B" class="wcfanimb-skip-selector" />
								<path fill-rule="evenodd" clip-rule="evenodd" d="M1.00483 1.00483C1.2782 0.731463 1.72141 0.731463 1.99478 1.00483L10.9948 10.0048C11.2681 10.2782 11.2681 10.7214 10.9948 10.9948C10.7214 11.2681 10.2782 11.2681 10.0048 10.9948L1.00483 1.99478C0.731463 1.72141 0.731463 1.2782 1.00483 1.00483Z" fill="#94979B" class="wcfanimb-skip-selector" />
							</g>
							<defs>
								<clipPath id="clip0_4401_4730">
									<rect width="12" height="12" fill="white" />
								</clipPath>
							</defs>
						</svg>
					</div>
					<div class="wcfanimb-skip-selector">
						<p class="wcfanimb-label wcfanimb-skip-selector"><?php echo esc_html__('Selected class', 'gsap-animation-builder-for-wordpress') ?></p>
						<div class="wcfanimb-classes wcfanimb-skip-selector">
							<p id="wcfanim-popupContent" class="wcfanimb-popupContent close wcfanimb-skip-selector"></p>
						</div>
					</div>
					<div class="wcfanim-btn-group wcfanimb-skip-selector">
						<button id="wcfanim-copySelector" class="wcfanimb-copy-btn wcfanimb-skip-selector" data-clipboard-target="#wcfanim-popupContent"><?php echo esc_html__('Copy', 'gsap-animation-builder-for-wordpress') ?></button>
						<button id="wcfanim-expendSelector" class="wcfanimb-select-btn expend-false wcfanimb-skip-selector"><?php echo esc_html__('Expend', 'gsap-animation-builder-for-wordpress') ?></button>
					</div>
				</div>
			</div>
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

    /**
     * Sanitize array recursively
     *
     * @param array $data Array to sanitize
     * @return array Sanitized array
     */
    private function sanitize_array(array $data): array
    {
        $sanitized = [];
        foreach ($data as $key => $value) {
            $key = sanitize_key($key);
            if (is_array($value)) {
                $sanitized[$key] = $this->sanitize_array($value);
            } else {
                $sanitized[$key] = sanitize_text_field(wp_unslash($value));
            }
        }
        return $sanitized;
    }
}

