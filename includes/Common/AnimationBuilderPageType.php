<?php

namespace MotionKit\Common;

if (!defined('ABSPATH')) {
  exit; // Exit if accessed directly
}

class AnimationBuilderPageType
{
  private static $instance = null;

  private $gl = ['category', 'author', 'post_tag', 'archive', 'custom-taxonomy'];

  /**
   * Option name prefix for storing configs.
   */
  public $option_name = 'mkit_pg_animation_';

  /**
   * Instance
   *
   * @return self An instance of the class.
   */
  public static function instance()
  {
    if (is_null(self::$instance)) {
      self::$instance = new self();
    }
    return self::$instance;
  }

  public function __construct()
  {
  }

  /**
   * Resolve config array — accepts explicit config or falls back to current page.
   *
   * @param array|false $page_type Explicit page type config or false.
   * @return array
   */
  private function resolveConfig($page_type = false)
  {
    return $page_type ? $page_type : $this->getCurrentPageType();
  }

  /**
   * Save configuration for a given page type.
   *
   * @param array $config  Page type config from getCurrentPageType().
   * @param mixed $animconf Animation configuration data.
   * @return bool
   */
  public function saveConfig($config, $animconf)
  {
    switch ($config['store_type'] ?? '') {
      case 'post_meta':
        return update_post_meta($config['id'], $config['option'], $animconf);
      case 'term_meta':
        return update_term_meta($config['id'], $config['option'], $animconf);
      case 'option':
      default:
        return update_option($config['option'], $animconf);
    }
  }

  /**
   * Retrieve configuration for a given page type.
   *
   * @param array|false $page_type Explicit config or false for auto-detect.
   * @return mixed
   */
  public function getConfig($page_type = false)
  {
    $config = $this->resolveConfig($page_type);

    switch ($config['store_type'] ?? '') {
      case 'post_meta':
        return get_post_meta($config['id'], $config['option'], true);
      case 'term_meta':
        return get_term_meta($config['id'], $config['option'], true);
      case 'option':
        return get_option($config['option']);
      default:
        return [];
    }
  }

  /**
   * Delete configuration for a given page type.
   *
   * @param array|null $page_type Explicit config or null for auto-detect.
   * @return bool
   */
  public function deleteConfig($page_type = null)
  {
    $config = $this->resolveConfig($page_type);

    switch ($config['store_type'] ?? '') {
      case 'post_meta':
        return delete_post_meta($config['id'], $config['option']);
      case 'term_meta':
        return delete_term_meta($config['id'], $config['option']);
      case 'option':
        return delete_option($config['option']);
      default:
        return false;
    }
  }

  /**
   * Determine the type of the current page and return a configuration identifier.
   *
   * @return array
   */
  public function getCurrentPageType()
  {
    // Check if it's the front page
    if (is_front_page()) {
      if ('page' === get_option('show_on_front')) {
        return [
          'type'       => 'post',
          'store_type' => 'option',
          'option'     => $this->option_name . 'front_' . get_option('page_on_front')
        ];
      } else {
        return [
          'type'       => 'post',
          'store_type' => 'option',
          'option'     => $this->option_name . 'blog'
        ];
      }
    }

    if (is_home()) {
      if ('page' === get_option('show_on_front')) {
        return [
          'type'       => 'post',
          'store_type' => 'option',
          'option'     => $this->option_name . 'front_' . get_option('page_on_front')
        ];
      }

      return [
        'type'       => 'post',
        'store_type' => 'option',
        'option'     => $this->option_name . 'home_' . get_the_ID()
      ];
    }

    if (is_singular()) {
      return [
        'store_type' => 'post_meta',
        'id'         => get_queried_object_id(),
        'option'     => $this->option_name . get_post_type()
      ];
    }

    if (is_tag() || is_category()) {
      $term = get_queried_object();
      $is_global = in_array($term->taxonomy, $this->gl, true);
      return [
        'type'       => 'blog_tax',
        'id'         => get_queried_object_id(),
        'store_type' => $is_global ? 'option' : 'term_meta',
        'option'     => $is_global
          ? $this->option_name . $term->taxonomy
          : $this->option_name . $term->taxonomy . '_' . get_queried_object_id(),
        'taxonomy'   => $term->taxonomy,
      ];
    }

    if (is_tax()) {
      $term = get_queried_object();
      return [
        'type'       => 'custom_taxonomy',
        'store_type' => 'option',
        'option'     => $this->option_name . $term->taxonomy,
        'taxonomy'   => $term->taxonomy,
      ];
    }

    if (is_author()) {
      return [
        'type'       => 'author',
        'store_type' => 'option',
        'option'     => $this->option_name . 'author',
        'taxonomy'   => 'author'
      ];
    }

    if (is_404()) {
      return [
        'type'       => 'post',
        'store_type' => 'option',
        'option'     => $this->option_name . '404',
      ];
    }

    if (is_search()) {
      return [
        'type'       => 'search',
        'store_type' => 'option',
        'option'     => $this->option_name . 'search'
      ];
    }

    $req = wp_parse_url($GLOBALS['wp']->request);
    $path = isset($req['path']) ? $req['path'] : '';

    if (is_archive()) {
      return [
        'type'       => 'archive',
        'store_type' => 'option',
        'option'     => $this->option_name . ($path ?: 'archive')
      ];
    }

    return [
      'type'       => 'url',
      'store_type' => 'option',
      'option'     => $this->option_name . ($path ?: 'unknown')
    ];
  }
}
