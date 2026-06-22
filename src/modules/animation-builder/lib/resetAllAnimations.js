// Global reset for all animation types. Editor-only — dispatched on `aae-reset-animation`.
// Sweeps the DOM for any element marked with `data-wcf-anim-id` and clears applied state
// across free animations and GSAP alike.

const FREE_CLASS_PREFIX = "wcf-free-ab-";
const FREE_INIT_STYLE_CLASS = "wcf-free-ab-init-style-props";
const CSS_VAR_PREFIX = "--animation";

function clearFreeAnimationNode(node) {
  // Drop free-preset marker classes
  [...node.classList].forEach((cls) => {
    if (cls.startsWith(FREE_CLASS_PREFIX) || cls === FREE_INIT_STYLE_CLASS) {
      node.classList.remove(cls);
    }
  });

  // Drop animation-* CSS custom properties
  for (let i = node.style.length - 1; i >= 0; i--) {
    const prop = node.style[i];
    if (prop.startsWith(CSS_VAR_PREFIX)) node.style.removeProperty(prop);
  }

  // Drop the observer back-reference if it's still hanging around
  delete node.__wcfFreeAnimConfig;
}

function killGsap(nodes) {
  const { gsap, ScrollTrigger } = window;
  const nodeSet = new Set(nodes);

  // Scoped sweep: only kill triggers whose trigger element OR whose driven
  // animation targets one of OUR animated elements (data-wcf-anim-id). Matching
  // the animation targets — not just the trigger element — catches animations
  // that use a custom trigger selector (a section/container that never carries
  // data-wcf-anim-id); without it those ScrollTriggers survive every reset and
  // accumulate on each Play/Save. ScrollSmoother's own internal trigger is
  // attached to body/wrapper and its animation targets the content wrapper —
  // never in nodeSet — so it's never touched. No kill, no recreate, no lerp
  // interruption, ever, during a normal reset/Play cycle.
  ScrollTrigger?.getAll?.().forEach((st) => {
    const target = st.trigger || st.vars?.trigger;
    const animTargets = st.animation?.targets ? st.animation.targets() : [];
    const ownsTrigger = target && nodeSet.has(target);
    const ownsAnimation = animTargets.some((el) => nodeSet.has(el));
    if (ownsTrigger || ownsAnimation) {
      st.kill();
    }
  });

  // getChildren(true, true, false) flattens nested timelines down to the
  // actual tweens so .targets() resolves correctly.
  gsap?.globalTimeline?.getChildren?.(true, true, false).forEach((t) => {
    try {
      const targets = t.targets ? t.targets() : [];
      if (targets.some((el) => nodeSet.has(el))) t.kill();
    } catch (_) {
      /* tween without resolvable targets */
    }
  });

  if (gsap?.set && nodes.length) {
    gsap.set(nodes, { clearProps: "all" });
  }
}
function runGlobalReset() {
  const animatedNodes = [...document.querySelectorAll("[data-wcf-anim-id]")];
  killGsap(animatedNodes);
  animatedNodes.forEach((node) => {
    clearFreeAnimationNode(node);
    node.removeAttribute("data-wcf-anim-id");
  });
  window.WCFFreeAnimBuilder?.killOnScrollObserver?.();
  // Preset-specific cleanups (e.g. customEngine) listen for this event and
  // run AFTER the global nuke. Using a DOM event instead of a shared callback
  // registry keeps this file editor-only — production bundles don't static-
  // import it, so listeners in other bundles just sit dormant in prod.
  document.dispatchEvent(new CustomEvent("motionkit:reset-done"));
}

// Two channels so presets don't need to forward:
// - window.message: external triggers (cross-frame, explicit postMessage)
// - document event: what frontend.js dispatches for `wcf-animation-config-reset`
window.addEventListener("message", (e) => {
  if (e.data?.type === "aae-reset-animation") runGlobalReset();
});
document.addEventListener("aae-reset-animation", runGlobalReset);
