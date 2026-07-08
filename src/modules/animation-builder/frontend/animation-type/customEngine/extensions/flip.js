import { registerMethod } from "../registry.js";
import { normalizeStepVars } from "../select/merge.js";

// Flip runs as a PROPERTY now: it rides inside a from/to/fromTo bucket as
// `{ flip: { absolute, scale, fade, spin, toggleClass, targets, props, ... } }`
// with timing (duration/ease/delay) as siblings. Legacy saved animations still
// use `method: "flip"` with a flat vars object — buildFlip handles both shapes.
//
// targets/toggleClass are consumed here for DOM mutation; everything else
// passes through to Flip.from.
//
// buildFlip runs one capture → mutate → animate cycle and returns the Flip.from
// tween (or null when there's nothing to flip). It's split out from applyFlip so
// the interaction layer can run a FRESH cycle on every click/hover instead of
// replaying a single tween baked at build time (which toggled the class at load,
// never reversed, and never re-diffed the live layout).
export function buildFlip(step, vars) {
  if (!step.itemClass || !vars) return null;
  if (typeof Flip === "undefined") return null;

  // New property shape nests options under `flip`; legacy method shape is flat.
  const nested = vars.flip && typeof vars.flip === "object";
  const flipCfg = nested ? vars.flip : vars;
  // Timing/other tween vars are siblings of `flip` in the property shape.
  const { flip, ...timing } = vars;

  const selector = flipCfg.targets || step.itemClass;
  const toggleClass = flipCfg.toggleClass;
  const stateProps = flipCfg.props;

  // strip targets/toggleClass — handled manually so we can capture state
  // pre-mutation. `props` stays on flipVars (Flip.from accepts it too). Timing
  // siblings are merged back in for the property shape.
  const flipVars = { ...flipCfg, ...(nested ? timing : {}) };
  delete flipVars.targets;
  delete flipVars.toggleClass;

  // Flip needs DOM-state diff: capture → mutate → animate.
  const elements = gsap.utils.toArray(selector);
  if (!elements.length) return null;

  const state = Flip.getState(
    elements,
    stateProps ? { props: stateProps } : undefined,
  );

  if (toggleClass) {
    elements.forEach((el) => el.classList.toggle(toggleClass));
  }

  return Flip.from(state, flipVars);
}

export function applyFlip(tl, step, vars, overlap) {
  // The Flip.from tween runs independently of `tl` — subsequent timeline
  // steps don't wait for it (matches splitText/drawSVG behavior).
  const anim = buildFlip(step, vars);
  if (anim) tl.add(anim, overlap);
}

// Resolve the GSAP-ready vars for a flip step the same way standard.js hands
// them to applyFlip: from/to pass their bucket straight through, fromTo merges
// both sides (to wins), and the legacy flip method is already flat.
export function flipVarsForStep(step) {
  const vars = normalizeStepVars(step);
  if (!vars) return null;
  if (step.method === "fromTo") {
    return { ...(vars.from || {}), ...(vars.to || {}) };
  }
  return vars;
}

// True when a step drives Flip — the new property shape nests `flip` inside a
// from/to bucket (fromTo on either side); the legacy shape is method: "flip".
export function stepUsesFlip(step) {
  if (!step) return false;
  if (step.method === "flip") return true;
  const v = step.vars || {};
  if (step.method === "from") return !!v.from?.flip;
  if (step.method === "to") return !!v.to?.flip;
  if (step.method === "fromTo") return !!(v.to?.flip || v.from?.flip);
  return false;
}

export function registerFlipMethod() {
  if (typeof Flip === "undefined") return false;
  try {
    gsap.registerPlugin(Flip);
  } catch (e) {
    /* noop */
  }

  // Legacy: keep the standalone method for animations saved before flip became
  // a property. New animations reach applyFlip via the standard from/to handler.
  registerMethod("flip", (tl, step, vars, overlap) =>
    applyFlip(tl, step, vars, overlap),
  );

  return true;
}
