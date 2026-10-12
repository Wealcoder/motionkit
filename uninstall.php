<?php
/**
 * MotionKit Uninstall
 *
 * Runs when the plugin is deleted (not just deactivated) from WP admin.
 *
 * Secrets, auth and bookkeeping this plugin can write on its own are always
 * removed, so a reusable token or connection row never lingers in the database
 * after a delete. Animation content and the shared JWT/share secrets are
 * removed only when the sibling MotionKit Connector plugin is not also
 * installed — deleting one of a paired install must not sever a connection or
 * erase animations the other is still using.
 *
 * @package MotionKit
 */

if (!defined('WP_UNINSTALL_PLUGIN')) {
  exit;
}

global $wpdb;

// Whether the sibling connector plugin is still installed. Checked on disk rather than by its loaded-constant, which is not defined during this plugin's uninstall, and rather than active_plugins, since a user may delete an inactive plugin. The connector's folder is motionkit-with-gsap.
$motionkit_sibling_present = file_exists(WP_PLUGIN_DIR . '/motionkit-with-gsap/motionkit-with-gsap.php');

// ── Options this plugin writes on its own: always removed ──
$motionkit_always = [
  'motionkit_options',
  'motionkit_version',
  'motionkit_creation_date',
  'motionkit_enc_fallback_key',
];

// The editor-session secret this plugin mints via its own local fallback is a credential, so it goes unless the connector is still here to keep using it.
if (!$motionkit_sibling_present) {
  $motionkit_always[] = 'motionkit_jwt_secret';
  $motionkit_always[] = 'motionkit_jwt_secret_source';
}

foreach ($motionkit_always as $motionkit_option) {
  delete_option($motionkit_option);
}

// Per-user "dismissed the permalink notice" flag, across all users.
delete_metadata('user', 0, 'motionkit_dismissed_permalink_notice', '', true);

// ── Animation content: removed only when no sibling plugin shares it ──
// The settings/animation options and every motionkit_pg_* meta and option row are the user's actual work, written through this plugin's own /save handler. They go when this is the last MotionKit plugin on the site.
if (!$motionkit_sibling_present) {
  $motionkit_content_options = [
    'motionkit_global_settings',
    'motionkit_global_animations',
    'motionkit_global_animations_draft',
    'motionkit_animation_folders',
    'motionkit_favourite_cloud_animations',
    'motionkit_share_secret',
  ];
  foreach ($motionkit_content_options as $motionkit_option) {
    delete_option($motionkit_option);
  }

  // Per-page animation/settings/draft/share meta + option rows, removed as one group so a delete never leaves half a page's data behind.
  $wpdb->query(
    "DELETE FROM {$wpdb->postmeta} WHERE meta_key LIKE 'motionkit\\_pg\\_%'"
  );

  if (!empty($wpdb->termmeta)) {
    $wpdb->query(
      "DELETE FROM {$wpdb->termmeta} WHERE meta_key LIKE 'motionkit\\_pg\\_%'"
    );
  }

  $wpdb->query(
    "DELETE FROM {$wpdb->options} WHERE option_name LIKE 'motionkit\\_pg\\_%'"
  );
}
