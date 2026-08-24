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

