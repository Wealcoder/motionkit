import { requestRefresh } from "./scheduler.js";
import { setActive, getActive } from "./registry.js";
import { teardown } from "./cleanup.js";
import { isCustomAnimation } from "./helper/guards.js";
import { tagAllTargets, untagAllTargets } from "./helper/tagTargets.js";
import { rememberAnim, forgetAnim } from "./helper/inspector.js";
import { revertSplitsFor } from "./extensions/splitText.js";
import { releaseRenderClaims } from "./helper/renderOrder.js";
import { buildHandle } from "./handlers/index.js";
import { registerAllExtensions } from "./extensions/index.js";

// Public entry point for the custom engine. isCustomAnimation is re-exported
// here so customAnimation.js keeps a single import surface; the trigger-type
// builders live under ./handlers and the shared helpers under ./helper.
export { isCustomAnimation };

export function handleCustomAnimation(anim) {
  if (!isCustomAnimation(anim)) return;

  // Cheap no-op once everything registered; picks up plugins that loaded after boot.
  registerAllExtensions();

  // Live-update safety — editor re-dispatches on every edit.
  if (getActive(anim.id)) teardown(anim.id);

  rememberAnim(anim);
  tagAllTargets(anim);

  const handle = buildHandle(anim);
  // Nothing was built means nothing will ever tear this down, so undo what the pre-build steps left behind.
  if (!handle) {
    untagAllTargets(anim);
    revertSplitsFor(anim.id);
    releaseRenderClaims(anim.id);
    forgetAnim(anim.id);
    return;
  }

  setActive(anim.id, handle);
  requestRefresh();
}
