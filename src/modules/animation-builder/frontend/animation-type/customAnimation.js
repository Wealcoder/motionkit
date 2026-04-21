import { handleCustomAnimation, isCustomAnimation } from "./customEngine/index.js";
import { registerAllExtensions } from "./customEngine/extensions/index.js";

if (typeof gsap !== "undefined" && typeof ScrollTrigger !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

registerAllExtensions();

document.addEventListener("aae-animation-event", (e) => {
  const anim = e?.detail;
  if (!isCustomAnimation(anim)) return;
  handleCustomAnimation(anim);
});
