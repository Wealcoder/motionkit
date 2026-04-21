import { Hooks } from "../smart-engine/core/infra.js";
import { Engine } from "../smart-engine/core/engine.js";

if (typeof ScrollTrigger !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const engine = new Engine({ hooks: new Hooks() });

// Editor sends `aae-reset-animation` before pushing a new config so each Play
// starts from a clean slate. destroyAll() reverts every GSAP context, kills
// ScrollTriggers/Timelines, and removes trigger DOM listeners — preventing
// the leak that would otherwise stack on every replay.
document.addEventListener("aae-reset-animation", () => {
  engine.destroyAll();
});
