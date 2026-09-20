/**
 * The WAAPI engine's public surface — `run`/`teardown`/`isWaapiAnimation`, with zero knowledge
 * of where an animation record came from (WordPress-localized data, a router dispatch, anything else).
 *
 * Exposing `window.MotionKitWaapi` here (not in wrapper.js) means the engine-only build —
 * the one copied into motionkit-editor's iframe, where entry.js feeds it Redux-dispatched
 * data through the router — gets the same global surface as the WordPress-facing build,
 * without needing its own copy of this line.
 *
 * isWaapiAnimation rides along on this surface rather than as a synced source file (unlike
 * shared/catalogue.js) because every consumer that needs it already has the engine bundle
 * loaded by the time it asks — wrapper.js self-boots after this module runs, and the
 * editor's router only classifies a record once `aae-animation-event` actually fires.
 */

import { runWaapiAnimation, teardownWaapi } from './runner.js';
import { isWaapiAnimation } from '../shared/isWaapiAnimation.js';

export const run = runWaapiAnimation;
export const teardown = teardownWaapi;
export { isWaapiAnimation };

if (typeof window !== 'undefined') {
  window.MotionKitWaapi = {
    version: '1.0.0',
    run,
    teardown,
    isWaapiAnimation,
  };
}
