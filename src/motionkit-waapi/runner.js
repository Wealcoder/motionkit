// GENERATED FILE — do not edit here.
// Source of truth: motionkit-editor/src/lib/motionkit-engine/waapiEngine/
// Re-sync with `npm run copy:wporg` in the editor repo.

/**
 * WAAPI Animation Runner
 * Pure Web Animations API execution layer with trigger dispatch, stagger, and lifecycle management.
 */

import { compileEffectToWaapi } from './compiler.js';
import {
  observeViewport,
  observeScrollScrub,
  disconnectAllObservers,
} from './observer.js';
import { splitText, revertSplit, isSplitKind } from './splitText.js';

// Tracks running Animation instances: Map<HTMLElement, Set<Animation>>
const runningAnimations = new Map();
// Tracks event listener cleanup callbacks
const listenerCleanups = [];
// Elements whose text this run split, so teardown can put their markup back. A split rewrites innerHTML, so leaving one behind means the page keeps the generated spans after the engine has stopped.
const splitElements = new Set();

// Every Animation the engine starts must land here, or teardown cannot cancel it. Hover and click animations use fill:'forwards', so an untracked one stays pinned to its end state for the life of the page.
function track(element, animation) {
  if (!animation) return animation;
  if (!runningAnimations.has(element))
    runningAnimations.set(element, new Set());
  runningAnimations.get(element).add(animation);
  return animation;
}

// Paints an element's opening keyframe and holds it there, as a paused zero-duration animation with fill:'both'. Used to establish a scroll animation's start state before the element scrolls into view.
function hold(element, keyframes) {
  if (!element || typeof element.animate !== 'function') return null;
  if (isReducedMotion()) return null;
  const first = keyframes && keyframes[0];
  if (!first || Object.keys(first).length === 0) return null;
  try {
    const holder = track(
      element,
      element.animate([first, first], { duration: 1, fill: 'both' }),
    );
    holder.pause();
    return holder;
  } catch {
    return null;
  }
}

// True when DevTools has taken over playback inside the editor preview iframe. Mirrors isEditorPreviewMode() in the GSAP engine's customRegistry, deliberately reading the same window flag so the two engines agree on what "the editor is driving" means. Read at call time, not at module load: the engine bundle can be evaluated before DevTools finishes loading.
function isEditorPreviewMode() {
  return (
    typeof window !== 'undefined' && window.__motionkitDevToolsLoaded === true
  );
}

// Cancels a batch of animations started by a previous hover/click gesture and forgets them.
function cancelTracked(element, animations) {
  animations.forEach((a) => {
    if (!a) return;
    try {
      a.cancel();
    } catch {
      /* ignore */
    }
    runningAnimations.get(element)?.delete(a);
  });
}

/**
 * Detects the current device bucket from viewport width.
 * @returns {string}
 */
function getCurrentDevice() {
  if (typeof window === 'undefined') return 'desktop';
  const width = window.innerWidth;
  if (width <= 480) return 'mobile';
  if (width <= 768) return 'tab';
  if (width <= 1024) return 'tab_land';
  if (width <= 1366) return 'laptop';
  return 'desktop';
}

/**
 * Checks if reduced motion is preferred.
 * @returns {boolean}
 */
function isReducedMotion() {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Finds all DOM elements matching the selector safely.
 * @param {string} selector
 * @param {Document|HTMLElement} [root=document]
 * @returns {Array<HTMLElement>}
 */
function queryElements(selector, root = document) {
  if (!selector || typeof selector !== 'string') return [];
  try {
    return Array.from(root.querySelectorAll(selector));
  } catch {
    return [];
  }
}

/**
 * Plays a compiled WAAPI animation on an element.
 *
 * @param {HTMLElement} element
 * @param {Array<Object>} keyframes
 * @param {Object} options
 * @param {number} [extraDelay=0]
 * @returns {Animation|null}
 */
export function playWaapiAnimation(
  element,
  keyframes,
  options,
  extraDelay = 0,
) {
  if (!element || typeof element.animate !== 'function') return null;

  const animOptions = {
    ...options,
    delay: (options.delay || 0) + extraDelay,
  };

  // If user prefers reduced motion, finish instantly with final state
  if (isReducedMotion()) {
    animOptions.duration = 0;
    animOptions.delay = 0;
  }

  try {
    const animation = track(element, element.animate(keyframes, animOptions));

    /* Deliberately NOT untracked on finish. Every free animation compiles with fill 'both' or 'forwards', so a finished Animation is still painting its end state on the element — dropping it from the registry left teardown holding nothing to cancel, and a deleted animation went on showing until the page was reloaded.

       The registry is keyed by element and cleared wholesale by teardownWaapi, so holding finished entries costs one Set entry per element per run and never unbounded growth. */

    return animation;
  } catch (err) {
    console.warn('[motionkit:waapi] Animation error on', element, err);
    return null;
  }
}

/**
 * Runs a Free WAAPI Animation record.
 *
 * @param {Object} anim - The animation definition from Editor or WordPress
 * @param {Document|HTMLElement} [contextDoc=document]
 */
export function runWaapiAnimation(anim, contextDoc = document) {
  if (!anim || typeof anim !== 'object') return;

  const device = getCurrentDevice();

  // Check responsive toggle
  if (anim.responsive && anim.responsive[device] === false) {
    return;
  }

  const trigger = anim.trigger || {};
  const triggerType = trigger.type || 'on_scroll';
  const effects = anim.timeline?.animations || [];

  if (effects.length === 0) return;

  effects.forEach((effect) => {
    if (effect.disabled) return;

    const selector = effect.itemClass || trigger.selector;
    if (!selector) return;

    const matched = queryElements(selector, contextDoc);
    if (matched.length === 0) return;

    // Splitting retargets the effect onto the generated parts, so the stagger below runs over characters or words instead of over whole elements. The matched elements stay the trigger surface.
    let elements = matched;
    if (isSplitKind(effect.splitText)) {
      const parts = [];
      matched.forEach((el) => {
        const made = splitText(el, effect.splitText);
        if (made.length > 0) {
          splitElements.add(el);
          parts.push(...made);
        }
      });
      if (parts.length > 0) elements = parts;
    }

    const { keyframes, options } = compileEffectToWaapi(effect, device);

    // Read at the effect root beside splitText and stagger, not inside a device bag: a hover style either reverts or it does not, and having that differ per breakpoint would only produce elements that stay recoloured on one screen size.
    const reverseOnLeave = effect.reverseOnLeave === true;

    // Stagger handling (default 0 or from effect/stagger)
    const staggerMs = effect.stagger
      ? effect.stagger <= 20
        ? effect.stagger * 1000
        : effect.stagger
      : 0;

    // Trigger Elements (for click/hover, can be different from animated elements)
    // Falls back to `matched`, never to `elements`: with split text the latter is the generated per-character spans, so hovering one letter would bind the gesture to that letter alone instead of to the whole heading.
    const triggerElements =
      trigger.selector && (triggerType === 'click' || triggerType === 'hover')
        ? queryElements(trigger.selector, contextDoc)
        : matched;
    const finalTriggerElements =
      triggerElements.length > 0 ? triggerElements : matched;

    // Trigger Execution
    if (triggerType === 'page_load') {
      elements.forEach((el, index) => {
        playWaapiAnimation(el, keyframes, options, index * staggerMs);
      });
    } else if (triggerType === 'hover') {
      finalTriggerElements.forEach((triggerEl) => {
        let activeAnims = [];

        /* A free preset is an ENTRANCE: it brings an element in. Playing it backwards therefore lands on its opening keyframe — opacity 0 for a fade — so the element disappeared the moment the pointer left. It plays forwards only, and the state it finishes in is the state that stays.

           Only a still-running batch is cancelled, so re-hovering mid-animation restarts cleanly while a completed one keeps its fill. */
        const onEnter = () => {
          elements.forEach((targetEl, i) => {
            const prev = activeAnims[i];
            if (prev && prev.playState === 'running') {
              cancelTracked(targetEl, [prev]);
            }
          });
          activeAnims = elements.map((targetEl) => {
            try {
              return track(
                targetEl,
                targetEl.animate(keyframes, { ...options, fill: 'forwards' }),
              );
            } catch {
              return null;
            }
          });
        };

        triggerEl.addEventListener('mouseenter', onEnter);

        /* A hover STYLE preset is the opposite of an entrance: it recolours or respaces an element that is already there, so the change has to come back when the pointer leaves. That is the only case where playing backwards is right, and the record opts into it explicitly — an entrance carries no flag and keeps holding its end state.

           The return trip is the same keyframes reversed rather than Animation.reverse(), so it works whether or not the forward run ever finished. */
        if (reverseOnLeave) {
          const reversed = [...keyframes].reverse();

          const onLeave = () => {
            elements.forEach((targetEl, i) => {
              const prev = activeAnims[i];
              if (prev && prev.playState === 'running') {
                cancelTracked(targetEl, [prev]);
              }
            });
            activeAnims = elements.map((targetEl) => {
              try {
                return track(
                  targetEl,
                  targetEl.animate(reversed, { ...options, fill: 'forwards' }),
                );
              } catch {
                return null;
              }
            });
          };

          triggerEl.addEventListener('mouseleave', onLeave);
          listenerCleanups.push(() =>
            triggerEl.removeEventListener('mouseleave', onLeave),
          );
        }

        listenerCleanups.push(() => {
          elements.forEach((targetEl, i) =>
            cancelTracked(targetEl, [activeAnims[i]]),
          );
          triggerEl.removeEventListener('mouseenter', onEnter);
        });
      });
    } else if (triggerType === 'click') {
      finalTriggerElements.forEach((triggerEl) => {
        let activeAnims = [];

        // No toggle: the second click replayed the entrance backwards and hid the element. Every click plays it forwards, so the animation can be re-run as often as the user likes and the element stays where it landed.
        const onClick = () => {
          elements.forEach((targetEl, i) => {
            const prev = activeAnims[i];
            if (prev && prev.playState === 'running') {
              cancelTracked(targetEl, [prev]);
            }
          });
          activeAnims = elements.map((targetEl) => {
            try {
              return track(
                targetEl,
                targetEl.animate(keyframes, { ...options, fill: 'forwards' }),
              );
            } catch {
              return null;
            }
          });
        };

        triggerEl.addEventListener('click', onClick);
        listenerCleanups.push(() => {
          elements.forEach((targetEl, i) =>
            cancelTracked(targetEl, [activeAnims[i]]),
          );
          triggerEl.removeEventListener('click', onClick);
        });
      });
    } else {
      // Default: 'on_scroll' (Viewport trigger via IntersectionObserver or Scrub)
      const stList = trigger.scrollTrigger || [];
      const seedSt = stList[0] || {};
      const devSt = seedSt.devices?.[device] || seedSt;

      const start = devSt.start || 'top center';
      const end = devSt.end || 'bottom top';
      const once = devSt.once !== false; // default true

      // A scroll trigger may name its own element — "start when THAT enters view, animate THIS". Left blank, the animated element is its own trigger, which is the default a user gets and the behaviour they expect. A named trigger that matches nothing falls back the same way rather than never firing.
      const scrollTriggerEls = devSt.trigger
        ? queryElements(devSt.trigger, contextDoc)
        : [];
      const scrollRootFor = (el) =>
        scrollTriggerEls.length > 0 ? scrollTriggerEls[0] : el;

      const rawScrub = devSt.scrub;
      const isScrub =
        rawScrub === true ||
        rawScrub === 'true' ||
        rawScrub === 'custom' ||
        (typeof rawScrub === 'number' && rawScrub > 0) ||
        (typeof devSt.customScrub === 'number' && devSt.customScrub > 0);

      const scrubVal =
        rawScrub === 'custom' && typeof devSt.customScrub === 'number'
          ? devSt.customScrub
          : rawScrub === 'true'
            ? true
            : rawScrub;

      // Editor preview short-circuits BOTH scroll paths. Checked ahead of isScrub because a scrubbed animation is created paused and driven by scroll position, and nothing scrolls the preview iframe on the user's behalf — Play would leave it frozen on its first frame.
      if (isEditorPreviewMode()) {
        elements.forEach((el, index) => {
          playWaapiAnimation(el, keyframes, options, index * staggerMs);
        });
      } else if (isScrub) {
        // Native WAAPI Scrub: animation progresses proportionally with user scroll
        elements.forEach((el) => {
          try {
            const animInstance = track(
              el,
              el.animate(keyframes, { ...options, fill: 'both' }),
            );
            animInstance.pause();

            // Progress is measured against the TRIGGER's position, the same node the non-scrub path observes.
            const unscrub = observeScrollScrub(
              scrollRootFor(el),
              animInstance,
              {
                start,
                end,
                scrub: scrubVal,
                once,
              },
            );

            listenerCleanups.push(unscrub);
          } catch (err) {
            console.warn('[motionkit:waapi] Scrub error', err);
          }
        });
      } else {
        // Standard Viewport Trigger via IntersectionObserver
        elements.forEach((el, index) => {
          let animInstance = null;

          // Pin the element to its opening keyframe now, before it is ever painted. Without this it renders in its natural state until the observer fires, so a Fade In element is fully visible on the way down the page and then snaps to opacity 0 — the flash GSAP avoids by setting the start state at build time. The holder is tracked, so teardown releases it.
          let holder = hold(el, keyframes);

          const release = () => {
            if (!holder) return;
            cancelTracked(el, [holder]);
            holder = null;
          };

          // Observe the trigger, animate the element: with no trigger class these are the same node.
          const unobserve = observeViewport(scrollRootFor(el), {
            start,
            once,
            onEnter: () => {
              release();
              animInstance = playWaapiAnimation(
                el,
                keyframes,
                options,
                index * staggerMs,
              );
            },
            onLeave: () => {
              if (!once && animInstance) {
                cancelTracked(el, [animInstance]);
                animInstance = null;
                // Re-arm the start state so the next entry fades in again instead of popping.
                holder = hold(el, keyframes);
              }
            },
          });

          listenerCleanups.push(() => {
            release();
            unobserve();
          });
        });
      }
    }
  });
}

/**
 * Tears down all running WAAPI animations, observers, and listeners.
 */
export function teardownWaapi() {
  // 1. Cancel all active animations
  runningAnimations.forEach((set) => {
    set.forEach((anim) => {
      try {
        anim.cancel();
      } catch {
        /* ignore */
      }
    });
  });
  runningAnimations.clear();

  // 2. Disconnect all observers
  disconnectAllObservers();

  // 3. Put split text back before dropping listeners, so a re-run starts from the original markup rather than re-splitting generated spans.
  splitElements.forEach((el) => {
    try {
      revertSplit(el);
    } catch {
      /* ignore */
    }
  });
  splitElements.clear();

  // 4. Remove all event listeners
  while (listenerCleanups.length > 0) {
    const cleanup = listenerCleanups.pop();
    try {
      cleanup();
    } catch {
      /* ignore */
    }
  }
}
