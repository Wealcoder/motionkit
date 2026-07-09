import { querySelectorAllCached } from "../scheduler.js";
import { ownershipStatus } from "../ownership.js";

/* global __MKIT_DEV_LOG__ */

// Dev-only preview inspector. When the bundle is built with MOTIONKIT_DEV_LOG=
// true it installs a read-only `window.motionkit` getter: typing `motionkit` in
// the console returns a deeply-frozen snapshot of every registered custom
// animation (identity, config, resolved DOM targets, live status). Purely a
// preview/debugging surface — nothing here mutates engine state, and the whole
// module is inert (and DCE-friendly) in production where DEV_LOG is false.
const DEV_LOG =
  typeof __MKIT_DEV_LOG__ !== "undefined" && __MKIT_DEV_LOG__ === true;

// Every custom-animation config handed to the engine this session, keyed by id.
// Populated by rememberAnim from the entry point; only ever read to build a
// snapshot, so the stored (already deep-cloned) config is never mutated here.
const animConfigs = new Map();

export function rememberAnim(anim) {
  if (!DEV_LOG || !anim?.id) return;
  animConfigs.set(anim.id, anim);
}

export function forgetAnim(id) {
  if (!DEV_LOG) return;
  animConfigs.delete(id);
}

export function clearAnims() {
  if (!DEV_LOG) return;
  animConfigs.clear();
}

// Every gsap tween/timeline currently in the global timeline whose stamped
// data.animationId matches — step.js and buildTimeline stamp this on vars.data,
// so it's the reverse index from an editor anim id to its live gsap objects.
function gsapAnimsFor(animId) {
  if (typeof gsap === "undefined") return [];
  let children;
  try {
    children = gsap.globalTimeline.getChildren(true, true, true);
  } catch (e) {
    return [];
  }
  return children.filter((a) => a?.vars?.data?.animationId === animId);
}

// Precedence: Intercepted (a later anim took over every claimed element) →
// Running (a tween is in its active window) → Finished (all done, none active)
// → Waiting (built but paused/untriggered, or only disabled steps that never
// entered the global timeline).
function statusFor(animId) {
  const own = ownershipStatus(animId);
  if (own && own.owned === 0) return "Intercepted";

  const anims = gsapAnimsFor(animId);
  if (!anims.length) return "Waiting";
  if (anims.some((a) => typeof a.isActive === "function" && a.isActive())) {
    return "Running";
  }
  const allDone = anims.every(
    (a) => typeof a.totalProgress === "function" && a.totalProgress() >= 1,
  );
  return allDone ? "Finished" : "Waiting";
}

function resolveEls(selector) {
  if (!selector || typeof selector !== "string") return [];
  return [...querySelectorAllCached(selector)];
}

// Shape one registered anim into the inspector row. itemClass/itemElement are
// the animated targets (per step); targetClass/targetElement are the trigger
// elements (the click/hover selector — the buttons), null for scroll/pageload.
function toEntry(anim) {
  const tl = anim.timeline || {};
  const steps = tl.animations || [];

  const effects = steps.map((step) => ({
    stepId: step?.id ?? null,
    stepTitle: step?.title ?? null,
    method: step?.method ?? null,
    disabled: !!step?.disabled,
    itemClass: step?.itemClass ?? null,
    itemElement: resolveEls(step?.itemClass),
  }));

  const targetClass = anim.trigger?.selector ?? null;

  return {
    timelineId: tl.id ?? null,
    timelineTitle: tl.title ?? null,
    timelineData: tl,
    animationId: anim.id ?? null,
    animationTitle: anim.title ?? null,
    animationData: anim,
    pageType: anim.pageType ?? anim.page_type ?? null,
    group: anim.group ?? null,
    presetKey: anim.presetKey ?? anim.preset ?? anim.preset_key ?? null,
    triggerType: anim.trigger?.type ?? null,
    itemClass: effects.map((e) => e.itemClass).filter(Boolean),
    itemElement: effects.flatMap((e) => e.itemElement),
    targetClass,
    targetElement: resolveEls(targetClass),
    status: statusFor(anim.id),
    effects,
  };
}

// Freeze the snapshot so console readers can't mutate it, but never recurse
// into DOM nodes (freezing a live element would break it) and guard against any
// accidental cycle. The stored configs carry no gsap-injected `parent` cycle —
// gsap mutates spread copies, not these — so freezing them is safe.
function deepFreeze(value, seen) {
  if (value === null || typeof value !== "object") return value;
  if (typeof Node !== "undefined" && value instanceof Node) return value;
  if (seen.has(value)) return value;
  seen.add(value);
  Object.keys(value).forEach((k) => deepFreeze(value[k], seen));
  return Object.freeze(value);
}

function buildSnapshot() {
  const rows = [];
  animConfigs.forEach((anim) => rows.push(toEntry(anim)));
  return deepFreeze(rows, new WeakSet());
}

function install() {
  if (typeof window === "undefined") return;
  try {
    Object.defineProperty(window, "motionkit", {
      configurable: true,
      enumerable: false,
      get: buildSnapshot,
    });
  } catch (e) {
    /* a non-configurable prior definition — leave it */
  }
}

if (DEV_LOG) install();
