import {
  getActive,
  deleteActive,
  allActiveIds,
  clearActive,
} from "./registry.js";
import { clearSelectorCache } from "./scheduler.js";

// Tag so resetAllAnimations.js sweeps us on global reset.
export function tagElement(el, id) {
  if (el && el.setAttribute) el.setAttribute("data-wcf-anim-id", id);
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
  deleteActive(id);
}

export function teardownAll() {
  allActiveIds().forEach((id) => runCleanups(getActive(id)));
  clearActive();
  clearSelectorCache();
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
  clearActive();
  clearSelectorCache();
});
