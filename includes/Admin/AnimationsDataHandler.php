<?php

namespace MotionKit\Admin;

use MotionKit\Common\AnimationResolver;

/**
 * MotionKit WordPress Plugin — Active Animations manager.
 *
 * Scans, resolves, and manages animation records across global options,
 * post meta, and term meta. Provides AJAX endpoints for the Active Animations
 * dashboard tab: the list, the status toggle and delete.
 *
 * It never rewrites an animation's engine. The runtimes decide free vs GSAP from
 * the record's group and preset key, so an `engine` tag written here changed the
 * badge and nothing else — and tagging a GSAP animation `waapi` only stopped it.
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
  // The page's other half: never-published animations, and the working copy of every published one under its own id.
  private const DRAFT_OPTION_PREFIX = 'motionkit_pg_draft_';

  public function init(): void
  {
    add_action('wp_ajax_motionkit_animations_list', [$this, 'ajax_animations_list']);
    add_action('wp_ajax_motionkit_toggle_animation_status', [$this, 'ajax_toggle_animation_status']);
    add_action('wp_ajax_motionkit_delete_single_animation', [$this, 'ajax_delete_single_animation']);
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

    wp_send_json_success([
      'animations' => $animations,
      'total'      => count($animations),
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

    // Publishing is the editor's save, which moves the record between buckets; flipping a flag inside the draft bucket would show Active for something no visitor gets.
    if ($this->lives_only_in_drafts($anim_id)) {
      wp_send_json_error(['message' => __('This animation has not been published yet. Publish it from the editor.', 'motionkit')], 409);
    }

    $new_status = 'published';
    $updated = $this->mutate_animation_by_id($anim_id, function (&$anim) use (&$new_status) {
      // Read the way the frontend reads it, so the toggle flips what a visitor actually sees.
      $is_published = AnimationResolver::is_published($anim);
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
  public function collect_all_animations(): array
  {
    $flat_list = [];
    $seen = [];

    foreach ($this->buckets() as $bucket) {
      foreach ($this->extract_animation_items($bucket) as $item) {
        // Buckets come published first, so by the time a draft bucket is read the live row already stands for every id it carries a working copy of; only a never-published draft is new.
        if (isset($seen[$item['id']])) {
          continue;
        }
        $seen[$item['id']] = true;
        $flat_list[] = $item;
      }
    }

    return $flat_list;
  }

  /**
   * Every record an animation can live in, as the database holds it.
   *
   * Published buckets first, so a mutation by id lands on the live copy before
   * its working copy. Each bucket carries its own writer: the meta API
   * unslashes what it is given, so an array going back through it is slashed
   * first (as the connector's saveConfig() does); options are not.
   *
   * @return array<int, array{store_type: string, key: string, id: int, draft: bool, location: string, post_type: string, permalink: string, value: mixed, write: callable}>
   */
  private function buckets(): array
  {
    global $wpdb;
    $published = [];
    $drafts = [];

    $globals = [
      [AnimationResolver::GLOBAL_PUBLISHED_OPTION, false],
      [AnimationResolver::GLOBAL_DRAFT_OPTION, true],
    ];
    foreach ($globals as [$option, $is_draft]) {
      $bucket = [
        'store_type' => 'option',
        'key'        => $option,
        'id'         => 0,
        'draft'      => $is_draft,
        'location'   => __('Global (Entire Site)', 'motionkit'),
        'post_type'  => '',
        'permalink'  => home_url('/'),
        'value'      => get_option($option, []),
        'write'      => static function ($data) use ($option): void {
          update_option($option, $data);
          AnimationResolver::forget_globals();
        },
      ];
      if ($is_draft) {
        $drafts[] = $bucket;
      } else {
        $published[] = $bucket;
      }
    }

    $prefixes = [
      [self::ANIMATION_OPTION_PREFIX, false],
      [self::DRAFT_OPTION_PREFIX, true],
    ];
    foreach ($prefixes as [$prefix, $is_draft]) {
      $like = $wpdb->esc_like($prefix) . '%';

      $post_rows = $wpdb->get_results(
        $wpdb->prepare(
          "SELECT post_id AS id, meta_key AS `key`, meta_value AS `value`
           FROM {$wpdb->postmeta}
           WHERE meta_key LIKE %s",
          $like
        )
      );
      foreach ($post_rows as $row) {
        $post_id = (int) $row->id;
        $key = (string) $row->key;
        // Meta left behind by a deleted post has no page to list it under.
        $post = get_post($post_id);
        if (!$post) {
          continue;
        }
        /* translators: %d: WordPress post ID */
        $location = $post->post_title !== '' ? $post->post_title : sprintf(__('Post #%d', 'motionkit'), $post_id);
        $bucket = [
          'store_type' => 'post_meta',
          'key'        => $key,
          'id'         => $post_id,
          'draft'      => $is_draft,
          'location'   => $location,
          'post_type'  => $post->post_type,
          'permalink'  => get_permalink($post) ?: home_url('/'),
          'value'      => $row->value,
          'write'      => static function ($data) use ($post_id, $key): void {
            update_post_meta($post_id, $key, wp_slash($data));
          },
        ];
        if ($is_draft) {
          $drafts[] = $bucket;
        } else {
          $published[] = $bucket;
        }
      }

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
        $term_id = (int) $row->id;
        $key = (string) $row->key;
        $term_link = get_term_link($term_id);
        $bucket = [
          'store_type' => 'term_meta',
          'key'        => $key,
          'id'         => $term_id,
          'draft'      => $is_draft,
          /* translators: %s: WordPress taxonomy term name */
          'location'   => sprintf(__('Term: %s', 'motionkit'), $row->title),
          'post_type'  => (string) $row->type,
          'permalink'  => is_wp_error($term_link) ? home_url('/') : $term_link,
          'value'      => $row->value,
          'write'      => static function ($data) use ($term_id, $key): void {
            update_term_meta($term_id, $key, wp_slash($data));
          },
        ];
        if ($is_draft) {
          $drafts[] = $bucket;
        } else {
          $published[] = $bucket;
        }
      }
    }

    return array_merge($published, $drafts);
  }

  /**
   * A bucket as the database holds it.
   *
   * The meta API serialises arrays, and this class reads meta rows straight
   * from the table rather than through get_post_meta(), so a record came back
   * as a serialised string that json_decode() turned into nothing — every site
   * read as having no animations. An older build stored JSON, which is still read.
   *
   * @param mixed $raw Raw option or meta value.
   * @return array
   */
  private function decode_record($raw): array
  {
    if (is_string($raw)) {
      $raw = maybe_unserialize($raw);
    }
    if (is_string($raw)) {
      $raw = json_decode($raw, true);
    }

    return is_array($raw) ? $raw : [];
  }

  /**
   * Helper: Parse one bucket and return its list of resolved animations.
   */
  private function extract_animation_items(array $bucket): array
  {
    $raw = $this->decode_record($bucket['value']);
    $meta = $bucket;

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
      // Read the way the frontend reads it, so a row says Active only when a visitor would see it; nothing in a draft bucket is served, whatever its own flag says.
      $status = (!$bucket['draft'] && AnimationResolver::is_published($anim)) ? 'published' : 'draft';

      $edit_url = $this->build_editor_url($meta['permalink']);

      $output[] = [
        'id'          => $id,
        'title'       => trim($title),
        'target'      => $target,
        'engine'      => $engine,
        'status'      => $status,
        'is_active'   => ($status === 'published'),
        // A never-published draft is published from the editor, not from here.
        'can_toggle'  => !$bucket['draft'],
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
    foreach ($this->buckets() as $bucket) {
      $parsed = $this->decode_record($bucket['value']);
      if ($this->apply_mutation_to_envelope($parsed, $target_id, $mutator)) {
        $bucket['write']($parsed);
        return true;
      }
    }

    return false;
  }

  /**
   * Whether an id is found in a draft bucket and in no published one: a never-published animation.
   */
  private function lives_only_in_drafts(string $target_id): bool
  {
    $in_published = false;
    $in_draft = false;

    foreach ($this->buckets() as $bucket) {
      if (!$this->envelope_has_id($this->decode_record($bucket['value']), $target_id)) {
        continue;
      }
      if ($bucket['draft']) {
        $in_draft = true;
      } else {
        $in_published = true;
      }
    }

    return $in_draft && !$in_published;
  }

  private function envelope_has_id(array $envelope, string $target_id): bool
  {
    $lists = [];
    foreach (['published', 'animations'] as $k) {
      if (isset($envelope[$k]) && is_array($envelope[$k])) {
        $lists[] = $envelope[$k];
      }
    }
    if (isset($envelope[0]) && is_array($envelope[0])) {
      $lists[] = $envelope;
    }

    foreach ($lists as $list) {
      foreach ($list as $idx => $item) {
        $id = is_array($item) && !empty($item['id']) ? (string) $item['id'] : (string) $idx;
        if ($id === $target_id) {
          return true;
        }
      }
    }

    return false;
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

  /**
   * Remove an animation from every bucket it is in, not the first match: a
   * published animation's working copy sits in the draft bucket under the same
   * id, and left behind it would come back in the editor as a never-published draft.
   */
  private function delete_animation_by_id(string $target_id): bool
  {
    $removed = false;

    foreach ($this->buckets() as $bucket) {
      $parsed = $this->decode_record($bucket['value']);
      if ($this->remove_item_from_envelope($parsed, $target_id)) {
        $bucket['write']($parsed);
        $removed = true;
      }
    }

    return $removed;
  }

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
