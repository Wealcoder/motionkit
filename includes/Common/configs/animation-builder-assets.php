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
      'deps' => ['gsap', 'scrollTrigger'],
      'version' => MOTIONKIT_VERSION,
    ],

    // ############## CURSOR ############## //
    'wcf-mk-cursor-cm-pa' => [
      'src' =>  MOTIONKIT_PLUGIN_URL . '/assets/build/modules/animation-builder/frontend/presets/cursorHoverMoveAnim.js',
      'deps' => ['gsap', 'scrollTrigger'],
      'version' => MOTIONKIT_VERSION,
    ],
    'wcf-mk-cursor-cr-pa' => [
      'src' =>  MOTIONKIT_PLUGIN_URL . '/assets/build/modules/animation-builder/frontend/presets/cursorHoverRevealAnim.js',
      'deps' => ['gsap', 'scrollTrigger'],
      'version' => MOTIONKIT_VERSION,
    ],
    'wcf-mk-cursor-tilt-pa' => [
      'src' =>  MOTIONKIT_PLUGIN_URL . '/assets/build/modules/animation-builder/frontend/presets/cursorHoverTiltAnim.js',
      'deps' => ['gsap', 'scrollTrigger'],
      'version' => MOTIONKIT_VERSION,
    ],

    // ############## IMAGE ############## //
    'wcf-mk-image-cm-pa' => [
      'src' =>  MOTIONKIT_PLUGIN_URL . '/assets/build/modules/animation-builder/frontend/presets/imageCinematicMaskAnim.js',
      'deps' => ['gsap', 'scrollTrigger'],
      'version' => MOTIONKIT_VERSION,
    ],
    'wcf-mk-image-ss-pa' => [
      'src' =>  MOTIONKIT_PLUGIN_URL . '/assets/build/modules/animation-builder/frontend/presets/imageSliceShutterAnim.js',
      'deps' => ['gsap', 'scrollTrigger'],
      'version' => MOTIONKIT_VERSION,
    ],
    'wcf-mk-image-md-pa' => [
      'src' =>  MOTIONKIT_PLUGIN_URL . '/assets/build/modules/animation-builder/frontend/presets/imageMosaicDepthAnim.js',
      'deps' => ['gsap', 'scrollTrigger'],
      'version' => MOTIONKIT_VERSION,
    ],
    'wcf-mk-image-hr-pa' => [
      'src' =>  MOTIONKIT_PLUGIN_URL . '/assets/build/modules/animation-builder/frontend/presets/imageHoverRevealAnim.js',
      'deps' => ['gsap', 'scrollTrigger'],
      'version' => MOTIONKIT_VERSION,
    ],
    'wcf-mk-image-rev-pa' => [
      'src' =>  MOTIONKIT_PLUGIN_URL . '/assets/build/modules/animation-builder/frontend/presets/imageRevealAnim.js',
      'deps' => ['gsap', 'scrollTrigger'],
      'version' => MOTIONKIT_VERSION,
    ],
    'wcf-mk-image-scale-pa' => [
      'src' => MOTIONKIT_PLUGIN_URL . '/assets/build/modules/animation-builder/frontend/presets/imageScaleAnim.js',
      'deps' => ['gsap', 'scrollTrigger'],
      'version' => MOTIONKIT_VERSION,
    ],
    'wcf-mk-image-stretch-pa' => [
      'src' =>  MOTIONKIT_PLUGIN_URL . '/assets/build/modules/animation-builder/frontend/presets/imageStretchAnim.js',
      'deps' => ['gsap', 'scrollTrigger'],
      'version' => MOTIONKIT_VERSION,
    ],

    // ############## POPUP ############## //
    'wcf-mk-popup-media-pa' => [
      'src' => MOTIONKIT_PLUGIN_URL . '/assets/build/modules/animation-builder/frontend/presets/popupMediaAnim.js',
      'deps' => ['gsap', 'scrollTrigger'],
      'version' => MOTIONKIT_VERSION,
    ],

    // ############## SCROLL ############## //
    'wcf-mk-scroll-cr-pa' => [
      'src' => MOTIONKIT_PLUGIN_URL . '/assets/build/modules/animation-builder/frontend/presets/cubeScrollRevealAnim.js',
      'deps' => ['gsap', 'scrollTrigger'],
      'version' => MOTIONKIT_VERSION,
    ],
    'wcf-mk-scroll-hor-pa' => [
      'src' => MOTIONKIT_PLUGIN_URL . '/assets/build/modules/animation-builder/frontend/presets/horizontalScrollAnim.js',
      'deps' => ['gsap', 'scrollTrigger'],
      'version' => MOTIONKIT_VERSION,
    ],
    'wcf-mk-scroll-vf-pa' => [
      'src' => MOTIONKIT_PLUGIN_URL . '/assets/build/modules/animation-builder/frontend/presets/scrollVideoFrame.js',
      'deps' => ['gsap', 'scrollTrigger'],
      'version' => MOTIONKIT_VERSION,
    ],
    'wcf-mk-scroll-parallax-pa' => [
      'src' => MOTIONKIT_PLUGIN_URL . '/assets/build/modules/animation-builder/frontend/presets/scrollParallax.js',
      'deps' => ['gsap', 'scrollTrigger'],
      'version' => MOTIONKIT_VERSION,
    ],

    // ############## STICKY ############## //
    'wcf-mk-sticky-hs-pa' => [
      'src' => MOTIONKIT_PLUGIN_URL . '/assets/build/modules/animation-builder/frontend/presets/headerStickyAnim.js',
      'deps' => ['gsap', 'scrollTrigger'],
      'version' => MOTIONKIT_VERSION,
    ],

    // ############## TEXT ############## //
    'wcf-mk-text-invert-pa' => [
      'src' => MOTIONKIT_PLUGIN_URL . '/assets/build/modules/animation-builder/frontend/presets/textInvertAnim.js',
      'deps' => ['gsap', 'scrollTrigger','splitText'],
      'version' => MOTIONKIT_VERSION,
    ],
    'wcf-mk-text-origami-pa' => [
      'src' => MOTIONKIT_PLUGIN_URL . '/assets/build/modules/animation-builder/frontend/presets/textOrigamiAnim.js',
      'deps' => ['gsap', 'scrollTrigger','splitText'],
      'version' => MOTIONKIT_VERSION,
    ],
    'wcf-mk-text-wave-pa' => [
      'src' => MOTIONKIT_PLUGIN_URL . '/assets/build/modules/animation-builder/frontend/presets/textWaveAnim.js',
      'deps' => ['gsap', 'scrollTrigger','splitText'],
      'version' => MOTIONKIT_VERSION,
    ],
    'wcf-mk-text-rotate-pa' => [
      'src' => MOTIONKIT_PLUGIN_URL . '/assets/build/modules/animation-builder/frontend/presets/textRotateAnim.js',
      'deps' => ['gsap', 'scrollTrigger', 'splitText'],
      'version' => MOTIONKIT_VERSION,
    ],
    'wcf-mk-text-scale-pa' => [
      'src' => MOTIONKIT_PLUGIN_URL . '/assets/build/modules/animation-builder/frontend/presets/textScaleAnim.js',
      'deps' => ['gsap', 'scrollTrigger','splitText'],
      'version' => MOTIONKIT_VERSION,
    ],
    'wcf-mk-text-spin-pa' => [
      'src' => MOTIONKIT_PLUGIN_URL . '/assets/build/modules/animation-builder/frontend/presets/textSpinAnim.js',
      'deps' => ['gsap', 'scrollTrigger','splitText'],
      'version' => MOTIONKIT_VERSION,
    ],
    'wcf-mk-text-split-pa' => [
      'src' => MOTIONKIT_PLUGIN_URL . '/assets/build/modules/animation-builder/frontend/presets/textSplitAnim.js',
      'deps' => ['gsap', 'scrollTrigger','splitText'],
      'version' => MOTIONKIT_VERSION,
    ],
  ],

];
