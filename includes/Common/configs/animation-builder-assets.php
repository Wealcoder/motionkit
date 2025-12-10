<?php

/**
 * Animation Builder Device Configurations
 */

defined('ABSPATH') || die();


return [
  'presets' => [
    'wcf-scroll-video-animation' => [
      'src' => WCF_ANIMATION_BUILDER_PLUGIN_URL . '/assets/build/modules/animation-builder/frontend/presets/scrollVideoFrame.js',
      'editorSrc' => WCF_ANIMATION_BUILDER_PLUGIN_URL . 'assets/build/modules/animation-builder/register/preset/rScrollVideoFrame.js',
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
    'wcf-horizontal-scroll-animation' => [
      'src' => WCF_ANIMATION_BUILDER_PLUGIN_URL . '/assets/build/modules/animation-builder/frontend/presets/horizontalScrollAnim.js',
      'editorSrc' => WCF_ANIMATION_BUILDER_PLUGIN_URL . 'assets/build/modules/animation-builder/register/preset/rHorizontalScrollAnim.js',
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
    'wcf-cube-scroll-reveal-animation' => [
      'src' => WCF_ANIMATION_BUILDER_PLUGIN_URL . '/assets/build/modules/animation-builder/frontend/presets/cubeScrollRevealAnim.js',
      'editorSrc' => WCF_ANIMATION_BUILDER_PLUGIN_URL . 'assets/build/modules/animation-builder/register/preset/rCubeScrollRevealAnim.js',
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
    'wcf-image-reveal-animation' => [
      'src' =>  WCF_ANIMATION_BUILDER_PLUGIN_URL . '/assets/build/modules/animation-builder/frontend/presets/imageRevealAnim.js',
      'editorSrc' => WCF_ANIMATION_BUILDER_PLUGIN_URL . 'assets/build/modules/animation-builder/register/preset/rImageRevealAnim.js',
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
    'wcf-image-hover-reveal-animation' => [
      'src' =>  WCF_ANIMATION_BUILDER_PLUGIN_URL . '/assets/build/modules/animation-builder/frontend/presets/imageHoverRevealAnim.js',
      'editorSrc' => WCF_ANIMATION_BUILDER_PLUGIN_URL . 'assets/build/modules/animation-builder/register/preset/rImageHoverRevealAnim.js',
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
    'wcf-cursor-hover-reveal-animation' => [
      'src' =>  WCF_ANIMATION_BUILDER_PLUGIN_URL . '/assets/build/modules/animation-builder/frontend/presets/cursorHoverRevealAnim.js',
      'editorSrc' => WCF_ANIMATION_BUILDER_PLUGIN_URL . 'assets/build/modules/animation-builder/register/preset/rCursorHoverRevealAnim.js',
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
    'wcf-cursor-hover-move-animation' => [
      'src' =>  WCF_ANIMATION_BUILDER_PLUGIN_URL . '/assets/build/modules/animation-builder/frontend/presets/cursorHoverMoveAnim.js',
      'editorSrc' => WCF_ANIMATION_BUILDER_PLUGIN_URL . 'assets/build/modules/animation-builder/register/preset/rCursorHoverMoveAnim.js',
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
    'wcf-image-stretch-animation' => [
      'src' =>  WCF_ANIMATION_BUILDER_PLUGIN_URL . '/assets/build/modules/animation-builder/frontend/presets/imageStretchAnim.js',
      'editorSrc' => WCF_ANIMATION_BUILDER_PLUGIN_URL . 'assets/build/modules/animation-builder/register/preset/rImageStretchAnim.js',
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
    'wcf-image-scale-animation' => [
      'src' => WCF_ANIMATION_BUILDER_PLUGIN_URL . '/assets/build/modules/animation-builder/frontend/presets/imageScaleAnim.js',
      'editorSrc' => WCF_ANIMATION_BUILDER_PLUGIN_URL . 'assets/build/modules/animation-builder/register/preset/rImageScaleAnim.js',
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
    'wcf-text-split-animation' => [
      'src' => WCF_ANIMATION_BUILDER_PLUGIN_URL . '/assets/build/modules/animation-builder/frontend/presets/textSplitAnim.js',
      'editorSrc' => WCF_ANIMATION_BUILDER_PLUGIN_URL . 'assets/build/modules/animation-builder/register/preset/rTextSplitAnim.js',
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
    'wcf-text-rotate-animation' => [
      'src' => WCF_ANIMATION_BUILDER_PLUGIN_URL . '/assets/build/modules/animation-builder/frontend/presets/textRotateAnim.js',
      'editorSrc' => WCF_ANIMATION_BUILDER_PLUGIN_URL . 'assets/build/modules/animation-builder/register/preset/rTextRotateAnim.js',
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
    'wcf-text-scale-animation' => [
      'src' => WCF_ANIMATION_BUILDER_PLUGIN_URL . '/assets/build/modules/animation-builder/frontend/presets/textScaleAnim.js',
      'editorSrc' => WCF_ANIMATION_BUILDER_PLUGIN_URL . 'assets/build/modules/animation-builder/register/preset/rTextScaleAnim.js',
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
    'wcf-text-invert-animation' => [
      'src' => WCF_ANIMATION_BUILDER_PLUGIN_URL . '/assets/build/modules/animation-builder/frontend/presets/textInvertAnim.js',
      'editorSrc' => WCF_ANIMATION_BUILDER_PLUGIN_URL . 'assets/build/modules/animation-builder/register/preset/rTextInvertAnim.js',
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
    'wcf-text-spin-animation' => [
      'src' => WCF_ANIMATION_BUILDER_PLUGIN_URL . '/assets/build/modules/animation-builder/frontend/presets/textSpinAnim.js',
      'editorSrc' => WCF_ANIMATION_BUILDER_PLUGIN_URL . 'assets/build/modules/animation-builder/register/preset/rTextSpinAnim.js',
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
    'wcf-popup-media-animation' => [
      'src' => WCF_ANIMATION_BUILDER_PLUGIN_URL . '/assets/build/modules/animation-builder/frontend/presets/popupMediaAnim.js',
      'editorSrc' => WCF_ANIMATION_BUILDER_PLUGIN_URL . 'assets/build/modules/animation-builder/register/preset/rPopupMediaAnim.js',
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
    'wcf-container-fade-animation' => [
      'src' => WCF_ANIMATION_BUILDER_PLUGIN_URL . '/assets/build/modules/animation-builder/frontend/presets/containerFadeAnim.js',
      'editorSrc' => WCF_ANIMATION_BUILDER_PLUGIN_URL . 'assets/build/modules/animation-builder/register/preset/rContainerFadeAnim.js',
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
    'wcf-header-sticky-animation' => [
      'src' => WCF_ANIMATION_BUILDER_PLUGIN_URL . '/assets/build/modules/animation-builder/frontend/presets/headerStickyAnim.js',
      'editorSrc' => WCF_ANIMATION_BUILDER_PLUGIN_URL . 'assets/build/modules/animation-builder/register/preset/rHeaderStickyAnim.js',
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
  ],
  // free animation presets
  "freePresets" => [
    'wcf-general-swash-in-free-animation' => [
      'src' => WCF_ANIMATION_BUILDER_PLUGIN_URL . '/assets/build/modules/animation-builder/frontend/freePresets/generalSwashInAnim.js',
      'editorSrc' => WCF_ANIMATION_BUILDER_PLUGIN_URL . 'assets/build/modules/animation-builder/register/freePresets/rGeneralSwashInAnim.js',
      'deps' => [],
      'editorDeps' => [
        'react',
        'react-dom',
        'wp-dom-ready',
        'wp-element',
        'wp-hooks'
      ],
      'version' => WCF_ANIMATION_BUILDER_VERSION,
    ],
    'wcf-general-vanish-in-free-animation' => [
      'src' => WCF_ANIMATION_BUILDER_PLUGIN_URL . '/assets/build/modules/animation-builder/frontend/freePresets/generalVanishInAnim.js',
      'editorSrc' => WCF_ANIMATION_BUILDER_PLUGIN_URL . 'assets/build/modules/animation-builder/register/freePresets/rGeneralVanishInAnim.js',
      'deps' => [],
      'editorDeps' => [
        'react',
        'react-dom',
        'wp-dom-ready',
        'wp-element',
        'wp-hooks'
      ],
      'version' => WCF_ANIMATION_BUILDER_VERSION,
    ],
    'wcf-general-sil-free-animation' => [
      'src' => WCF_ANIMATION_BUILDER_PLUGIN_URL . '/assets/build/modules/animation-builder/frontend/freePresets/generalSpaceInLeftAnim.js',
      'editorSrc' => WCF_ANIMATION_BUILDER_PLUGIN_URL . 'assets/build/modules/animation-builder/register/freePresets/rGeneralSpeceInLeftAnim.js',
      'deps' => [],
      'editorDeps' => [
        'react',
        'react-dom',
        'wp-dom-ready',
        'wp-element',
        'wp-hooks'
      ],
      'version' => WCF_ANIMATION_BUILDER_VERSION,
    ],
    'wcf-general-sir-free-animation' => [
      'src' => WCF_ANIMATION_BUILDER_PLUGIN_URL . '/assets/build/modules/animation-builder/frontend/freePresets/generalSpeceInRightAnim.js',
      'editorSrc' => WCF_ANIMATION_BUILDER_PLUGIN_URL . 'assets/build/modules/animation-builder/register/freePresets/rGeneralSpeceInRightAnim.js',
      'deps' => [],
      'editorDeps' => [
        'react',
        'react-dom',
        'wp-dom-ready',
        'wp-element',
        'wp-hooks'
      ],
      'version' => WCF_ANIMATION_BUILDER_VERSION,
    ],
    'wcf-general-swap-free-animation' => [
      'src' => WCF_ANIMATION_BUILDER_PLUGIN_URL . '/assets/build/modules/animation-builder/frontend/freePresets/generalSwapAnim.js',
      'editorSrc' => WCF_ANIMATION_BUILDER_PLUGIN_URL . 'assets/build/modules/animation-builder/register/freePresets/rGeneralSwapAnim.js',
      'deps' => [],
      'editorDeps' => [
        'react',
        'react-dom',
        'wp-dom-ready',
        'wp-element',
        'wp-hooks'
      ],
      'version' => WCF_ANIMATION_BUILDER_VERSION,
    ],
    'wcf-general-tid-free-animation' => [
      'src' => WCF_ANIMATION_BUILDER_PLUGIN_URL . '/assets/build/modules/animation-builder/frontend/freePresets/generalTwisterInDownAnim.js',
      'editorSrc' => WCF_ANIMATION_BUILDER_PLUGIN_URL . 'assets/build/modules/animation-builder/register/freePresets/rGeneralTwisterInDownAnim.js',
      'deps' => [],
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
