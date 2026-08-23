<?php

/**
 * Animation Builder Device Configurations
 */

defined('ABSPATH') || die();


return [
  'premiumPresets' => [
    // ############## CURSOR ############## //
    'motionkit-mk-cursor-cm-pa' => [
      'src' =>  MOTIONKIT_PLUGIN_URL . '/assets/build/modules/animation-builder/frontend/presets/cursorHoverMoveAnim.js',
      'deps' => ['gsap', 'ScrollTrigger'],
      'version' => MOTIONKIT_VERSION,
    ],
    'motionkit-mk-cursor-cr-pa' => [
      'src' =>  MOTIONKIT_PLUGIN_URL . '/assets/build/modules/animation-builder/frontend/presets/cursorHoverRevealAnim.js',
      'deps' => ['gsap', 'ScrollTrigger'],
      'version' => MOTIONKIT_VERSION,
    ],
    'motionkit-mk-cursor-tilt-pa' => [
      'src' =>  MOTIONKIT_PLUGIN_URL . '/assets/build/modules/animation-builder/frontend/presets/cursorHoverTiltAnim.js',
      'deps' => ['gsap', 'ScrollTrigger'],
      'version' => MOTIONKIT_VERSION,
    ],

    // ############## IMAGE ############## //
    'motionkit-mk-image-sr-pa' => [
      'src' =>  MOTIONKIT_PLUGIN_URL . '/assets/build/modules/animation-builder/frontend/presets/imageSpotlightHoverReveal.js',
      'deps' => ['gsap', 'ScrollTrigger'],
      'version' => MOTIONKIT_VERSION,
    ],
    'motionkit-mk-image-mg-pa' => [
      'src' =>  MOTIONKIT_PLUGIN_URL . '/assets/build/modules/animation-builder/frontend/presets/imageHoverMagnifier.js',
      'deps' => ['gsap', 'ScrollTrigger'],
      'version' => MOTIONKIT_VERSION,
    ],
    'motionkit-mk-image-cm-pa' => [
      'src' =>  MOTIONKIT_PLUGIN_URL . '/assets/build/modules/animation-builder/frontend/presets/imageCinematicMaskAnim.js',
      'deps' => ['gsap', 'ScrollTrigger'],
      'version' => MOTIONKIT_VERSION,
    ],
    'motionkit-mk-image-ss-pa' => [
      'src' =>  MOTIONKIT_PLUGIN_URL . '/assets/build/modules/animation-builder/frontend/presets/imageSliceShutterAnim.js',
      'deps' => ['gsap', 'ScrollTrigger'],
      'version' => MOTIONKIT_VERSION,
    ],
    'motionkit-mk-image-md-pa' => [
      'src' =>  MOTIONKIT_PLUGIN_URL . '/assets/build/modules/animation-builder/frontend/presets/imageMosaicDepthAnim.js',
      'deps' => ['gsap', 'ScrollTrigger'],
      'version' => MOTIONKIT_VERSION,
    ],
    'motionkit-mk-image-hr-pa' => [
      'src' =>  MOTIONKIT_PLUGIN_URL . '/assets/build/modules/animation-builder/frontend/presets/imageHoverRevealAnim.js',
      'deps' => ['gsap', 'ScrollTrigger'],
      'version' => MOTIONKIT_VERSION,
    ],

    // ############## POPUP ############## //
    'motionkit-mk-popup-media-pa' => [
      'src' => MOTIONKIT_PLUGIN_URL . '/assets/build/modules/animation-builder/frontend/presets/popupMediaAnim.js',
      'deps' => ['gsap', 'ScrollTrigger'],
      'version' => MOTIONKIT_VERSION,
    ],

    // ############## SCROLL ############## //
    'motionkit-mk-scroll-cr-pa' => [
      'src' => MOTIONKIT_PLUGIN_URL . '/assets/build/modules/animation-builder/frontend/presets/cubeScrollRevealAnim.js',
      'deps' => ['gsap', 'ScrollTrigger'],
      'version' => MOTIONKIT_VERSION,
    ],
    'motionkit-mk-scroll-hor-pa' => [
      'src' => MOTIONKIT_PLUGIN_URL . '/assets/build/modules/animation-builder/frontend/presets/horizontalScrollAnim.js',
      'deps' => ['gsap', 'ScrollTrigger'],
      'version' => MOTIONKIT_VERSION,
    ],
    'motionkit-mk-scroll-vf-pa' => [
      'src' => MOTIONKIT_PLUGIN_URL . '/assets/build/modules/animation-builder/frontend/presets/scrollVideoFrame.js',
      'deps' => ['gsap', 'ScrollTrigger'],
      'version' => MOTIONKIT_VERSION,
    ],
    'motionkit-mk-scroll-parallax-pa' => [
      'src' => MOTIONKIT_PLUGIN_URL . '/assets/build/modules/animation-builder/frontend/presets/scrollParallax.js',
      'deps' => ['gsap', 'ScrollTrigger'],
      'version' => MOTIONKIT_VERSION,
    ],

    // ############## STICKY ############## //
    'motionkit-mk-sticky-hs-pa' => [
      'src' => MOTIONKIT_PLUGIN_URL . '/assets/build/modules/animation-builder/frontend/presets/headerStickyAnim.js',
      'deps' => ['gsap', 'ScrollTrigger'],
      'version' => MOTIONKIT_VERSION,
    ],

    // ############## TEXT ############## //
    'motionkit-mk-text-wave-pa' => [
      'src' => MOTIONKIT_PLUGIN_URL . '/assets/build/modules/animation-builder/frontend/presets/textWaveAnim.js',
      'deps' => ['gsap', 'ScrollTrigger', 'SplitText'],
      'version' => MOTIONKIT_VERSION,
    ],
    'motionkit-mk-text-swipe-pa' => [
      'src' => MOTIONKIT_PLUGIN_URL . '/assets/build/modules/animation-builder/frontend/presets/textSwipeRevealAnim.js',
      'deps' => ['gsap', 'ScrollTrigger', 'SplitText'],
      'version' => MOTIONKIT_VERSION,
    ],
  ],

];
