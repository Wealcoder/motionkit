// GENERATED FILE — do not edit here.
// Source of truth: motionkit-editor/src/lib/motionkit-engine/waapiEngine/
// Re-sync with `npm run copy:wporg` in the editor repo.

'use strict';

/**
 * MotionKit Free WAAPI Animation Engine — standalone entry.
 *
 * Built by the MotionKit wp.org plugin's own webpack, from its own copy of this
 * source, into assets/build/motionkit-waapi.js. Kept separate from entry.js
 * because that one registers with the editor's animation router, and the plugin
 * has no router: it localizes its saved animations onto window.motionkitWaapiData
 * and expects the bundle to play them by itself.
 *
 * Zero dependencies and zero remote requests — the whole point of the free tier.
 */

import { runWaapiAnimation, teardownWaapi } from './runner.js';
import { isWaapiAnimation } from './isWaapiAnimation.js';

const INSTALLED_KEY = '__motionkitWaapiInstalled';

// Every payload shape the plugin has localized under this name, oldest last. wp_localize_script always hands over an object, but the animation list has moved keys across versions and a site can serve a cached page from an older one.
function readAnimations(rawData) {
  if (!rawData) return [];
  if (Array.isArray(rawData)) return rawData;
  if (typeof rawData !== 'object') return [];

  if (Array.isArray(rawData.animations)) return rawData.animations;
  if (Array.isArray(rawData.all_animations)) return rawData.all_animations;
  if (Array.isArray(rawData.pageConfigs)) return rawData.pageConfigs;

  return Object.values(rawData).flat().filter(Boolean);
}

export const MotionKitWaapi = {
  version: '1.0.0',
  run: runWaapiAnimation,
  teardown: teardownWaapi,

  /**
   * Plays every free animation the page carries.
   *
   * @param {Document|HTMLElement} [contextDoc=document]
   * @returns {number} how many animations were started
   */
  init: function (contextDoc = document) {
    if (typeof window === 'undefined') return 0;

    const animations = readAnimations(
      window.motionkitWaapiData ||
        window.motionkitData ||
        window.motionkitAnimations ||
        window.motionkit_animation_data,
    );

    let started = 0;
    animations.forEach((anim) => {
      if (!isWaapiAnimation(anim)) return;
      runWaapiAnimation(anim, contextDoc);
      started += 1;
    });
    return started;
  },
};

if (typeof window !== 'undefined') {
  window.MotionKitWaapi = MotionKitWaapi;

  /* Deleting an animation in the editor has to stop it playing on the page. The editor fires this before every push; the router bundle answers it wherever the editor's own engine is loaded, but a WordPress page carries THIS bundle alone and answered nothing — so a deleted hover animation kept its listeners and went on running until the next reload.

     Teardown is idempotent, so a host that also runs the router's fan-out simply tears down twice. */
  document.addEventListener('aae-reset-animation', function () {
    try {
      teardownWaapi();
    } catch (err) {
      console.warn('[motionkit:waapi] teardown error:', err);
    }
  });

  // Guarded so a page that somehow loads the bundle twice does not run every animation twice over.
  if (!window[INSTALLED_KEY]) {
    window[INSTALLED_KEY] = true;

    if (document.readyState === 'loading') {
      document.addEventListener(
        'DOMContentLoaded',
        function () {
          MotionKitWaapi.init();
        },
        { once: true },
      );
    } else {
      MotionKitWaapi.init();
    }
  }
}

export default MotionKitWaapi;
