import { buildTimeline } from "../mbuild/timeline.js";
import { buildStepTweens } from "../mbuild/tween.js";
import { attachPlayLogger } from "../helper/logger.js";
import { registerTimeline, isEditorPreviewMode } from "../customRegistry.js";
import { isTimelineEnabledFor } from "../helper/guards.js";

// In editor preview mode, custom anims build paused so DevTools owns playback.
// Public site builds remain auto-play (extraConfig undefined).
function pageloadExtraConfig() {
  return isEditorPreviewMode() ? { paused: true } : undefined;
}

export function buildPageloadAnim(anim) {
  const editorMode = isEditorPreviewMode();
  const timelineEnabled = isTimelineEnabledFor(anim);
  const tlCfg = anim.timeline;
  const ctx = gsap.context(() => {
    if (!tlCfg) return;
    const extra = editorMode ? { paused: true } : pageloadExtraConfig();

    if (timelineEnabled) {
      const tl = buildTimeline(tlCfg, extra, {
        animationId: anim.id,
        animationTitle: anim.title,
      });
      attachPlayLogger(tl, {
        timelineId: tlCfg.id,
        timelineData: tlCfg,
        animationId: anim.id,
        animationData: anim,
      });
      if (editorMode && tl) {
        registerTimeline(anim.id, tl);
      }
      return;
    }

    (tlCfg.animations || []).forEach((step) => {
      const tweens = buildStepTweens(step, extra, {
        animationId: anim.id,
        animationTitle: anim.title,
      });
      tweens.forEach((t) =>
        attachPlayLogger(t, {
          timelineId: null,
          timelineData: null,
          animationId: anim.id,
          animationData: anim,
        }),
      );
      if (editorMode) {
        tweens.forEach((t) => registerTimeline(anim.id, t));
      }
    });
  });
  return { contexts: [ctx], listeners: [] };
}
