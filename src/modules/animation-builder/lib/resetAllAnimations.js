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
  ScrollTrigger?.getAll?.().forEach((st) => st.kill());
  gsap?.globalTimeline?.getChildren?.().forEach((t) => t.kill());
  if (gsap?.set && nodes.length) {
    gsap.set(nodes, { clearProps: "all" });
  }
}

window.addEventListener("message", (e) => {
  if (e.data?.type === "aae-reset-animation") {
    const animatedNodes = [...document.querySelectorAll("[data-wcf-anim-id]")];
    killGsap(animatedNodes);
    animatedNodes.forEach((node) => {
      clearFreeAnimationNode(node);
      node.removeAttribute("data-wcf-anim-id");
    });
    window.WCFFreeAnimBuilder?.killOnScrollObserver?.();
  }
});
