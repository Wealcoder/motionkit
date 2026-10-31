<?php
/**
 * MotionKit Uninstall
 *
 * Runs when the plugin is deleted (not just deactivated) from WP admin.
 *
 * Bookkeeping only this plugin reads is always removed. The connection and
 * signing secrets and the animation content are shared with the MotionKit
 * Connector plugin, so they are removed only when it is not also installed —
 * deleting one of a paired install must not sever a connection or erase
 * animations the other is still using, and deleting the last one leaves no
 * reusable credential or account email behind.
 *
 * @package MotionKit
 */

if (!defined('WP_UNINSTALL_PLUGIN')) {
  exit;
}

global $wpdb;

// Whether the sibling connector plugin is still installed, in any folder. An active connector is loaded in this request (WordPress runs uninstall inside a normal admin request), so its constant settles it; an inactive one is found by its text domain, because it can live under motionkit-with-gsap/, the legacy motionkit-connector/, or a renamed zip folder, and a folder-name check that missed it would delete animations and the signing secret the connector is still using.
$motionkit_sibling_present = defined('MOTIONKIT_CONNECTOR_LOADED');
if (!$motionkit_sibling_present) {
  if (!function_exists('get_plugins')) {
    require_once ABSPATH . 'wp-admin/includes/plugin.php';
  }
  $motionkit_self = defined('WP_UNINSTALL_PLUGIN') ? (string) WP_UNINSTALL_PLUGIN : '';
  foreach (get_plugins() as $motionkit_basename => $motionkit_header) {
    if ($motionkit_basename !== $motionkit_self && ($motionkit_header['TextDomain'] ?? '') === 'motionkit-connector') {
      $motionkit_sibling_present = true;
      break;
    }
  }
}

// ── Options only this plugin reads: always removed ──
$motionkit_always = [
  'motionkit_options',
  'motionkit_version',
  'motionkit_creation_date',
  'motionkit_connection_removed',
];

foreach ($motionkit_always as $motionkit_option) {
  delete_option($motionkit_option);
}

// The Connect tab's one-minute back-off after the editor gave no answer to "is this connection still alive".
delete_transient('motionkit_connection_check');

// ── Connection and signing secrets shared with the connector ──
// The connector reads the same access token, JWT secret and encryption fallback key, so deleting them while it stays would disconnect it. When this is the last MotionKit plugin they all go, so no reusable credential or the connected account's email is left in the database.
if (!$motionkit_sibling_present) {
  $motionkit_shared_auth = [
    'motionkit_jwt_secret',
    'motionkit_jwt_secret_source',
    'motionkit_oauth_state',
    'motionkit_access_token',
    'motionkit_connected_at',
    'motionkit_connected_email',
    'motionkit_enc_fallback_key',
  ];
  foreach ($motionkit_shared_auth as $motionkit_option) {
    delete_option($motionkit_option);
  }
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
