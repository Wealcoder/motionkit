/**
 * Element-exclusive playback ownership for the WAAPI engine.
 *
 * One element can be the target of several free animations with different triggers — a page-load
 * entrance, a scroll reveal and a click, all on the same heading. Only one may be applied at a
 * time. Without this the Web Animations cascade decides by creation order alone, so the LAST
 * animation constructed paints whatever it happens to hold: a scroll record built after a
 * page-load one pinned the element back to opacity 0 the instant the entrance finished, and after
 * a click three animations painted the same element at once.
 */

/* The state lives on `window.__motionkitOwnership`, the same key and the same shape the GSAP
   engine's shared/elementOwnership.js uses in motionkit-editor. That is deliberate: a WordPress
   page can carry both plugins, so one element may hold a free animation and a pro one, and a
   private registry per engine could only ever arbitrate half the page. Whichever bundle loads
   first creates the store; the other finds it and joins in.

   The two engines agree on the data and disagree on the undo, which is exactly what `resetByAnim`
   is for — the GSAP side restores its `__wcfOrigCss` snapshot, this side cancels the Animation
   objects it started. Neither needs to know how the other does it. */
const KEY = '__motionkitOwnership';

function store() {
  const host = typeof window !== 'undefined' ? window : globalThis;
  if (!host[KEY]) {
    host[KEY] = {
      // element -> owning animation id. Weak so a detached node is collected rather than pinned by the registry.
      ownerByEl: new WeakMap(),
      // animId -> Set<element>, so teardown can release exactly what it still owns.
      elsByAnim: new Map(),
      // animId -> the animations it built, so a later owner can pause them.
      animsByAnim: new Map(),
      // animId -> how that animation undoes itself when displaced.
      resetByAnim: new Map(),
    };
  }
  return host[KEY];
}

// Registers the live array an animation pushes its Animation objects into, so a later owner can pause them. The ARRAY is held by reference rather than copied — a gesture animation is created on every click, long after this is called, and a snapshot taken here would never see it.
export function setAnims(animId, anims) {
  if (!animId) return;
  store().animsByAnim.set(animId, anims || []);
}

// Registers how `animId` puts its elements back when something displaces it. Called with the elements that were taken from it, never with the whole set — another record may still be using the rest.
export function setReset(animId, fn) {
  if (!animId || typeof fn !== 'function') return;
  store().resetByAnim.set(animId, fn);
}

function trackEl(state, animId, el) {
  let set = state.elsByAnim.get(animId);
  if (!set) {
    set = new Set();
    state.elsByAnim.set(animId, set);
  }
  set.add(el);
}

/**
 * Claims `els` for `animId`, displacing whoever owned them.
 *
 * @returns {boolean} true when at least one element changed hands
 */
// Called when a trigger FIRES, never when one is merely built — "last trigger wins" is the rule, and claiming at build time made a scroll record displace a page-load one milliseconds after the page loaded, before the visitor had scrolled anywhere near it.
export function claimTargets(els, animId) {
  if (!animId || !els || !els.length) return false;
  const state = store();
  const displaced = new Map();

  els.forEach((el) => {
    if (!el) return;
    const prev = state.ownerByEl.get(el);
    if (prev && prev !== animId) {
      if (!displaced.has(prev)) displaced.set(prev, []);
      displaced.get(prev).push(el);
    }
    state.ownerByEl.set(el, animId);
    trackEl(state, animId, el);
    // Every claimed element is re-stamped, not only the displaced ones. The attribute is single-valued and means "the animation currently applied here", so the editor's inspector points at the one actually playing rather than whichever record was dispatched last.
    el.setAttribute?.('data-motionkit-anim-id', animId);
  });

  if (!displaced.size) return false;

  displaced.forEach((takenEls, prevId) => {
    (state.animsByAnim.get(prevId) || []).forEach((a) => {
      try {
        a.pause?.();
      } catch {
        /* a GSAP live-flip wrapper has no pause */
      }
    });

    const reset = state.resetByAnim.get(prevId);
    if (reset) {
      try {
        reset(takenEls);
      } catch (err) {
        console.warn('[motionkit:waapi] ownership reset error:', err);
      }
    }
  });

  return true;
}

// Takes ownership only where nobody owns yet, and never displaces anyone. A page-load animation has no trigger to be "last" with, and several page-load animations legitimately share an element — making each claim outright meant the last one built silently reset every earlier one, which reads as "the animations stopped loading". Registering without displacing still gives a later scroll or click someone to displace, which is the whole reason a triggerless animation takes part.
export function claimIfUnowned(els, animId) {
  if (!animId || !els || !els.length) return;
  const state = store();
  els.forEach((el) => {
    if (!el || state.ownerByEl.get(el)) return;
    state.ownerByEl.set(el, animId);
    trackEl(state, animId, el);
    el.setAttribute?.('data-motionkit-anim-id', animId);
  });
}

// Who currently has `el`, or undefined. Read before pinning a scroll animation's opening keyframe: a pending reveal must not paint its start state over an animation that has already run.
export function ownerOf(el) {
  if (!el) return undefined;
  return store().ownerByEl.get(el);
}

// Relinquishes a torn-down animation so a later owner starts clean. Only clears what this animId still owns — a newer owner may already have taken the rest. Never clears the whole registry: on a page carrying both plugins that would drop the GSAP engine's claims along with ours.
export function releaseAnim(animId) {
  if (!animId) return;
  const state = store();
  const set = state.elsByAnim.get(animId);
  if (set) {
    set.forEach((el) => {
      if (state.ownerByEl.get(el) === animId) state.ownerByEl.delete(el);
    });
    state.elsByAnim.delete(animId);
  }
  state.animsByAnim.delete(animId);
  state.resetByAnim.delete(animId);
}
