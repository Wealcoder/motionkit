import { requestRefresh } from "./scheduler.js";
import { setActive, getActive } from "./registry.js";
import { teardown } from "./cleanup.js";
import { isCustomAnimation } from "./helper/guards.js";
import { tagAllTargets } from "./helper/tagTargets.js";
import { buildHandle } from "./handlers/index.js";

// Public entry point for the custom engine. isCustomAnimation is re-exported
// here so customAnimation.js keeps a single import surface; the trigger-type
// builders live under ./handlers and the shared helpers under ./helper.
export { isCustomAnimation };

export function handleCustomAnimation(anim) {
  if (!isCustomAnimation(anim)) return;

  // Live-update safety — editor re-dispatches on every edit.
  if (getActive(anim.id)) teardown(anim.id);

  tagAllTargets(anim);

  const handle = buildHandle(anim);
  if (!handle) return;

  setActive(anim.id, handle);
  requestRefresh();
}
