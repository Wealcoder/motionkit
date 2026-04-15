<?php

namespace WcfAnimationBuilder\Migrations;

/**
 * Settings Key Migration
 *
 * One-time migration that moves page-settings data out of the
 * mkit_pg_animation_<type> key into mkit_pg_settings_<type>.
 *
 * Background: prior to v1.1.0, both page settings (scroll smoother, etc.)
 * and page animations (timeline list) were written to the same option key
 * via the unified saveConfig path, so settings would overwrite animations
 * (last-write-wins). v1.1.0 splits them into two distinct keys. This
 * migration relocates any legacy settings payloads sitting in animation keys.
 *
 * Detection heuristic: an animation payload is a numerically-indexed array
 * of objects, while a settings payload is an associative array (e.g. has
 * "scrollSmother", "preLoader" keys). If the saved value is associative
 * and not list-shaped, we treat it as misplaced settings.
 *
 * Idempotent: tracked via the wp_option `motionkit_settings_key_migrated`
 * so it runs at most once per site.
 *
 * @package WcfAnimationBuilder
 * @since 1.1.0
 */

if (!defined('ABSPATH')) {
  exit;
}

final class SettingsKeyMigration
{
  private const SENTINEL_OPTION  = 'motionkit_settings_key_migrated';
  private const ANIMATION_PREFIX = 'mkit_pg_animation_';
  private const SETTINGS_PREFIX  = 'mkit_pg_settings_';

  public function init(): void
  {
    add_action('admin_init', [$this, 'maybe_run']);
  }

  public function maybe_run(): void
  {
    if (get_option(self::SENTINEL_OPTION) === '1') {
      return;
    }

    $this->run();

    update_option(self::SENTINEL_OPTION, '1', false);
  }

  /**
   * Scan post_meta + term_meta + wp_options for misplaced settings payloads
   * and relocate them. Returns counts for logging / debugging.
   *
   * @return array{post_meta:int, term_meta:int, options:int}
   */
  public function run(): array
  {
    global $wpdb;

    $stats = ['post_meta' => 0, 'term_meta' => 0, 'options' => 0];

    // ── post_meta ──────────────────────────────────────────────────
    $rows = $wpdb->get_results($wpdb->prepare(
      "SELECT post_id, meta_key, meta_value
         FROM {$wpdb->postmeta}
         WHERE meta_key LIKE %s",
      $wpdb->esc_like(self::ANIMATION_PREFIX) . '%'
    ));
    foreach ($rows as $row) {
      $value = maybe_unserialize($row->meta_value);
      if (!$this->is_misplaced_settings($value)) continue;

      $new_key = $this->settings_key_from_animation_key($row->meta_key);
      // Don't overwrite if a real settings row already exists.
      $existing = get_post_meta((int) $row->post_id, $new_key, true);
      if (!empty($existing)) continue;

      update_post_meta((int) $row->post_id, $new_key, $value);
      delete_post_meta((int) $row->post_id, $row->meta_key);
      $stats['post_meta']++;
    }

    // ── term_meta ──────────────────────────────────────────────────
    $rows = $wpdb->get_results($wpdb->prepare(
      "SELECT term_id, meta_key, meta_value
         FROM {$wpdb->termmeta}
         WHERE meta_key LIKE %s",
      $wpdb->esc_like(self::ANIMATION_PREFIX) . '%'
    ));
    foreach ($rows as $row) {
      $value = maybe_unserialize($row->meta_value);
      if (!$this->is_misplaced_settings($value)) continue;

      $new_key = $this->settings_key_from_animation_key($row->meta_key);
      $existing = get_term_meta((int) $row->term_id, $new_key, true);
      if (!empty($existing)) continue;

      update_term_meta((int) $row->term_id, $new_key, $value);
      delete_term_meta((int) $row->term_id, $row->meta_key);
      $stats['term_meta']++;
    }

    // ── wp_options (front_page, archive, 404, search use option store) ──
    $rows = $wpdb->get_results($wpdb->prepare(
      "SELECT option_name, option_value
         FROM {$wpdb->options}
         WHERE option_name LIKE %s",
      $wpdb->esc_like(self::ANIMATION_PREFIX) . '%'
    ));
    foreach ($rows as $row) {
      $value = maybe_unserialize($row->option_value);
      if (!$this->is_misplaced_settings($value)) continue;

      $new_key = $this->settings_key_from_animation_key($row->option_name);
      if (get_option($new_key) !== false) continue;

      update_option($new_key, $value, false);
      delete_option($row->option_name);
      $stats['options']++;
    }

    return $stats;
  }

  /**
   * True if the value is shaped like settings (associative object) rather
   * than animations (list of objects).
   */
  private function is_misplaced_settings($value): bool
  {
    if (!is_array($value) || count($value) === 0) {
      return false;
    }
    // Animations are a numerically-indexed list. Settings are associative.
    return !array_is_list($value);
  }

  private function settings_key_from_animation_key(string $key): string
  {
    return preg_replace(
      '/^' . preg_quote(self::ANIMATION_PREFIX, '/') . '/',
      self::SETTINGS_PREFIX,
      $key
    );
  }
}
