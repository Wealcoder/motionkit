<?php

namespace MotionKit\Admin;

use MotionKit\Common\AnimationResolver;
use MotionKit\Common\PageType;

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
    add_action('wp_ajax_motionkit_animations_bulk', [$this, 'ajax_animations_bulk']);
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

    $page_filter = isset($_POST['page_key']) ? sanitize_text_field(wp_unslash($_POST['page_key'])) : '';

    $animations = $this->collect_all_animations();
    // The page list is built before the filter runs, so the dropdown keeps every page while one is selected.
    $pages = $this->page_options($animations);

    if ($page_filter !== '') {
      $animations = array_values(array_filter($animations, function ($anim) use ($page_filter) {
        return $anim['page_key'] === $page_filter;
      }));
    }

    wp_send_json_success([
      'animations' => $animations,
      'total'      => count($animations),
      'pages'      => $pages,
    ]);
  }

  /**
   * The pages the list can be narrowed to, grouped the way the dropdown shows them.
   *
   * One entry per page key, in the order the buckets were read (site-wide
   * first, then posts, then terms, then the option-stored pages), each with
   * the group it belongs to and how many animations it carries.
   *
   * @param array<int, array> $animations The unfiltered list.
   * @return array<int, array{key: string, label: string, group: string, count: int}>
   */
  private function page_options(array $animations): array
  {
    $pages = [];
    foreach ($animations as $anim) {
      $key = $anim['page_key'];
      if (!isset($pages[$key])) {
        $pages[$key] = [
          'key'   => $key,
          'label' => $anim['location'],
          'group' => $anim['page_group'],
          'count' => 0,
        ];
      }
      ++$pages[$key]['count'];
    }

    return array_values($pages);
  }

  /**
   * The key the dashboard filters a page by, and the group it is listed under.
   *
   * A page's published and draft buckets are two records with one page behind
   * them, so the key names the page rather than the record: the post, the
   * term, the site-wide bucket, or the option slot without its prefix.
   *
   * @return array{0: string, 1: string} The page key and its group label.
   */
  private function page_identity(string $store_type, int $id, string $key, string $post_type): array
  {
    if ($store_type === 'post_meta') {
      $type = get_post_type_object($post_type);
      $group = $type && isset($type->labels->name) ? (string) $type->labels->name : ucfirst($post_type);
      return ['post-' . $id, $group];
    }
    if ($store_type === 'term_meta') {
      $taxonomy = get_taxonomy($post_type);
      $group = $taxonomy && isset($taxonomy->labels->name) ? (string) $taxonomy->labels->name : ucfirst($post_type);
      return ['term-' . $id, $group];
    }
    if (strpos($key, 'motionkit_global_animations') === 0) {
      return ['global', __('Site-wide', 'motionkit')];
    }

    return ['option-' . $this->option_slot($key), __('Other pages', 'motionkit')];
  }

  /**
   * The slot an option-stored page is saved under, without the published or draft prefix: `front_page`, `search`, `404`, `archive`, `home`.
   */
  private function option_slot(string $key): string
  {
    foreach ([self::ANIMATION_OPTION_PREFIX, self::DRAFT_OPTION_PREFIX] as $prefix) {
      if (strpos($key, $prefix) === 0) {
        return substr($key, strlen($prefix));
      }
    }

    return $key;
  }

  /**
   * What an option-stored page is called and where it is, from its slot.
   *
   * The URL must resolve to a request of that slot's kind, since both View
   * page and the editor open it and the editor saves under whatever
   * PageType::current() sees there; the home URL sent the 404 page's
   * animation to the front page. The 404 and search URLs are the ones the
   * editor's own page list uses (the connector's search_pages()).
   *
   * @return array{0: string, 1: string} The label and the page's URL.
   */
  private function option_page(string $slot): array
  {
    switch ($slot) {
      case 'front_page':
        return [__('Front page', 'motionkit'), home_url('/')];
      case 'home':
        return [__('Blog (latest posts)', 'motionkit'), home_url('/')];
      case 'search':
        return [__('Search results', 'motionkit'), home_url('/?s=blog')];
      case '404':
        return [__('404 page', 'motionkit'), home_url('/404-preview/')];
      case 'archive':
        // Any archive shares the slot; the site's first author archive is one that exists on every site and never 404s.
        return [__('Archives', 'motionkit'), get_author_posts_url($this->first_author_id())];
    }

    /* translators: %s: the storage slot an option-stored page is saved under */
    return [sprintf(__('Page slot: %s', 'motionkit'), $slot), home_url('/')];
  }

  /**
   * The lowest user id with published posts, or the first user when nobody has any.
   */
  private function first_author_id(): int
  {
    $authors = get_users(['has_published_posts' => true, 'orderby' => 'ID', 'number' => 1, 'fields' => 'ID']);
    if ($authors === []) {
      $authors = get_users(['orderby' => 'ID', 'number' => 1, 'fields' => 'ID']);
    }

    return $authors === [] ? 1 : (int) $authors[0];
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

    $new_status = '';
    $error = $this->toggle_one($anim_id, $new_status);
    if ($error === null) {
      wp_send_json_success([
        'animation_id' => $anim_id,
        'new_status'   => $new_status,
        'is_active'    => ($new_status === 'published'),
      ]);
    }

    wp_send_json_error(['message' => $error], $new_status === '' ? 409 : 404);
  }

  /**
   * AJAX: Toggle or delete several animations in one request, one after another.
   *
   * The dashboard used to fire one request per selected row at the same time.
   * Every toggle or delete rewrites the whole bucket the id lives in, so two
   * rows on the same page raced: the last request to write put back the status
   * the others had just changed, while each answer still said success.
   */
  public function ajax_animations_bulk(): void
  {
    if (!current_user_can('manage_options')) {
      wp_send_json_error(['message' => 'Unauthorized'], 403);
    }
    check_ajax_referer('motionkit_animations_ajax', 'nonce');

    $bulk_action = isset($_POST['bulk_action']) ? sanitize_key(wp_unslash($_POST['bulk_action'])) : '';
    $ids = isset($_POST['animation_ids']) && is_array($_POST['animation_ids'])
      ? array_map('sanitize_text_field', wp_unslash($_POST['animation_ids']))
      : [];
    $ids = array_values(array_unique(array_filter($ids, static function ($id) {
      return $id !== '';
    })));

    if (!in_array($bulk_action, ['publish', 'draft', 'toggle_status', 'delete'], true) || [] === $ids) {
      wp_send_json_error(['message' => 'Missing animation IDs or bulk action'], 400);
    }

    // Publish and Set as Draft set one status on every row; Toggle flips each row from wherever it is.
    $targets = ['publish' => 'published', 'draft' => 'draft', 'toggle_status' => null];

    $done = 0;
    $failed = [];
    foreach ($ids as $anim_id) {
      $error = $bulk_action === 'delete'
        ? $this->delete_one($anim_id)
        : $this->set_status_one($anim_id, $targets[$bulk_action]);
      if ($error === null) {
        ++$done;
      } else {
        $failed[] = ['id' => $anim_id, 'message' => $error];
      }
    }

    wp_send_json_success([
      'action' => $bulk_action,
      'done'   => $done,
      'total'  => count($ids),
      'failed' => $failed,
    ]);
  }

  /**
   * One status toggle, shared by the single and the bulk endpoint.
   *
   * @param string $anim_id    The animation id.
   * @param string $new_status Set to the status the animation now has; left '' when it could not be toggled.
   * @return string|null Null on success, otherwise the message for the user.
   */
  private function toggle_one(string $anim_id, string &$new_status = ''): ?string
  {
    return $this->set_status_one($anim_id, null, $new_status);
  }

  /**
   * Set one animation's status, or flip it.
   *
   * @param string      $anim_id    The animation id.
   * @param string|null $target     'published', 'draft', or null to flip whatever it is now.
   * @param string      $new_status Set to the status the animation now has; left '' when it could not be changed.
   * @return string|null Null on success, otherwise the message for the user.
   */
  private function set_status_one(string $anim_id, ?string $target, string &$new_status = ''): ?string
  {
    $new_status = '';

    // A never-published animation lives only in the draft bucket, which no visitor is served, so flipping its flag there would show Active for nothing; publishing it is the move the editor's save makes, into the page's published bucket. Asking for draft is the one thing such a record already is, so that is a no-op rather than a refusal.
    if ($this->lives_only_in_drafts($anim_id)) {
      if ($target === 'draft') {
        $new_status = 'draft';
        return null;
      }
      if (!$this->publish_from_drafts($anim_id)) {
        return __('Animation not found.', 'motionkit');
      }
      $new_status = 'published';
      return null;
    }

    $status = 'published';
    $updated = $this->mutate_animation_by_id($anim_id, function (&$anim) use (&$status, $target) {
      // Read the way the frontend reads it, so the change lands on what a visitor actually sees.
      $is_published = AnimationResolver::is_published($anim);
      $status = $target ?? ($is_published ? 'draft' : 'published');
      $anim['status'] = $status;
      $anim['disabled'] = ($status === 'draft');
      return true;
    });

    if (!$updated) {
      return __('Animation not found.', 'motionkit');
    }

    $new_status = $status;
    return null;
  }

  /**
   * Move a never-published record out of its draft bucket into the page's
   * published bucket, stamped published — what the editor's save does when a
   * draft is published there (AnimationResolver::partition_for_storage()).
   * An emptied draft bucket is deleted rather than written back empty, as the
   * editor's save does too.
   *
   * @return bool False when no draft bucket holds the id.
   */
  private function publish_from_drafts(string $anim_id): bool
  {
    foreach ($this->buckets() as $bucket) {
      if (!$bucket['draft']) {
        continue;
      }
      $drafts = $this->decode_record($bucket['value']);
      $entry = $this->take_item_from_envelope($drafts, $anim_id);
      if ($entry === null) {
        continue;
      }

      $draft_config = [
        'store_type' => $bucket['store_type'],
        'option'     => $bucket['key'],
        'id'         => (int) $bucket['id'],
      ];
      $published_config = $draft_config;
      $published_config['option'] = $this->published_key_for($bucket['key']);

      // The published bucket as the editor writes it: a flat list (PageType::read() unwraps an older envelope).
      $list = PageType::read($published_config);
      $list[] = AnimationResolver::with_status($entry, AnimationResolver::STATUS_PUBLISHED);
      $this->write_bucket($published_config, $list);

      if ($this->envelope_list($drafts) === []) {
        PageType::delete($draft_config);
      } else {
        $bucket['write']($drafts);
      }
      AnimationResolver::forget_globals();

      return true;
    }

    return false;
  }

  /**
   * The published key a draft key pairs with: the global draft option's live option, or the page prefix swapped.
   */
  private function published_key_for(string $draft_key): string
  {
    if ($draft_key === AnimationResolver::GLOBAL_DRAFT_OPTION) {
      return AnimationResolver::GLOBAL_PUBLISHED_OPTION;
    }
    if (strpos($draft_key, self::DRAFT_OPTION_PREFIX) === 0) {
      return self::ANIMATION_OPTION_PREFIX . substr($draft_key, strlen(self::DRAFT_OPTION_PREFIX));
    }

    return $draft_key;
  }

  /**
   * Write a bucket by its descriptor, the way this class's bucket writers do: meta is slashed first because the meta API unslashes what it is given; options are not.
   */
  private function write_bucket(array $config, array $data): void
  {
    $id = (int) $config['id'];
    switch ($config['store_type']) {
      case 'post_meta':
        update_post_meta($id, $config['option'], wp_slash($data));
        break;
      case 'term_meta':
        update_term_meta($id, $config['option'], wp_slash($data));
        break;
      default:
        update_option($config['option'], $data);
        break;
    }
  }

  /**
   * One delete, shared by the single and the bulk endpoint.
   *
   * @param string $anim_id The animation id.
   * @return string|null Null on success, otherwise the message for the user.
   */
  private function delete_one(string $anim_id): ?string
  {
    return $this->delete_animation_by_id($anim_id) ? null : __('Animation not found.', 'motionkit');
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

    $error = $this->delete_one($anim_id);

    if ($error === null) {
      wp_send_json_success([
        'animation_id' => $anim_id,
        'message'      => __('Animation removed.', 'motionkit'),
      ]);
    }

    wp_send_json_error(['message' => $error], 404);
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

      // Pages with no post behind them (a latest-posts front page, search, 404, archives) are saved as options under the same prefixes; they were never listed here, so an animation on the front page of a blog was missing from the dashboard.
      $option_rows = $wpdb->get_results(
        $wpdb->prepare(
          "SELECT option_name AS `key`, option_value AS `value`
           FROM {$wpdb->options}
           WHERE option_name LIKE %s",
          $like
        )
      );
      foreach ($option_rows as $row) {
        $key = (string) $row->key;
        [$location, $permalink] = $this->option_page($this->option_slot($key));
        $bucket = [
          'store_type' => 'option',
          'key'        => $key,
          'id'         => 0,
          'draft'      => $is_draft,
          'location'   => $location,
          'post_type'  => '',
          'permalink'  => $permalink,
          'value'      => $row->value,
          'write'      => static function ($data) use ($key): void {
            update_option($key, $data);
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
      [$page_key, $page_group] = $this->page_identity($meta['store_type'], (int) $meta['id'], $meta['key'], $meta['post_type']);

      $output[] = [
        'id'          => $id,
        'title'       => trim($title),
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
        'page_key'    => $page_key,
        'page_group'  => $page_group,
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

  /**
   * The list an envelope holds: under `published` or `animations` in an older shape, or the envelope itself when flat.
   *
   * @return array<int, mixed>
   */
  private function envelope_list(array $envelope): array
  {
    foreach (['published', 'animations'] as $k) {
      if (isset($envelope[$k]) && is_array($envelope[$k])) {
        return array_values($envelope[$k]);
      }
    }

    return isset($envelope[0]) && is_array($envelope[0]) ? array_values($envelope) : [];
  }

  /**
   * Remove one item from an envelope by id and hand it back, whatever shape the envelope has.
   *
   * @return array|null The item, or null when the envelope does not hold the id.
   */
  private function take_item_from_envelope(array &$envelope, string $target_id): ?array
  {
    $list_key = null;
    foreach (['published', 'animations'] as $k) {
      if (isset($envelope[$k]) && is_array($envelope[$k])) {
        $list_key = $k;
        break;
      }
    }
    $list = $list_key === null ? $envelope : $envelope[$list_key];
    if ($list_key === null && !(isset($list[0]) && is_array($list[0]))) {
      return null;
    }

    $taken = null;
    $kept = [];
    foreach ($list as $idx => $item) {
      $id = is_array($item) && !empty($item['id']) ? (string) $item['id'] : (string) $idx;
      if ($taken === null && is_array($item) && $id === $target_id) {
        $taken = $item;
        continue;
      }
      $kept[] = $item;
    }
    if ($taken === null) {
      return null;
    }

    if ($list_key === null) {
      $envelope = $kept;
    } else {
      $envelope[$list_key] = $kept;
    }

    return $taken;
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
