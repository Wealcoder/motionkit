<?php

/**
 * Animation Builder Device Configurations
 */

defined('ABSPATH') || die();


return [
  'premiumPresets' => [
    // ############## CONTAINER ############## //
    'wcf-mk-container-fade-pa' => [
      'src' => MOTIONKIT_PLUGIN_URL . '/assets/build/modules/animation-builder/frontend/presets/containerFadeAnim.js',
      'deps' => ['gsap', 'ScrollTrigger'],
      'version' => MOTIONKIT_VERSION,
    ],

    // ############## CURSOR ############## //
    'wcf-mk-cursor-cm-pa' => [
      'src' =>  MOTIONKIT_PLUGIN_URL . '/assets/build/modules/animation-builder/frontend/presets/cursorHoverMoveAnim.js',
      'deps' => ['gsap', 'ScrollTrigger'],
      'version' => MOTIONKIT_VERSION,
    ],
    'wcf-mk-cursor-cr-pa' => [
      'src' =>  MOTIONKIT_PLUGIN_URL . '/assets/build/modules/animation-builder/frontend/presets/cursorHoverRevealAnim.js',
      'deps' => ['gsap', 'ScrollTrigger'],
      'version' => MOTIONKIT_VERSION,
    ],

    // ############## IMAGE ############## //
    'wcf-mk-image-hr-pa' => [
      'src' =>  MOTIONKIT_PLUGIN_URL . '/assets/build/modules/animation-builder/frontend/presets/imageHoverRevealAnim.js',
      'deps' => ['gsap', 'ScrollTrigger'],
      'version' => MOTIONKIT_VERSION,
    ],
    'wcf-mk-image-rev-pa' => [
      'src' =>  MOTIONKIT_PLUGIN_URL . '/assets/build/modules/animation-builder/frontend/presets/imageRevealAnim.js',
      'deps' => ['gsap', 'ScrollTrigger'],
      'version' => MOTIONKIT_VERSION,
    ],
    'wcf-mk-image-scale-pa' => [
      'src' => MOTIONKIT_PLUGIN_URL . '/assets/build/modules/animation-builder/frontend/presets/imageScaleAnim.js',
      'deps' => ['gsap', 'ScrollTrigger'],
      'version' => MOTIONKIT_VERSION,
    ],
    'wcf-mk-image-stretch-pa' => [
      'src' =>  MOTIONKIT_PLUGIN_URL . '/assets/build/modules/animation-builder/frontend/presets/imageStretchAnim.js',
      'deps' => ['gsap', 'ScrollTrigger'],
      'version' => MOTIONKIT_VERSION,
    ],

    // ############## POPUP ############## //
    'wcf-mk-popup-media-pa' => [
      'src' => MOTIONKIT_PLUGIN_URL . '/assets/build/modules/animation-builder/frontend/presets/popupMediaAnim.js',
      'deps' => ['gsap', 'ScrollTrigger'],
      'version' => MOTIONKIT_VERSION,
    ],

    // ############## SCROLL ############## //
    'wcf-mk-scroll-cr-pa' => [
      'src' => MOTIONKIT_PLUGIN_URL . '/assets/build/modules/animation-builder/frontend/presets/cubeScrollRevealAnim.js',
      'deps' => ['gsap', 'ScrollTrigger'],
      'version' => MOTIONKIT_VERSION,
    ],
    'wcf-mk-scroll-hor-pa' => [
      'src' => MOTIONKIT_PLUGIN_URL . '/assets/build/modules/animation-builder/frontend/presets/horizontalScrollAnim.js',
      'deps' => ['gsap', 'ScrollTrigger'],
      'version' => MOTIONKIT_VERSION,
    ],
    'wcf-mk-scroll-vf-pa' => [
      'src' => MOTIONKIT_PLUGIN_URL . '/assets/build/modules/animation-builder/frontend/presets/scrollVideoFrame.js',
      'deps' => ['gsap', 'ScrollTrigger'],
      'version' => MOTIONKIT_VERSION,
    ],

    // ############## STICKY ############## //
    'wcf-mk-sticky-hs-pa' => [
      'src' => MOTIONKIT_PLUGIN_URL . '/assets/build/modules/animation-builder/frontend/presets/headerStickyAnim.js',
      'deps' => ['gsap', 'ScrollTrigger'],
      'version' => MOTIONKIT_VERSION,
    ],

    // ############## TEXT ############## //
    'wcf-mk-text-invert-pa' => [
      'src' => MOTIONKIT_PLUGIN_URL . '/assets/build/modules/animation-builder/frontend/presets/textInvertAnim.js',
      'deps' => ['gsap', 'ScrollTrigger','SplitText'],
      'version' => MOTIONKIT_VERSION,
    ],
    'wcf-mk-text-rotate-pa' => [
      'src' => MOTIONKIT_PLUGIN_URL . '/assets/build/modules/animation-builder/frontend/presets/textRotateAnim.js',
      'deps' => ['gsap', 'ScrollTrigger', 'SplitText'],
      'version' => MOTIONKIT_VERSION,
    ],
    'wcf-mk-text-scale-pa' => [
      'src' => MOTIONKIT_PLUGIN_URL . '/assets/build/modules/animation-builder/frontend/presets/textScaleAnim.js',
      'deps' => ['gsap', 'ScrollTrigger','SplitText'],
      'version' => MOTIONKIT_VERSION,
    ],
    'wcf-mk-text-spin-pa' => [
      'src' => MOTIONKIT_PLUGIN_URL . '/assets/build/modules/animation-builder/frontend/presets/textSpinAnim.js',
      'deps' => ['gsap', 'ScrollTrigger','SplitText'],
      'version' => MOTIONKIT_VERSION,
    ],
    'wcf-mk-text-split-pa' => [
      'src' => MOTIONKIT_PLUGIN_URL . '/assets/build/modules/animation-builder/frontend/presets/textSplitAnim.js',
      'deps' => ['gsap', 'ScrollTrigger','SplitText'],
      'version' => MOTIONKIT_VERSION,
    ],
  ],
  // ############## FREE ANIMATIONS ##############
  "freePresets" => [
    // ############## GENERAL ############## //
    'wcf-mk-gen-sil-fa' => [
      'src' => MOTIONKIT_PLUGIN_URL . '/assets/build/modules/animation-builder/frontend/freePresets/generalSpaceInLeftAnim.js',
      'deps' => [],
      'version' => MOTIONKIT_VERSION,
    ],
    'wcf-mk-gen-sir-fa' => [
      'src' => MOTIONKIT_PLUGIN_URL . '/assets/build/modules/animation-builder/frontend/freePresets/generalSpaceInRightAnim.js',
      'deps' => [],
      'version' => MOTIONKIT_VERSION,
    ],
    'wcf-mk-gen-swap-fa' => [
      'src' => MOTIONKIT_PLUGIN_URL . '/assets/build/modules/animation-builder/frontend/freePresets/generalSwapAnim.js',
      'deps' => [],
      'version' => MOTIONKIT_VERSION,
    ],
    'wcf-mk-gen-tin-fa' => [
      'src' => MOTIONKIT_PLUGIN_URL . '/assets/build/modules/animation-builder/frontend/freePresets/generalTwisterInDownAnim.js',
      'deps' => [],
      'version' => MOTIONKIT_VERSION,
    ],

    // ############## IMAGE ############## //
    'wcf-mk-img-si-fa' => [
      'src' => MOTIONKIT_PLUGIN_URL . '/assets/build/modules/animation-builder/frontend/freePresets/imageSwashInAnim.js',
      'deps' => [],
      'version' => MOTIONKIT_VERSION,
    ],
    'wcf-mk-img-vi-fa' => [
      'src' => MOTIONKIT_PLUGIN_URL . '/assets/build/modules/animation-builder/frontend/freePresets/imageVanishInAnim.js',
      'deps' => [],
      'version' => MOTIONKIT_VERSION,
    ],

    // ############## TEXT ############## //
    'wcf-mk-txt-cr-fa' => [
      'src' => MOTIONKIT_PLUGIN_URL . '/assets/build/modules/animation-builder/frontend/freePresets/textClipRevealAnim.js',
      'deps' => [],
      'version' => MOTIONKIT_VERSION,
    ],
    'wcf-mk-txt-csu-fa' => [
      'src' => MOTIONKIT_PLUGIN_URL . '/assets/build/modules/animation-builder/frontend/freePresets/textClipSlideUpAnim.js',
      'deps' => [],
      'version' => MOTIONKIT_VERSION,
    ],
    'wcf-mk-txt-csr-fa' => [
      'src' => MOTIONKIT_PLUGIN_URL . '/assets/build/modules/animation-builder/frontend/freePresets/textClipSlideRightAnim.js',
      'deps' => [],
      'version' => MOTIONKIT_VERSION,
    ],
  ]

];
