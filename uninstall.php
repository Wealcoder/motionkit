<?php
/**
 * MotionKit Uninstall
 *
 * Runs when the plugin is deleted (not just deactivated) from WP admin.
 * Removes only options this plugin owns. The authentication layer (OAuth
 * access token, JWT secret, jti list, legacy editor URL/API key, license
 * cron) is owned and cleaned by the MotionKit Connector plugin's own
 * uninstall — deleting it here would sever a connection the still-active
 * connector is using. Animation content is likewise connector-owned.
 *
 * @package MotionKit
 */

if (!defined('WP_UNINSTALL_PLUGIN')) {
  exit;
}

$motionkit_options = [
  'motionkit_options',
  'motionkit_version',
  'motionkit_creation_date',
];

foreach ($motionkit_options as $motionkit_option) {
  delete_option($motionkit_option);
}

// Per-user "dismissed the permalink notice" flag, across all users.
delete_metadata('user', 0, 'motionkit_dismissed_permalink_notice', '', true);
