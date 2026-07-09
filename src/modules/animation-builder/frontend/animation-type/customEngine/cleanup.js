import {
  getActive,
  deleteActive,
  allActiveIds,
  clearActive,
} from "./registry.js";
import { clearSelectorCache } from "./scheduler.js";
import {
  unregisterAnimation,
  clearAll as clearCustomRegistry,
} from "./customRegistry.js";
import { revertSplitsFor, clearSplitCache } from "./extensions/splitText.js";
import { releaseAnim, clearOwnership } from "./ownership.js";
import { forgetAnim, clearAnims } from "./helper/inspector.js";

// Tag so resetAllAnimations.js sweeps us on global reset.
export function tagElement(el, id) {
  if (!el || !el.setAttribute) return;
  // Snapshot the author's inline styles once, before any tween writes to
  // them. The global reset restores this — clearProps:"all" alone wipes the
  // ENTIRE style attribute, including user-authored position/size/background.
  if (el.__wcfOrigCss === undefined) el.__wcfOrigCss = el.style.cssText;
  el.setAttribute("data-wcf-anim-id", id);
}

function runCleanups(handle) {
  handle?.listeners?.forEach((fn) => {
    try {
      fn();
    } catch (e) {
      /* noop */
    }
  });
  handle?.contexts?.forEach((ctx) => {
    try {
      ctx.revert();
    } catch (e) {
      /* noop */
    }
  });
}

export function teardown(id) {
  const handle = getActive(id);
  if (!handle) return;
  runCleanups(handle);
  // After the gsap context revert so tween inline styles are cleared first,
  // then unwrap SplitText spans back to the original text node.
  revertSplitsFor(id);
  deleteActive(id);
  unregisterAnimation(id);
  releaseAnim(id);
  forgetAnim(id);
}

export function teardownAll() {
  allActiveIds().forEach((id) => runCleanups(getActive(id)));
  clearSplitCache();
  clearActive();
  clearCustomRegistry();
  clearSelectorCache();
  clearOwnership();
  clearAnims();
}

// resetAllAnimations.js (editor-only bundle) fires `motionkit:reset-done`
// after its global nuke. We subscribe via a DOM event rather than a static
// import so production bundles never pull resetAllAnimations in — in prod
// this listener registers but the event never fires.
document.addEventListener("motionkit:reset-done", () => {
  allActiveIds().forEach((id) => {
    getActive(id)?.listeners?.forEach((fn) => {
      try {
        fn();
      } catch (e) {
        /* noop */
      }
    });
  });
  clearSplitCache();
  clearActive();
  clearCustomRegistry();
  clearSelectorCache();
  clearOwnership();
  clearAnims();
});
