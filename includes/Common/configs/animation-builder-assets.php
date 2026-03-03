<?php

/**
 * Animation Builder Device Configurations
 */

defined('ABSPATH') || die();


return [
  'presets' => [
    'wcf-scroll-video-animation' => [
      'src' => MOTIONKIT_PLUGIN_URL . '/assets/build/modules/animation-builder/frontend/presets/scrollVideoFrame.js',
      'deps' => ['gsap', 'ScrollTrigger'],
      'version' => MOTIONKIT_VERSION,
    ],
    'wcf-horizontal-scroll-animation' => [
      'src' => MOTIONKIT_PLUGIN_URL . '/assets/build/modules/animation-builder/frontend/presets/horizontalScrollAnim.js',
      'deps' => ['gsap', 'ScrollTrigger'],
      'version' => MOTIONKIT_VERSION,
    ],
    'wcf-cube-scroll-reveal-animation' => [
      'src' => MOTIONKIT_PLUGIN_URL . '/assets/build/modules/animation-builder/frontend/presets/cubeScrollRevealAnim.js',
      'deps' => ['gsap', 'ScrollTrigger'],
      'version' => MOTIONKIT_VERSION,
    ],
    'wcf-image-reveal-animation' => [
      'src' =>  MOTIONKIT_PLUGIN_URL . '/assets/build/modules/animation-builder/frontend/presets/imageRevealAnim.js',
      'deps' => ['gsap', 'ScrollTrigger'],
      'version' => MOTIONKIT_VERSION,
    ],
    'wcf-image-hover-reveal-animation' => [
      'src' =>  MOTIONKIT_PLUGIN_URL . '/assets/build/modules/animation-builder/frontend/presets/imageHoverRevealAnim.js',
      'deps' => ['gsap', 'ScrollTrigger'],
      'version' => MOTIONKIT_VERSION,
    ],
    'wcf-cursor-hover-reveal-animation' => [
      'src' =>  MOTIONKIT_PLUGIN_URL . '/assets/build/modules/animation-builder/frontend/presets/cursorHoverRevealAnim.js',
      'deps' => ['gsap', 'ScrollTrigger'],
      'version' => MOTIONKIT_VERSION,
    ],
    'wcf-cursor-hover-move-animation' => [
      'src' =>  MOTIONKIT_PLUGIN_URL . '/assets/build/modules/animation-builder/frontend/presets/cursorHoverMoveAnim.js',
      'deps' => ['gsap', 'ScrollTrigger'],
      'version' => MOTIONKIT_VERSION,
    ],
    'wcf-image-stretch-animation' => [
      'src' =>  MOTIONKIT_PLUGIN_URL . '/assets/build/modules/animation-builder/frontend/presets/imageStretchAnim.js',
      'deps' => ['gsap', 'ScrollTrigger'],
      'version' => MOTIONKIT_VERSION,
    ],
    'wcf-image-scale-animation' => [
      'src' => MOTIONKIT_PLUGIN_URL . '/assets/build/modules/animation-builder/frontend/presets/imageScaleAnim.js',
      'deps' => ['gsap', 'ScrollTrigger'],
      'version' => MOTIONKIT_VERSION,
    ],
    'wcf-text-split-animation' => [
      'src' => MOTIONKIT_PLUGIN_URL . '/assets/build/modules/animation-builder/frontend/presets/textSplitAnim.js',
      'deps' => ['gsap', 'ScrollTrigger'],
      'version' => MOTIONKIT_VERSION,
    ],
    'wcf-text-rotate-animation' => [
      'src' => MOTIONKIT_PLUGIN_URL . '/assets/build/modules/animation-builder/frontend/presets/textRotateAnim.js',
      'deps' => ['gsap', 'ScrollTrigger'],
      'version' => MOTIONKIT_VERSION,
    ],
    'wcf-text-scale-animation' => [
      'src' => MOTIONKIT_PLUGIN_URL . '/assets/build/modules/animation-builder/frontend/presets/textScaleAnim.js',
      'deps' => ['gsap', 'ScrollTrigger'],
      'version' => MOTIONKIT_VERSION,
    ],
    'wcf-text-invert-animation' => [
      'src' => MOTIONKIT_PLUGIN_URL . '/assets/build/modules/animation-builder/frontend/presets/textInvertAnim.js',
      'deps' => ['gsap', 'ScrollTrigger'],
      'version' => MOTIONKIT_VERSION,
    ],
    'wcf-text-spin-animation' => [
      'src' => MOTIONKIT_PLUGIN_URL . '/assets/build/modules/animation-builder/frontend/presets/textSpinAnim.js',
      'deps' => ['gsap', 'ScrollTrigger'],
      'version' => MOTIONKIT_VERSION,
    ],
    'wcf-popup-media-animation' => [
      'src' => MOTIONKIT_PLUGIN_URL . '/assets/build/modules/animation-builder/frontend/presets/popupMediaAnim.js',
      'deps' => ['gsap', 'ScrollTrigger'],
      'version' => MOTIONKIT_VERSION,
    ],
    'wcf-container-fade-animation' => [
      'src' => MOTIONKIT_PLUGIN_URL . '/assets/build/modules/animation-builder/frontend/presets/containerFadeAnim.js',
      'deps' => ['gsap', 'ScrollTrigger'],
      'version' => MOTIONKIT_VERSION,
    ],
    'wcf-header-sticky-animation' => [
      'src' => MOTIONKIT_PLUGIN_URL . '/assets/build/modules/animation-builder/frontend/presets/headerStickyAnim.js',
      'deps' => ['gsap', 'ScrollTrigger'],
      'version' => MOTIONKIT_VERSION,
    ],
  ],
  // ############## FREE ANIMATIONS ##############
  "freePresets" => [
    // ############## GENERAL ############## //
    'wcf-ab-gen-sil-fa' => [
      'src' => MOTIONKIT_PLUGIN_URL . '/assets/build/modules/animation-builder/frontend/freePresets/generalSpaceInLeftAnim.js',
      'deps' => [],
      'version' => MOTIONKIT_VERSION,
    ],
    'wcf-general-sir-free-animation' => [
      'src' => MOTIONKIT_PLUGIN_URL . '/assets/build/modules/animation-builder/frontend/freePresets/generalSpeceInRightAnim.js',
      'deps' => [],
      'version' => MOTIONKIT_VERSION,
    ],
    'wcf-general-swap-free-animation' => [
      'src' => MOTIONKIT_PLUGIN_URL . '/assets/build/modules/animation-builder/frontend/freePresets/generalSwapAnim.js',
      'deps' => [],
      'version' => MOTIONKIT_VERSION,
    ],
    'wcf-general-tid-free-animation' => [
      'src' => MOTIONKIT_PLUGIN_URL . '/assets/build/modules/animation-builder/frontend/freePresets/generalTwisterInDownAnim.js',
      'deps' => [],
      'version' => MOTIONKIT_VERSION,
    ],

    // ############## IMAGE ############## //
    'wcf-image-swash-in-free-animation' => [
      'src' => MOTIONKIT_PLUGIN_URL . '/assets/build/modules/animation-builder/frontend/freePresets/imageSwashInAnim.js',
      'deps' => [],
      'version' => MOTIONKIT_VERSION,
    ],
    'wcf-image-vanish-in-free-animation' => [
      'src' => MOTIONKIT_PLUGIN_URL . '/assets/build/modules/animation-builder/frontend/freePresets/imageVanishInAnim.js',
      'deps' => [],
      'version' => MOTIONKIT_VERSION,
    ],

    // ############## TEXT ############## //
    'wcf-text-clip-reveal-free-animation' => [
      'src' => MOTIONKIT_PLUGIN_URL . '/assets/build/modules/animation-builder/frontend/freePresets/textClipRevealAnim.js',
      'deps' => [],
      'version' => MOTIONKIT_VERSION,
    ],
    'wcf-text-clip-slide-up-free-animation' => [
      'src' => MOTIONKIT_PLUGIN_URL . '/assets/build/modules/animation-builder/frontend/freePresets/textClipSlideUpAnim.js',
      'deps' => [],
      'version' => MOTIONKIT_VERSION,
    ],
    'wcf-text-clip-slide-right-free-animation' => [
      'src' => MOTIONKIT_PLUGIN_URL . '/assets/build/modules/animation-builder/frontend/freePresets/textClipSlideRightAnim.js',
      'deps' => [],
      'version' => MOTIONKIT_VERSION,
    ],
  ]

];
