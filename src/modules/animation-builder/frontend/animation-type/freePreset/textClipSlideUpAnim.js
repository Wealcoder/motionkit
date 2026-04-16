import { normalizeToCssVars } from "@/lib/FreeAnimation/normalizeToCssVars";

const PRESET_KEY = "wcf-mk-txt-csu-fa";
const CLASS_LIST = [
  "wcf-free-ab-25",
  "wcf-free-ab-freeAnimGeneral",
  "wcf-free-ab-clip-slide-up",
];

export function textClipSlideUpAnim() {
  function handler(e) {
    const anim = e?.detail;
    if (!anim || anim.presetKey !== PRESET_KEY) return;
    if (!anim?.itemClass) return;
    const engine = window.WCFFreeAnimBuilder;
    if (!engine) {
      console.error("Free Animation engine not initialized!");
      return;
    }

    const element = {
      id: anim.id,
      trigger: anim.itemClass,
      classToAdd: CLASS_LIST,
      styles: normalizeToCssVars(anim.vars),
      initElementStyle: anim.initElementStyle || {
        visibility: "hidden",
        opacity: "0",
      },
    };

    const triggerType = anim.trigger?.type || "on_scroll";

    if (triggerType === "page_load") {
      engine.initOnPageLoadEvent([element]);
    } else {
      engine.triggerOnScrollObserver([element]);
    }
  }

  document.addEventListener("aae-animation-event", handler);
}

textClipSlideUpAnim();
