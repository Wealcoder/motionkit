<?php

namespace MotionKit\Common;

/**
 * Which runtime an animation belongs to.
 *
 * This is the PHP mirror of isWaapiAnimation() in the editor's engine source
 * (src/motionkit-waapi/isWaapiAnimation.js). The two must agree: PHP decides
 * whether to enqueue the runtime at all, and JS decides what to play once it is
 * loaded. When they disagreed in an earlier engine the looser side won and
 * animations either loaded a runtime they never used or were dropped with no
 * error, so the rule lives in one named place on each side rather than being
 * restated at every call site.
 *
 * @package MotionKit
 * @since 1.0.0
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

class AnimationEngine
{
    /**
     * Whether the record runs on the free native WAAPI runtime.
     *
     * Three signals, any one of which is enough: an explicit engine tag, the
     * group the editor stamps on a free animation, or a free preset key.
     *
     * @param array $anim Stored animation record.
     * @return bool
     */
    public static function is_waapi(array $anim): bool
    {
        if (isset($anim['engine']) && $anim['engine'] === 'waapi') {
            return true;
        }

        if (isset($anim['runtime']['engine']) && $anim['runtime']['engine'] === 'waapi') {
            return true;
        }

        if (isset($anim['group']) && $anim['group'] === 'free_animation') {
            return true;
        }

        if (isset($anim['presetKey']) && is_string($anim['presetKey'])
            && strpos($anim['presetKey'], 'motionkit-free-') === 0) {
            return true;
        }

        return false;
    }

    /**
     * Keeps only the animations the WAAPI runtime can play.
     *
     * @param array $animations Stored animation records.
     * @return array Re-indexed list, so it still encodes as a JSON array.
     */
    public static function filter_waapi(array $animations): array
    {
        $waapi = [];

        foreach ($animations as $anim) {
            if (is_array($anim) && self::is_waapi($anim)) {
                $waapi[] = $anim;
            }
        }

        return $waapi;
    }
}
