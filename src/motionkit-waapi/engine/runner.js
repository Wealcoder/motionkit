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
import {
  splitText,
  revertSplit,
  isSplitKind,
  splitKindOf,
} from './splitText.js';

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

  /* A clip-path opening state is never held. The reason was the IntersectionObserver this engine no longer uses: an element clipped to nothing was removed from its geometry — verified in Chromium, where a clip-path-held element reported isIntersecting false forever — so holding it hid the element from the very observer that existed to reveal it. The scroll trigger now measures a rect, which a clipped element still has, so the hazard is gone and this exception is worth revisiting; until then a wipe is simply unheld and shows its natural state until it enters view.

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
    // Which animated parts came out of which matched element. A gesture on one heading has to animate that heading's characters, not every character the selector produced.
    const partsOf = new Map(matched.map((el) => [el, [el]]));
    const wantedSplit = isSplitKind(effect.splitText) ? effect.splitText : null;
    const parts = [];

    matched.forEach((el) => {
      /* A run is not always the first one on this element: the editor re-dispatches the whole page on every field edit, and teardown does not necessarily come first. Only a split of the SAME kind can be reused — `splitText` returns the parts it finds when the element is already split, so without putting the old one back, changing Characters to Words kept the characters and turning splitting off left the spans in the markup until something else tore the engine down. */
      const currentSplit = splitKindOf(el);
      if (currentSplit && currentSplit !== wantedSplit) {
        revertSplit(el);
        splitElements.delete(el);
      }

      if (!wantedSplit) return;

      const made = splitText(el, wantedSplit);
      if (made.length > 0) {
        splitElements.add(el);
        partsOf.set(el, made);
        parts.push(...made);
      }
    });

    if (parts.length > 0) elements = parts;

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

    /* What one trigger surface drives. An element that triggers ITSELF drives only its own parts: with several headings on one class, hovering the first animated all of them, and with split text it animated every character of every heading at once. A separate trigger selector — hover the button, animate the heading — is a different relationship and drives the whole set, which is the reason to name one. */
    const targetsFor = (triggerEl) => partsOf.get(triggerEl) ?? elements;

    // Trigger Execution
    if (triggerType === 'page_load') {
      elements.forEach((el, index) => {
        playWaapiAnimation(el, keyframes, options, index * staggerMs);
      });
    } else if (triggerType === 'hover') {
      finalTriggerElements.forEach((triggerEl) => {
        const targets = targetsFor(triggerEl);
        let activeAnims = [];

        /* A free preset is an ENTRANCE: it brings an element in. Playing it backwards therefore lands on its opening keyframe — opacity 0 for a fade — so the element disappeared the moment the pointer left. It plays forwards only, and the state it finishes in is the state that stays.

           Only a still-running batch is cancelled, so re-hovering mid-animation restarts cleanly while a completed one keeps its fill. */
        const onEnter = () => {
          targets.forEach((targetEl, i) => {
            const prev = activeAnims[i];
            // A run being reverted is resumed below, not cancelled — only a forward one still in flight is replaced.
            if (
              prev &&
              prev.playState === 'running' &&
              !(prev.playbackRate < 0)
            ) {
              cancelTracked(targetEl, [prev]);
            }
          });
          // Through playWaapiAnimation, like page load and scroll: it is what applies the stagger and what honours prefers-reduced-motion. Animating directly here meant a split heading played every character at once — which is the whole of what splitting is for — and reduced motion was ignored on the two triggers a visitor sets off by hand.
          // The compiled `fill` is kept rather than forced to 'forwards'. With a stagger the two differ: 'forwards' leaves a character painted normally through its delay and then snaps it to the opening keyframe when its turn comes, so a split entrance flickered its way across the line. 'both' holds the opening state from the start, which is also what lets a reverted run hold where it lands.
          activeAnims = targets.map((targetEl, i) => {
            const prev = activeAnims[i];
            // Mid-revert: turn the run around instead of replacing it, so a pointer that comes back finds the element where it actually is rather than back at the opening keyframe.
            if (prev && prev.playbackRate < 0 && prev.playState !== 'idle') {
              try {
                prev.reverse();
                return prev;
              } catch {
                /* Not reversible — fall through and start a fresh run. */
              }
            }
            return playWaapiAnimation(targetEl, keyframes, options, i * staggerMs);
          });
        };

        triggerEl.addEventListener('mouseenter', onEnter);

        /* A hover STYLE preset is the opposite of an entrance: it recolours or respaces an element that is already there, so the change has to come back when the pointer leaves. That is the only case where playing backwards is right, and the record opts into it explicitly — an entrance carries no flag and keeps holding its end state.

           The return trip is the same keyframes reversed rather than Animation.reverse(), so it works whether or not the forward run ever finished. */
        if (reverseOnLeave) {
          /* Reversed by the browser rather than rebuilt from reversed keyframes, because the position has to be mirrored in PROGRESS, not in time. Rebuilding applied the same easing to the way back, so a power2.out entrance — which is already 97% of the way there a third of the way through — handed the revert a mirrored time of 0.5 and the ease turned that back into 97% reverted: the element snapped home instead of easing back, and the harder the ease the worse it read.

             Animation.reverse() keeps the effect's own position and plays its curve out backwards from exactly where it stopped, which is what picking up where the entrance left off actually means, and it needs no inverse of the easing function to do it. It is also right for a run that already finished, which is the ordinary case: the pointer usually leaves after the entrance is over. */
          const onLeave = () => {
            targets.forEach((targetEl, i) => {
              const prev = activeAnims[i];
              if (!prev || prev.playState === 'idle') return;
              // Already on its way back — a second mouseleave must not turn it forwards again.
              if (prev.playbackRate < 0) return;
              try {
                prev.reverse();
              } catch {
                /* No active timeline to reverse against; the element is where it started. */
              }
            });
          };

          triggerEl.addEventListener('mouseleave', onLeave);
          listenerCleanups.push(() =>
            triggerEl.removeEventListener('mouseleave', onLeave),
          );
        }

        listenerCleanups.push(() => {
          targets.forEach((targetEl, i) =>
            cancelTracked(targetEl, [activeAnims[i]]),
          );
          triggerEl.removeEventListener('mouseenter', onEnter);
        });
      });
    } else if (triggerType === 'click') {
      finalTriggerElements.forEach((triggerEl) => {
        const targets = targetsFor(triggerEl);
        let activeAnims = [];

        // No toggle: the second click replayed the entrance backwards and hid the element. Every click plays it forwards, so the animation can be re-run as often as the user likes and the element stays where it landed.
        const onClick = () => {
          targets.forEach((targetEl, i) => {
            const prev = activeAnims[i];
            if (prev && prev.playState === 'running') {
              cancelTracked(targetEl, [prev]);
            }
          });
          // Same reasons as hover: the stagger a split heading needs, reduced motion, and the compiled fill that keeps a staggered character hidden through its delay instead of flashing.
          activeAnims = targets.map((targetEl, i) =>
            playWaapiAnimation(targetEl, keyframes, options, i * staggerMs),
          );
        };

        triggerEl.addEventListener('click', onClick);
        listenerCleanups.push(() => {
          targets.forEach((targetEl, i) =>
            cancelTracked(targetEl, [activeAnims[i]]),
          );
          triggerEl.removeEventListener('click', onClick);
        });
      });
    } else {
      // Default: 'on_scroll' — the element is measured against its start line, or scrubbed between start and end.
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
        // Standard viewport trigger: fire once the element reaches its start line.
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
            end,
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
