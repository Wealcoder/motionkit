import { registerMethod } from "../registry.js";

// Flip runs as a PROPERTY now: it rides inside a from/to/fromTo bucket as
// `{ flip: { absolute, scale, fade, spin, toggleClass, targets, props, ... } }`
// with timing (duration/ease/delay) as siblings. Legacy saved animations still
// use `method: "flip"` with a flat vars object — applyFlip handles both shapes.
//
// targets/toggleClass are consumed here for DOM mutation; everything else
// passes through to Flip.from.
export function applyFlip(tl, step, vars, overlap) {
  if (!step.itemClass || !vars) return;
  if (typeof Flip === "undefined") return;

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

  // Flip needs DOM-state diff: capture → mutate → animate, all at exec time.
  // The Flip.from tween runs independently of `tl` — subsequent timeline
  // steps don't wait for it (matches splitText/drawSVG behavior).

  const elements = gsap.utils.toArray(selector);
  if (!elements.length) return;

  const state = Flip.getState(
    elements,
    stateProps ? { props: stateProps } : undefined,
  );

  if (toggleClass) {
    elements.forEach((el) => el.classList.toggle(toggleClass));
  }

  tl.add(Flip.from(state, flipVars), overlap);
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
