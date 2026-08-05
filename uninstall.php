<?php
/**
 * MotionKit Uninstall
 *
 * Runs when the plugin is deleted (not just deactivated) from WP admin.
 * Removes plugin-specific options. Leaves user content (post_meta) intact
 * so reinstalling preserves saved animations — users can bulk-clear those
 * via the REST delete endpoints if desired.
 *
 * @package MotionKit
 */

if (!defined('WP_UNINSTALL_PLUGIN')) {
  exit;
}

$options_to_delete = [
  // Core plugin config
  'motionkit_options',
  'motionkit_version',
  'motionkit_creation_date',

  // Global animation/settings buckets
  'motionkit_global_settings',
  'motionkit_global_animations',

  // Auth / connection
  'motionkit_jwt_secret',
  'motionkit_api_key',
  'motionkit_access_token',
  'motionkit_connected_at',
  'motionkit_connected_email',
  'motionkit_used_jtis',

  // License / entitlement mirror
  'motionkit_license_state',
  // Legacy: written by the pre-1.2.0 manual "activate license" form, which
  // never validated anything remotely. Deleted here so an uninstall doesn't
  // leave a stale "active" flag behind for a future build to trip over.
  'motionkit_license_key',
  'motionkit_license_status',

  // Migration sentinel
  'motionkit_autoload_fixed_v1',
];

foreach ($options_to_delete as $option) {
  delete_option($option);
  delete_site_option($option);
}

// Scheduled license refresh
wp_clear_scheduled_hook('motionkit_license_refresh');

// Transients (session-verify cache, OAuth state, license check markers).
// The mk_session_ patterns are legacy — sites active before the
// motionkit_session_ rename may still have these lingering.
global $wpdb;
$wpdb->query(
  "DELETE FROM {$wpdb->options}
   WHERE option_name LIKE '_transient_mk_session_%'
      OR option_name LIKE '_transient_timeout_mk_session_%'
      OR option_name LIKE '_transient_motionkit_%'
      OR option_name LIKE '_transient_timeout_motionkit_%'"
);

// User meta (dismissed admin notices)
delete_metadata('user', 0, 'motionkit_dismissed_permalink_notice', '', true);
