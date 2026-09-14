// GENERATED FILE — do not edit here.
// Source of truth: motionkit-editor/src/lib/motionkit-engine/waapiEngine/
// Re-sync with `npm run copy:wporg` in the editor repo.

// Whether a record is a free animation the WAAPI engine owns. Four signals, any one of which is enough: an engine tag at the top level or under `runtime`, the group the editor stamps, or a free preset key.

// Mirrored in PHP by MotionKit\Common\AnimationEngine::is_waapi() in the wp.org plugin, which decides whether to enqueue the runtime at all. The two must agree: PHP enqueuing a record this rejects ships a bundle that plays nothing, and the reverse drops the animation with no error.

// It lives beside the engine rather than in shared/ so the wp.org plugin can vendor this folder on its own — shared/ is the editor's router, which the plugin has no use for. shared/animationKind.js re-exports this, so the router and the standalone bundle stay one definition rather than two that can drift.
export function isWaapiAnimation(anim) {
  if (anim == null || typeof anim !== 'object') return false;

  return (
    anim.engine === 'waapi' ||
    // The PRD's universal schema nests the engine under `runtime`; records authored against it carry it here rather than at the top level.
    anim.runtime?.engine === 'waapi' ||
    anim.group === 'free_animation' ||
    (typeof anim.presetKey === 'string' &&
      anim.presetKey.startsWith('motionkit-free-'))
  );
}
