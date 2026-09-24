<?php

namespace MotionKit\Admin;

/**
 * MotionKit WordPress Plugin — Active Animations & Hybrid Engine Manager.
 *
 * Scans, resolves, and manages animation records across global options,
 * post meta, and term meta. Provides AJAX endpoints for the Active Animations
 * dashboard tab, including 1-click lossless engine upgrade/revert (WAAPI <-> GSAP)
 * and bulk operations.
 *
 * @package MotionKit
 * @since 1.2.0
 */

// Prevent direct access
if (!defined('ABSPATH')) {
  exit;
}

final class AnimationsDataHandler
{
  private const ANIMATION_OPTION_PREFIX = 'motionkit_pg_animation_';
  private const GLOBAL_ANIMATIONS_OPTION = 'motionkit_global_animations';

  public function init(): void
  {
    add_action('wp_ajax_motionkit_animations_list', [$this, 'ajax_animations_list']);
    add_action('wp_ajax_motionkit_update_animation_engine', [$this, 'ajax_update_animation_engine']);
    add_action('wp_ajax_motionkit_bulk_engine_update', [$this, 'ajax_bulk_engine_update']);
    add_action('wp_ajax_motionkit_toggle_animation_status', [$this, 'ajax_toggle_animation_status']);
    add_action('wp_ajax_motionkit_delete_single_animation', [$this, 'ajax_delete_single_animation']);
  }

  /**
   * Check if the Pro/Connector engine is active.
   */
  public static function is_connector_active(): bool
  {
    return defined('MOTIONKIT_CONNECTOR_LOADED')
      || (class_exists('\MotionKitConnector\Auth\OAuthHandler')
          && \MotionKitConnector\Auth\OAuthHandler::is_connected());
  }

  /**
   * AJAX: List all individual active animations across the site.
   */
  public function ajax_animations_list(): void
  {
    if (!current_user_can('manage_options')) {
      wp_send_json_error(['message' => 'Unauthorized'], 403);
    }
    check_ajax_referer('motionkit_animations_ajax', 'nonce');

    $search = isset($_POST['search']) ? sanitize_text_field(wp_unslash($_POST['search'])) : '';
    $engine_filter = isset($_POST['engine']) ? sanitize_text_field(wp_unslash($_POST['engine'])) : '';

    $animations = $this->collect_all_animations();

    if ($search !== '') {
      $needle = mb_strtolower($search);
      $animations = array_values(array_filter($animations, function ($anim) use ($needle) {
        return strpos(mb_strtolower($anim['title']), $needle) !== false
          || strpos(mb_strtolower($anim['target']), $needle) !== false
          || strpos(mb_strtolower($anim['location']), $needle) !== false;
      }));
    }

    if ($engine_filter !== '' && in_array($engine_filter, ['waapi', 'gsap'], true)) {
      $animations = array_values(array_filter($animations, function ($anim) use ($engine_filter) {
        return $anim['engine'] === $engine_filter;
      }));
    }

    $waapi_count = 0;
    $gsap_count = 0;
    foreach ($animations as $anim) {
      if ($anim['engine'] === 'waapi') {
        $waapi_count++;
      } else {
        $gsap_count++;
      }
    }

    wp_send_json_success([
      'animations'       => $animations,
      'total'            => count($animations),
      'waapi_count'      => $waapi_count,
      'gsap_count'       => $gsap_count,
      'connector_active' => self::is_connector_active(),
    ]);
  }

  /**
   * AJAX: 1-Click single animation engine switch.
   */
  public function ajax_update_animation_engine(): void
  {
    if (!current_user_can('manage_options')) {
      wp_send_json_error(['message' => 'Unauthorized'], 403);
    }
    check_ajax_referer('motionkit_animations_ajax', 'nonce');

    $anim_id = isset($_POST['animation_id']) ? sanitize_text_field(wp_unslash($_POST['animation_id'])) : '';
    $target_engine = isset($_POST['target_engine']) ? sanitize_text_field(wp_unslash($_POST['target_engine'])) : 'gsap';

    if ($anim_id === '' || !in_array($target_engine, ['waapi', 'gsap'], true)) {
      wp_send_json_error(['message' => 'Invalid parameters'], 400);
    }

    $updated = $this->mutate_animation_by_id($anim_id, function (&$anim) use ($target_engine) {
      $anim['engine'] = $target_engine;
      if (isset($anim['runtime']) && is_array($anim['runtime'])) {
        $anim['runtime']['engine'] = $target_engine;
      }
      return true;
    });

    if ($updated) {
      /* translators: %s: Target animation engine (e.g. GSAP or WAAPI) */
      $msg = sprintf(__('Switched engine to %s.', 'motionkit'), strtoupper($target_engine));
      wp_send_json_success([
        'message'       => $msg,
        'animation_id'  => $anim_id,
        'target_engine' => $target_engine,
      ]);
    }

    wp_send_json_error(['message' => __('Animation not found.', 'motionkit')], 404);
  }

  /**
   * AJAX: Bulk upgrade or revert animations.
   */
  public function ajax_bulk_engine_update(): void
  {
    if (!current_user_can('manage_options')) {
      wp_send_json_error(['message' => 'Unauthorized'], 403);
    }
    check_ajax_referer('motionkit_animations_ajax', 'nonce');

    $target_engine = isset($_POST['target_engine']) ? sanitize_text_field(wp_unslash($_POST['target_engine'])) : 'gsap';
    if (!in_array($target_engine, ['waapi', 'gsap'], true)) {
      wp_send_json_error(['message' => 'Invalid target engine'], 400);
    }

    $all_flag = !empty($_POST['all']);
    $ids = isset($_POST['animation_ids']) && is_array($_POST['animation_ids'])
      ? array_map('sanitize_text_field', wp_unslash($_POST['animation_ids']))
      : [];

    $count = 0;
    if ($all_flag) {
      $count = $this->mutate_all_animations(function (&$anim) use ($target_engine) {
        if (($anim['engine'] ?? '') !== $target_engine) {
          $anim['engine'] = $target_engine;
          if (isset($anim['runtime']) && is_array($anim['runtime'])) {
            $anim['runtime']['engine'] = $target_engine;
          }
          return true;
        }
        return false;
      });
    } else {
      foreach ($ids as $id) {
        $mutated = $this->mutate_animation_by_id($id, function (&$anim) use ($target_engine) {
          $anim['engine'] = $target_engine;
          if (isset($anim['runtime']) && is_array($anim['runtime'])) {
            $anim['runtime']['engine'] = $target_engine;
          }
          return true;
        });
        if ($mutated) {
          $count++;
        }
      }
    }

    /* translators: 1: Count of updated animations, 2: Target animation engine (e.g. GSAP or WAAPI) */
    $bulk_msg = sprintf(__('Successfully updated %1$d animation(s) to %2$s.', 'motionkit'), $count, strtoupper($target_engine));

    wp_send_json_success([
      'updated_count' => $count,
      'target_engine' => $target_engine,
      'message'       => $bulk_msg,
    ]);
  }

  /**
   * AJAX: Toggle status between enabled/disabled (published/draft).
   */
  public function ajax_toggle_animation_status(): void
  {
    if (!current_user_can('manage_options')) {
      wp_send_json_error(['message' => 'Unauthorized'], 403);
    }
    check_ajax_referer('motionkit_animations_ajax', 'nonce');

    $anim_id = isset($_POST['animation_id']) ? sanitize_text_field(wp_unslash($_POST['animation_id'])) : '';
    if ($anim_id === '') {
      wp_send_json_error(['message' => 'Missing animation ID'], 400);
    }

    $new_status = 'published';
    $updated = $this->mutate_animation_by_id($anim_id, function (&$anim) use (&$new_status) {
      $curr = $anim['status'] ?? 'published';
      $is_published = ($curr === 'published');
      $new_status = $is_published ? 'draft' : 'published';
      $anim['status'] = $new_status;
      $anim['disabled'] = $is_published;
      return true;
    });

    if ($updated) {
      wp_send_json_success([
        'animation_id' => $anim_id,
        'new_status'   => $new_status,
        'is_active'    => ($new_status === 'published'),
      ]);
    }

    wp_send_json_error(['message' => __('Animation not found.', 'motionkit')], 404);
  }

  /**
   * AJAX: Delete an individual animation item.
   */
  public function ajax_delete_single_animation(): void
  {
    if (!current_user_can('manage_options')) {
      wp_send_json_error(['message' => 'Unauthorized'], 403);
    }
    check_ajax_referer('motionkit_animations_ajax', 'nonce');

    $anim_id = isset($_POST['animation_id']) ? sanitize_text_field(wp_unslash($_POST['animation_id'])) : '';
    if ($anim_id === '') {
      wp_send_json_error(['message' => 'Missing animation ID'], 400);
    }

    $deleted = $this->delete_animation_by_id($anim_id);

    if ($deleted) {
      wp_send_json_success([
        'animation_id' => $anim_id,
        'message'      => __('Animation removed.', 'motionkit'),
      ]);
    }

    wp_send_json_error(['message' => __('Animation not found.', 'motionkit')], 404);
  }

  /**
   * Scan and collect all individual animations into a flat list.
   *
   * @return array<int, array>
   */
  // phpcs:disable WordPress.DB.DirectDatabaseQuery -- admin animations tool queries require wildcard postmeta/termmeta search
  public function collect_all_animations(): array
  {
    global $wpdb;
    $flat_list = [];

    // 1. Global animations
    $global = get_option(self::GLOBAL_ANIMATIONS_OPTION, []);
    $flat_list = array_merge($flat_list, $this->extract_animation_items($global, [
      'store_type' => 'option',
      'key'        => self::GLOBAL_ANIMATIONS_OPTION,
      'id'         => 0,
      'location'   => __('Global (Entire Site)', 'motionkit'),
      'permalink'  => home_url('/'),
    ]));

    // 2. Post meta records
    $prefix = self::ANIMATION_OPTION_PREFIX;
    $like = $wpdb->esc_like($prefix) . '%';
    $post_rows = $wpdb->get_results(
      $wpdb->prepare(
        "SELECT pm.post_id AS id, pm.meta_key AS `key`, pm.meta_value AS `value`,
                p.post_title AS title, p.post_type AS type
         FROM {$wpdb->postmeta} pm
         INNER JOIN {$wpdb->posts} p ON p.ID = pm.post_id
         WHERE pm.meta_key LIKE %s",
        $like
      )
    );

    foreach ($post_rows as $row) {
      $permalink = get_permalink((int) $row->id) ?: home_url('/');
      /* translators: %d: WordPress post ID */
      $post_loc = $row->title !== '' ? $row->title : sprintf(__('Post #%d', 'motionkit'), $row->id);
      $flat_list = array_merge($flat_list, $this->extract_animation_items($row->value, [
        'store_type' => 'post_meta',
        'key'        => $row->key,
        'id'         => (int) $row->id,
        'location'   => $post_loc,
        'post_type'  => $row->type,
        'permalink'  => $permalink,
      ]));
    }

    // 3. Term meta records
    $term_rows = $wpdb->get_results(
      $wpdb->prepare(
        "SELECT tm.term_id AS id, tm.meta_key AS `key`, tm.meta_value AS `value`,
                t.name AS title, tt.taxonomy AS type
         FROM {$wpdb->termmeta} tm
         INNER JOIN {$wpdb->terms} t ON t.term_id = tm.term_id
         INNER JOIN {$wpdb->term_taxonomy} tt ON tt.term_id = tm.term_id
         WHERE tm.meta_key LIKE %s",
        $like
      )
    );

    foreach ($term_rows as $row) {
      $term_link = get_term_link((int) $row->id);
      $permalink = is_wp_error($term_link) ? home_url('/') : $term_link;
      /* translators: %s: WordPress taxonomy term name */
      $term_loc = sprintf(__('Term: %s', 'motionkit'), $row->title);
      $flat_list = array_merge($flat_list, $this->extract_animation_items($row->value, [
        'store_type' => 'term_meta',
        'key'        => $row->key,
        'id'         => (int) $row->id,
        'location'   => $term_loc,
        'post_type'  => $row->type,
        'permalink'  => $permalink,
      ]));
    }

    return $flat_list;
  }

  /**
   * Helper: Parse raw storage record and return list of resolved animations.
   */
  private function extract_animation_items($raw, array $meta): array
  {
    if (is_string($raw)) {
      $raw = json_decode($raw, true) ?: [];
    }
    if (!is_array($raw)) {
      return [];
    }

    $items = [];
    if (isset($raw['published']) && is_array($raw['published'])) {
      $items = $raw['published'];
    } elseif (isset($raw['animations']) && is_array($raw['animations'])) {
      $items = $raw['animations'];
    } elseif (isset($raw[0]) && is_array($raw[0])) {
      $items = $raw;
    }

    $output = [];
    foreach ($items as $idx => $anim) {
      if (!is_array($anim)) {
        continue;
      }

      $id = !empty($anim['id']) ? (string) $anim['id'] : $meta['key'] . '-' . $idx;
      /* translators: %d: Sequential animation index */
      $fallback_title = sprintf(__('Animation #%d', 'motionkit'), $idx + 1);
      $title = !empty($anim['title'])
        ? $anim['title']
        : (!empty($anim['name'])
            ? $anim['name']
            : (!empty($anim['presetKey']) ? str_replace(['motionkit-', '-'], ['', ' '], $anim['presetKey']) : $fallback_title));

      $target = !empty($anim['trigger']['selector'])
        ? $anim['trigger']['selector']
        : (!empty($anim['itemClass'])
            ? $anim['itemClass']
            : (!empty($anim['timeline']['animations'][0]['itemClass'])
                ? $anim['timeline']['animations'][0]['itemClass']
                : '.animated-element'));

      $engine = $this->resolve_animation_engine($anim);
      $status = (!empty($anim['disabled']) || (isset($anim['status']) && $anim['status'] === 'draft')) ? 'draft' : 'published';

      $edit_url = $this->build_editor_url($meta['permalink']);

      $output[] = [
        'id'          => $id,
        'title'       => ucwords(trim($title)),
        'target'      => $target,
        'engine'      => $engine,
        'status'      => $status,
        'is_active'   => ($status === 'published'),
        'location'    => $meta['location'],
        'permalink'   => $meta['permalink'],
        'edit_url'    => $edit_url,
        'store_type'  => $meta['store_type'],
        'store_key'   => $meta['key'],
        'store_id'    => $meta['id'],
      ];
    }

    return $output;
  }

  /**
   * Detect whether an animation runs on WAAPI or GSAP.
   */
  private function resolve_animation_engine(array $anim): string
  {
    if (isset($anim['engine']) && in_array($anim['engine'], ['waapi', 'gsap'], true)) {
      return $anim['engine'];
    }
    if (isset($anim['runtime']['engine']) && in_array($anim['runtime']['engine'], ['waapi', 'gsap'], true)) {
      return $anim['runtime']['engine'];
    }
    if (isset($anim['group']) && $anim['group'] === 'free_animation') {
      return 'waapi';
    }
    if (isset($anim['presetKey']) && strpos($anim['presetKey'], 'motionkit-free-') === 0) {
      return 'waapi';
    }
    return 'gsap';
  }

  /**
   * Helper: Build editor launch URL with session token.
   */
  private function build_editor_url(string $page_url): string
  {
    $token = '';
    if (function_exists('motionkit_editor_session_token')) {
      $token = motionkit_editor_session_token($page_url);
    }
    $query_args = [
      'site'            => $page_url,
      'platform'        => 'wordpress',
      'motionkit_token' => $token,
    ];
    $base_url = apply_filters('motionkit/editor/url', 'https://editor.motionkit.io/');
    return add_query_arg($query_args, $base_url);
  }

  /**
   * Apply a mutator callback to an animation by ID and persist back to database.
   */
  private function mutate_animation_by_id(string $target_id, callable $mutator): bool
  {
    $found = false;

    // Check global
    $global = get_option(self::GLOBAL_ANIMATIONS_OPTION, null);
    if ($global !== null) {
      $modified = false;
      $parsed = is_string($global) ? json_decode($global, true) : $global;
      if (is_array($parsed)) {
        $modified = $this->apply_mutation_to_envelope($parsed, $target_id, $mutator);
        if ($modified) {
          update_option(self::GLOBAL_ANIMATIONS_OPTION, $parsed);
          return true;
        }
      }
    }

    // Check post_meta
    global $wpdb;
    $prefix = self::ANIMATION_OPTION_PREFIX;
    $like = $wpdb->esc_like($prefix) . '%';
    $post_rows = $wpdb->get_results(
      $wpdb->prepare(
        "SELECT pm.post_id AS id, pm.meta_key AS `key`, pm.meta_value AS `value`
         FROM {$wpdb->postmeta} pm
         WHERE pm.meta_key LIKE %s",
        $like
      )
    );

    foreach ($post_rows as $row) {
      $parsed = is_string($row->value) ? json_decode($row->value, true) : $row->value;
      if (is_array($parsed)) {
        if ($this->apply_mutation_to_envelope($parsed, $target_id, $mutator)) {
          update_post_meta((int) $row->id, $row->key, $parsed);
          return true;
        }
      }
    }

    // Check term_meta
    $term_rows = $wpdb->get_results(
      $wpdb->prepare(
        "SELECT tm.term_id AS id, tm.meta_key AS `key`, tm.meta_value AS `value`
         FROM {$wpdb->termmeta} tm
         WHERE tm.meta_key LIKE %s",
        $like
      )
    );

    foreach ($term_rows as $row) {
      $parsed = is_string($row->value) ? json_decode($row->value, true) : $row->value;
      if (is_array($parsed)) {
        if ($this->apply_mutation_to_envelope($parsed, $target_id, $mutator)) {
          update_term_meta((int) $row->id, $row->key, $parsed);
          return true;
        }
      }
    }

    return false;
  }

  /**
   * Mutate all animations across all storage envelopes.
   */
  private function mutate_all_animations(callable $mutator): int
  {
    $count = 0;

    // 1. Global
    $global = get_option(self::GLOBAL_ANIMATIONS_OPTION, null);
    if ($global !== null) {
      $parsed = is_string($global) ? json_decode($global, true) : $global;
      if (is_array($parsed)) {
        $c = $this->apply_mutation_to_all_in_envelope($parsed, $mutator);
        if ($c > 0) {
          update_option(self::GLOBAL_ANIMATIONS_OPTION, $parsed);
          $count += $c;
        }
      }
    }

    // 2. Post meta
    global $wpdb;
    $prefix = self::ANIMATION_OPTION_PREFIX;
    $like = $wpdb->esc_like($prefix) . '%';
    $post_rows = $wpdb->get_results(
      $wpdb->prepare(
        "SELECT pm.post_id AS id, pm.meta_key AS `key`, pm.meta_value AS `value`
         FROM {$wpdb->postmeta} pm
         WHERE pm.meta_key LIKE %s",
        $like
      )
    );

    foreach ($post_rows as $row) {
      $parsed = is_string($row->value) ? json_decode($row->value, true) : $row->value;
      if (is_array($parsed)) {
        $c = $this->apply_mutation_to_all_in_envelope($parsed, $mutator);
        if ($c > 0) {
          update_post_meta((int) $row->id, $row->key, $parsed);
          $count += $c;
        }
      }
    }

    // 3. Term meta
    $term_rows = $wpdb->get_results(
      $wpdb->prepare(
        "SELECT tm.term_id AS id, tm.meta_key AS `key`, tm.meta_value AS `value`
         FROM {$wpdb->termmeta} tm
         WHERE tm.meta_key LIKE %s",
        $like
      )
    );

    foreach ($term_rows as $row) {
      $parsed = is_string($row->value) ? json_decode($row->value, true) : $row->value;
      if (is_array($parsed)) {
        $c = $this->apply_mutation_to_all_in_envelope($parsed, $mutator);
        if ($c > 0) {
          update_term_meta((int) $row->id, $row->key, $parsed);
          $count += $c;
        }
      }
    }

    return $count;
  }

  private function apply_mutation_to_envelope(array &$envelope, string $target_id, callable $mutator): bool
  {
    $keys = ['published', 'animations'];
    foreach ($keys as $k) {
      if (isset($envelope[$k]) && is_array($envelope[$k])) {
        foreach ($envelope[$k] as $idx => &$item) {
          $id = !empty($item['id']) ? (string) $item['id'] : (string) $idx;
          if ($id === $target_id) {
            return (bool) $mutator($item);
          }
        }
      }
    }

    // Flat array
    if (isset($envelope[0]) && is_array($envelope[0])) {
      foreach ($envelope as $idx => &$item) {
        $id = !empty($item['id']) ? (string) $item['id'] : (string) $idx;
        if ($id === $target_id) {
          return (bool) $mutator($item);
        }
      }
    }

    return false;
  }

  private function apply_mutation_to_all_in_envelope(array &$envelope, callable $mutator): int
  {
    $count = 0;
    $keys = ['published', 'animations'];
    foreach ($keys as $k) {
      if (isset($envelope[$k]) && is_array($envelope[$k])) {
        foreach ($envelope[$k] as &$item) {
          if ($mutator($item)) {
            $count++;
          }
        }
      }
    }

    if (isset($envelope[0]) && is_array($envelope[0])) {
      foreach ($envelope as &$item) {
        if ($mutator($item)) {
          $count++;
        }
      }
    }

    return $count;
  }

  private function delete_animation_by_id(string $target_id): bool
  {
    // Check global
    $global = get_option(self::GLOBAL_ANIMATIONS_OPTION, null);
    if ($global !== null) {
      $parsed = is_string($global) ? json_decode($global, true) : $global;
      if (is_array($parsed) && $this->remove_item_from_envelope($parsed, $target_id)) {
        update_option(self::GLOBAL_ANIMATIONS_OPTION, $parsed);
        return true;
      }
    }

    // Check post_meta
    global $wpdb;
    $prefix = self::ANIMATION_OPTION_PREFIX;
    $like = $wpdb->esc_like($prefix) . '%';
    $post_rows = $wpdb->get_results(
      $wpdb->prepare(
        "SELECT pm.post_id AS id, pm.meta_key AS `key`, pm.meta_value AS `value`
         FROM {$wpdb->postmeta} pm
         WHERE pm.meta_key LIKE %s",
        $like
      )
    );

    foreach ($post_rows as $row) {
      $parsed = is_string($row->value) ? json_decode($row->value, true) : $row->value;
      if (is_array($parsed) && $this->remove_item_from_envelope($parsed, $target_id)) {
        update_post_meta((int) $row->id, $row->key, $parsed);
        return true;
      }
    }

    // Check term_meta
    $term_rows = $wpdb->get_results(
      $wpdb->prepare(
        "SELECT tm.term_id AS id, tm.meta_key AS `key`, tm.meta_value AS `value`
         FROM {$wpdb->termmeta} tm
         WHERE tm.meta_key LIKE %s",
        $like
      )
    );

    foreach ($term_rows as $row) {
      $parsed = is_string($row->value) ? json_decode($row->value, true) : $row->value;
      if (is_array($parsed) && $this->remove_item_from_envelope($parsed, $target_id)) {
        update_term_meta((int) $row->id, $row->key, $parsed);
        return true;
      }
    }

    return false;
  }
  // phpcs:enable WordPress.DB.DirectDatabaseQuery

  private function remove_item_from_envelope(array &$envelope, string $target_id): bool
  {
    $keys = ['published', 'animations'];
    foreach ($keys as $k) {
      if (isset($envelope[$k]) && is_array($envelope[$k])) {
        $before = count($envelope[$k]);
        $envelope[$k] = array_values(array_filter($envelope[$k], function ($item) use ($target_id) {
          $id = !empty($item['id']) ? (string) $item['id'] : '';
          return $id !== $target_id;
        }));
        if (count($envelope[$k]) < $before) {
          return true;
        }
      }
    }

    if (isset($envelope[0]) && is_array($envelope[0])) {
      $before = count($envelope);
      $envelope = array_values(array_filter($envelope, function ($item) use ($target_id) {
        $id = !empty($item['id']) ? (string) $item['id'] : '';
        return $id !== $target_id;
      }));
      if (count($envelope) < $before) {
        return true;
      }
    }

    return false;
  }
}
