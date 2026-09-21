/**
 * WAAPI Animation Runner
 * Pure Web Animations API execution layer with trigger dispatch, stagger, and lifecycle management.
 *
 * Authored here (not generated) — this repo is the WAAPI engine's source of truth. A copy of
 * shared/catalogue.js is synced out to motionkit-editor by scripts/copy-to-editor.js, for the
 * editor's "Add Property" UI to import statically; the compiled engine bundle is copied out
 * the same way, for the editor's preview iframe to load and read window.MotionKitWaapi from.
 */

import { compileEffectToWaapi } from './compiler/index.js';
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
// What this engine tagged, so teardown removes its own marks and not another engine's: Map<HTMLElement, { animIds: Set<string>, stepIds: Set<string> }>
const taggedTargets = new Map();

const ANIM_ID_ATTR = 'data-motionkit-anim-id';
const STEP_ID_ATTR = 'data-motionkit-step-id';

// Marks an animated element the way the GSAP engine's tagAllTargets does, because the editor identifies an animated element by these attributes alone: the inspector's markers and the preview context menu scan for ANIM_ID_ATTR, the Structure list resolves an element through it, the global reset sweeps it, and copy-one-effect reads the comma-separated STEP_ID_ATTR beside it — a free animation that leaves no mark is invisible to all of them.

// __wcfOrigCss is part of the same contract, not an extra: the editor's global reset runs clearProps over every tagged element, which wipes the whole inline style attribute, and restores the author's own styles from this snapshot, so taking the mark without the snapshot would make a reset delete inline styles the page author wrote.
function tagTarget(el, animId, stepId) {
  if (!el || !el.setAttribute || !animId) return;

  if (el.__wcfOrigCss === undefined) el.__wcfOrigCss = el.style.cssText;

  el.setAttribute(ANIM_ID_ATTR, animId);

  // One element can be the target of several effects, so the step list appends rather than replaces — paste-one-effect narrows by the whole list.
  if (stepId) {
    const existing = el.getAttribute(STEP_ID_ATTR);
    const ids = existing ? existing.split(',') : [];
    if (!ids.includes(stepId)) {
      ids.push(stepId);
      el.setAttribute(STEP_ID_ATTR, ids.join(','));
    }
  }

  if (!taggedTargets.has(el))
    taggedTargets.set(el, { animIds: new Set(), stepIds: new Set() });
  const marks = taggedTargets.get(el);
  marks.animIds.add(animId);
  if (stepId) marks.stepIds.add(stepId);
}

// Removes only the marks this engine wrote. The GSAP engine tags the same elements with the same attributes, so clearing a value it owns would drop a live custom animation out of the inspector and out of the reset sweep. __wcfOrigCss stays — it is the author's baseline, not an ownership claim.
function untagTargets() {
  taggedTargets.forEach((marks, el) => {
    if (!el.getAttribute) return;

    if (marks.animIds.has(el.getAttribute(ANIM_ID_ATTR)))
      el.removeAttribute(ANIM_ID_ATTR);

    const remaining = (el.getAttribute(STEP_ID_ATTR) || '')
      .split(',')
      .filter((id) => id && !marks.stepIds.has(id));
    if (remaining.length) el.setAttribute(STEP_ID_ATTR, remaining.join(','));
    else el.removeAttribute(STEP_ID_ATTR);
  });
  taggedTargets.clear();
}

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

  /* A clip-path opening state is never held. An element clipped to nothing is removed from IntersectionObserver's geometry — verified in Chromium, where a clip-path-held element reports isIntersecting false forever while an opacity-held one reports true on scroll — so holding it hides the element from the very observer that exists to reveal it, and a wipe stays clipped for the life of the page.

     The cost is one frame of un-clipped paint before the observer fires, which is the same trade the whole hold exists to avoid. Staying visible is strictly better than never animating. */
  if (first.clipPath) return null;
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

// The Start and End controls store the literal 'custom' and keep the typed position in a sibling key, the same shape the Scrub control already uses below: reading only `start` left a custom position arriving as the word 'custom', which parseTriggerPosition cannot read, so it fell back to the default and the control looked applied while changing nothing.

// A blank custom value resolves to '' so the caller's own default takes over, rather than handing the parser an empty string to fail on.
export function resolveScrollPosition(value, custom) {
  if (value !== 'custom') return value;
  return typeof custom === 'string' ? custom.trim() : '';
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

    // Tagged here rather than where the animation starts, so a scroll effect carries its marks while it waits out of view — the editor's inspector has to find it before it has played.
    matched.forEach((el) => tagTarget(el, anim.id, effect.id));

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

    /* Read at the effect root beside splitText and stagger, not inside a device bag: a hover style either reverts or it does not, and having that differ per breakpoint would only produce elements that stay recoloured on one screen size.

       Defaults to ON for a 'to' effect on hover or click, matching the control's own default so the editor never shows a switch the engine disagrees with. Only an explicit false turns it off.

       The METHOD is what makes that default safe, not the trigger. A 'to' effect starts from the element's own styling, so playing it backwards restores exactly what the stylesheet says. A 'from' effect is an entrance — Fade In assigned to a hover trigger — whose opening keyframe is opacity 0, so defaulting it ON would hide the element the moment the pointer left. Those opt in explicitly or not at all. */
    const method =
      effect?.method === 'to' || effect?.method === 'fromTo'
        ? effect.method
        : 'from';
    const reverseOnLeave =
      effect.reverseOnLeave === undefined
        ? method === 'to' &&
          (triggerType === 'hover' || triggerType === 'click')
        : effect.reverseOnLeave === true;

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
            /* How far the forward run actually got, per element, read BEFORE anything is cancelled. Leaving mid-hover used to restart the revert from the reversed keyframes' first frame — the full hover state — so the element flashed the colour the pointer was moving away from and then crawled back over ground it had never covered.

               Seeking the revert to the mirrored position makes it pick up exactly where the entrance stopped, and a half-played entrance reverts in half the time. */
            const progress = elements.map((targetEl, i) => {
              const prev = activeAnims[i];
              if (!prev) return 1;
              const total = Number(options.duration) || 0;
              if (!total) return 1;
              const played = Number(prev.currentTime) || 0;
              const delayMs = Number(options.delay) || 0;
              return Math.min(Math.max((played - delayMs) / total, 0), 1);
            });

            /* Unconditionally, unlike on re-enter: the forward run holds fill:'forwards', so a FINISHED one goes on painting the hover state, and as the later animation in the cascade it wins over the revert underneath — the element stayed at full hover colour and then snapped at the end. On re-enter a finished run is deliberately left alone, because there it is the thing holding the element in place. */
            elements.forEach((targetEl, i) => {
              const prev = activeAnims[i];
              if (prev) cancelTracked(targetEl, [prev]);
            });

            activeAnims = elements.map((targetEl, i) => {
              try {
                // No delay on the way out: a delay on the way in is deliberate pacing, the same delay on the way out just leaves the element looking stuck before it snaps back.
                const anim = track(
                  targetEl,
                  targetEl.animate(reversed, {
                    ...options,
                    delay: 0,
                    fill: 'forwards',
                  }),
                );
                const total = Number(options.duration) || 0;
                if (total && progress[i] < 1) {
                  try {
                    anim.currentTime = (1 - progress[i]) * total;
                  } catch {
                    /* ignore */
                  }
                }
                return anim;
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

      const start = resolveScrollPosition(devSt.start, devSt.customStart) || 'top center';
      const end = resolveScrollPosition(devSt.end, devSt.customEnd) || 'bottom top';
      const once = devSt.once !== false; // default true

      // A scroll trigger may name its own element — "start when THAT enters view, animate THIS". Left blank, the animated element is its own trigger, which is the default a user gets and the behaviour they expect. A named trigger that matches nothing falls back the same way rather than never firing.
      const scrollTriggerEls = devSt.trigger
        ? queryElements(devSt.trigger, contextDoc)
        : [];
      const scrollRootFor = (el) =>
        scrollTriggerEls.length > 0 ? scrollTriggerEls[0] : el;

      /* customScrub is NOT part of this decision. It is the value the Scrub control falls back on when it is set to 'custom', and it carries a default of 0.5 so the field is never blank — so treating a non-zero customScrub as "the user wants scrubbing" made isScrub true on every free preset ever built.

         Every scroll animation therefore took the scrub path: created paused and seeked by scroll position, so it froze wherever the page happened to sit instead of playing. A looping preset showed it worst — an infinite loop that never ran a frame. */
      const rawScrub = devSt.scrub;
      const isScrub =
        rawScrub === true ||
        rawScrub === 'true' ||
        rawScrub === 'custom' ||
        (typeof rawScrub === 'number' && rawScrub > 0);

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

  // 5. Drop this engine's element marks last, so anything above that looks an element up by them still finds it.
  untagTargets();
}
