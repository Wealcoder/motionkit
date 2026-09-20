'use strict';

/**
 * MotionKit Free WAAPI Animation Engine — WordPress wrapper.
 *
 * Built by this plugin's own webpack into assets/build/motionkit-waapi.js, enqueued by
 * Plugin.php::enqueue_waapi_runtime() whenever the current page has at least one WAAPI/free
 * animation. Reads the animations WordPress localized onto the page and plays them —
 * everything about WHERE the data came from lives here, not in engine/.
 *
 * Kept separate from the engine-only build (engine/index.js, entry point
 * "motionkit-waapi-engine") because that one is copied into motionkit-editor's preview
 * iframe, where animations arrive via the editor's own router instead — a self-booting
 * script there would find no real data on any of the globals below and, worse, risks
 * double-playing an animation the router already dispatched.
 *
 * Zero dependencies and zero remote requests — the whole point of the free tier.
 */

import { run, teardown } from './engine/index.js';
import { isWaapiAnimation } from './shared/isWaapiAnimation.js';

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

function init(contextDoc = document) {
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
    run(anim, contextDoc);
    started += 1;
  });
  return started;
}

if (typeof window !== 'undefined') {
  /* Deleting an animation in the editor has to stop it playing on the page. The editor fires this before every push; the router bundle answers it wherever the editor's own engine is loaded, but a WordPress page carries THIS bundle alone and answered nothing — so a deleted hover animation kept its listeners and went on running until the next reload.

     Teardown is idempotent, so a host that also runs the router's fan-out simply tears down twice. */
  document.addEventListener('aae-reset-animation', function () {
    try {
      teardown();
    } catch (err) {
      console.warn('[motionkit:waapi] teardown error:', err);
    }
  });

  // Guarded so a page that somehow loads the bundle twice does not run every animation twice over.
  if (!window[INSTALLED_KEY]) {
    window[INSTALLED_KEY] = true;

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', function () {
        init();
      }, { once: true });
    } else {
      init();
    }
  }
}
