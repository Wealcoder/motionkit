import { isEditorPreviewMode } from "../customRegistry.js";

// Live "Current Running" logger for custom-engine animations. Fires each time an animation actually begins running — a timeline/tween onStart, or a ScrollTrigger entering its active range — so the console reflects what is animating live rather than merely what got built. Logs the editor-side identity (timeline + animation) plus the resolved ScrollTrigger data so a running animation can be traced straight back to its config.

// Gate logging so it never spams a public customer site console: default to editor-preview-only, but `window.__mkitRunLog = true` force-enables it anywhere for debugging and `= false` silences it.
function loggingEnabled() {
  if (typeof window !== "undefined" && window.__mkitRunLog != null) {
    return !!window.__mkitRunLog;
  }
  return isEditorPreviewMode();
}

function emit(info) {
  if (!loggingEnabled()) return;
  console.log("Current Running:", {
    "timeline id": info.timelineId ?? null,
    "timeline data": info.timelineData ?? null,
    "animation id": info.animationId ?? null,
    "animation data": info.animationData ?? null,
    "scroll trigger data": info.scrollTriggerData ?? null,
  });
}

// Chain an onStart logger onto a built GSAP timeline/tween without clobbering an existing onStart — the editor's own callback (if any) still runs, then ours. Used for page_load / click / hover where there is no ScrollTrigger, so scrollTriggerData is null.
export function attachPlayLogger(animation, info) {
  if (!animation || !loggingEnabled()) return animation;
  const prev = animation.eventCallback("onStart");
  animation.eventCallback("onStart", function (...args) {
    if (typeof prev === "function") prev.apply(this, args);
    emit({ ...info, scrollTriggerData: null });
  });
  return animation;
}

// Chain an onToggle logger into a ScrollTrigger config object BEFORE it is handed to GSAP — instance-level wrapping isn't reliable, so we wrap the config. We log only when the trigger enters its active range (self.isActive) and pass the live ScrollTrigger instance, which carries start/end/progress/direction, as the scroll trigger data.
export function withScrollLogger(scrollCfg, info) {
  if (!scrollCfg || !loggingEnabled()) return scrollCfg;
  const prev = scrollCfg.onToggle;
  scrollCfg.onToggle = function (self) {
    if (typeof prev === "function") prev.call(this, self);
    if (self?.isActive) emit({ ...info, scrollTriggerData: self });
  };
  return scrollCfg;
}
