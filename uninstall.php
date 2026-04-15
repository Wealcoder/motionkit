<?php
/**
 * MotionKit Uninstall
 *
 * Runs when the plugin is deleted (not just deactivated) from WP admin.
 * Removes plugin-specific options. Leaves user content (post_meta) intact
 * so reinstalling preserves saved animations — users can bulk-clear those
 * via the REST delete endpoints if desired.
 *
 * @package WcfAnimationBuilder
 */

if (!defined('WP_UNINSTALL_PLUGIN')) {
  exit;
}

$options_to_delete = [
  // Core plugin config
  'wcf_animation_builder_options',
  'wcf_animation_builder_version',
  'wcf_animation_builder_creation_date',

  // Global animation/settings buckets
  'motionkit_global_settings',
  'motionkit_global_animations',

  // Auth / connection
  'motionkit_jwt_secret',
  'motionkit_api_key',
  'motionkit_access_token',
  'motionkit_connected_at',
  'motionkit_connected_email',
];

foreach ($options_to_delete as $option) {
  delete_option($option);
  delete_site_option($option);
}

// Transients (session-verify cache)
global $wpdb;
$wpdb->query(
  "DELETE FROM {$wpdb->options}
   WHERE option_name LIKE '_transient_mk_session_%'
      OR option_name LIKE '_transient_timeout_mk_session_%'"
);

// User meta (dismissed admin notices)
delete_metadata('user', 0, 'motionkit_dismissed_permalink_notice', '', true);
