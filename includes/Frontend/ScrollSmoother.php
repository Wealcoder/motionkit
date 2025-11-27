<?php

namespace WcfAnimationBuilder\Frontend;

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

/**
 * AAE Smoother Manager Class
 *
 * Manages smooth scrolling wrapper to prevent conflicts between multiple plugins.
 *
 * @package WcfAnimationBuilder
 * @since 1.0.0
 */
class ScrollSmoother {  

    /**
     * Check if wrapper already printed
     *
     * @var bool
     */
    private $started = false;

    /**
     * Check if wrapper already closed
     *
     * @var bool
     */
    private $ended = false;    

    /**
     * Start wrapper only once
     *
     * @return void
     */
    public function start_wrapper() {
        if ($this->started) {
            return;
        }

        echo '<div id="smooth-wrapper"><div id="smooth-content">';
        $this->started = true;
    }

    /**
     * End wrapper only once
     *
     * @return void
     */
    public function end_wrapper() {
        if ($this->ended) {
            return;
        }

        echo '</div></div>';
        $this->ended = true;
    }
}


