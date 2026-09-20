// Whether a record is a free animation the WAAPI engine owns. Four signals, any one of which is enough: an engine tag at the top level or under `runtime`, the group the editor stamps, or a free preset key.

// Mirrored in PHP by MotionKit\Common\AnimationEngine::is_waapi() in this same plugin, which decides whether to enqueue the runtime at all. The two must agree: PHP enqueuing a record this rejects ships a bundle that plays nothing, and the reverse drops the animation with no error.

// Authored here, and exposed on window.MotionKitWaapi.isWaapiAnimation by engine/index.js so any host holding the loaded engine bundle can ask it directly — unlike shared/catalogue.js, no source copy of this file is synced into motionkit-editor. Its own router mirrors this same rule by hand in shared/animationKind.js, since that file's kindOf() needs it as a plain synchronous import with no engine-bundle dependency.
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
