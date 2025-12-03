<?php

/**
 * Animation Builder Device Configurations
 */

defined('ABSPATH') || die();


return [
    'js' => [
        // free animation presets
         'wcf-container-swash-in-free-animation' => [
            'src' => WCF_ANIMATION_BUILDER_PLUGIN_URL . '/assets/build/modules/animation-builder/frontend/freePresets/containerSwashInAnim.js',
            'editorSrc' => WCF_ANIMATION_BUILDER_PLUGIN_URL . 'assets/build/modules/animation-builder/register/freePresets/rContainerSwashInAnim.js',
            'deps' => ['gsap', 'ScrollTrigger'],
            'editorDeps' => [
                'react',
                'react-dom',
                'wp-dom-ready',
                'wp-element',
                'wp-hooks'
            ],
            'version' => WCF_ANIMATION_BUILDER_VERSION,
        ],
    ]

];
