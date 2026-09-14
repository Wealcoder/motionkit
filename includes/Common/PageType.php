<?php

namespace MotionKit\Common;

/**
 * Which storage slot the current request's animations live in.
 *
 * WordPress page types do not map onto post types: the front page is a post of
 * type "page" but is stored under "front_page", and archives, search and 404
 * have no post at all. Reading a page's animations by post type therefore finds
 * nothing for exactly the pages users most often animate.
 *
 * This is the read-side mirror of the resolution the editor bridge performs when
 * it SAVES, and the two must agree — a save under one key and a read under
 * another looks like data loss with no error anywhere.
 *
 * @package MotionKit
 * @since 1.0.0
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

final class PageType
{
    /**
     * Resolve the current request to its storage slot.
     *
     * @return array{id: int, type: string, store_type: string, option: string}
     */
    public static function current(): array
    {
        $id = 0;
        $type = 'page';
        $store_type = 'post_meta';

        if (is_front_page()) {
            $queried_id = (int) get_queried_object_id();
            if ($queried_id > 0) {
                $id = $queried_id;
                $store_type = 'post_meta';
            } else {
                $page_on_front = (int) get_option('page_on_front');
                if ($page_on_front > 0) {
                    $id = $page_on_front;
                    $store_type = 'post_meta';
                } else {
                    $store_type = 'option';
                }
            }
            $type = 'front_page';
        } elseif (is_home()) {
            $queried_id = (int) get_queried_object_id();
            if ($queried_id > 0) {
                $id = $queried_id;
                $store_type = 'post_meta';
            } else {
                $page_for_posts = (int) get_option('page_for_posts');
                $id = $page_for_posts > 0 ? $page_for_posts : 0;
                $store_type = $id > 0 ? 'post_meta' : 'option';
            }
            $type = 'home';
        } elseif (is_singular()) {
            $id = (int) get_queried_object_id();
            $post_type = get_post_type();
            $type = is_string($post_type) && $post_type !== '' ? $post_type : 'post';
            $store_type = $id > 0 ? 'post_meta' : 'option';
        } elseif (is_category() || is_tag() || is_tax()) {
            $id = (int) get_queried_object_id();
            $type = is_category() ? 'category' : (is_tag() ? 'post_tag' : (string) get_query_var('taxonomy'));
            $store_type = $id > 0 ? 'term_meta' : 'option';
        } elseif (is_search()) {
            $type = 'search';
            $store_type = 'option';
        } elseif (is_404()) {
            $type = '404';
            $store_type = 'option';
        } elseif (is_archive()) {
            $type = 'archive';
            $store_type = 'option';
        }

        $option = 'motionkit_pg_animation_' . $type;
        // Only an option-stored slot needs the id in its key; post_meta and term_meta are already scoped by the object they hang off.
        if ($store_type === 'option' && $id > 0) {
            $option .= '_' . $id;
        }

        return [
            'id'         => $id,
            'type'       => (string) $type,
            'store_type' => (string) $store_type,
            'option'     => (string) $option,
        ];
    }

    /**
     * Read the animations stored for the current request, whichever slot they are in.
     *
     * @return array
     */
    public static function current_animations(): array
    {
        $config = self::current();

        if ($config['store_type'] === 'post_meta' && $config['id'] > 0) {
            return (array) get_post_meta($config['id'], $config['option'], true);
        }

        if ($config['store_type'] === 'term_meta' && $config['id'] > 0) {
            return (array) get_term_meta($config['id'], $config['option'], true);
        }

        return (array) get_option($config['option'], []);
    }
}
