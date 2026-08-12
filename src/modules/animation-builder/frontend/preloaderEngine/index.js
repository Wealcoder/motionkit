import { readConfig, COVER_ID, COVER_CLASS } from "./config.js";
import { shouldRun, markShown } from "./gate.js";
import {
  ensureCover,
  buildChrome,
  setReadout,
  lockScroll,
  teardown,
  uncoverPage,
} from "./dom.js";
import { trackProgress } from "./progress.js";
import { buildPreset } from "./presets/index.js";
import { buildCustom, playIntro } from "./custom.js";
import { playReveal } from "./reveal.js";

// Preloader engine — orchestration.
//
// Design rule that governs every branch below: **a preloader must fail open.** A broken
// page transition means a normal navigation; a broken preloader means a site nobody can
// see. So every stage is wrapped, every catch reveals rather than bails, and there are
// three independent ways out:
//
//   1. the CSS failsafe in dom.js (fires with no JS at all)
//   2. the maxDuration ceiling inside trackProgress
//   3. the absolute watchdog armed here
//
// Any one of them is enough to uncover the page.

let started = false;

/** Drop a PHP-printed cover we've decided not to use. Must not throw. */
function dropCover() {
  try {
    const existing = document.getElementById(COVER_ID);
    if (existing && existing.parentNode) {
      existing.parentNode.removeChild(existing);
    }
    document.documentElement.classList.remove(COVER_CLASS);
  } catch (e) {
    /* nothing else to try */
  }
}

export function runPreloader() {
  if (started) return;
  started = true;

  let cfg = null;
  try {
    cfg = readConfig();
  } catch (e) {
    return dropCover();
  }

  // Disabled, or not configured — make sure any cover PHP printed goes away.
  if (!cfg) return dropCover();

  // showOn already satisfied, or this load is a page-transition arrival (that runtime
  // already owns a full-screen overlay and is about to play its enter animation).
  try {
    if (!shouldRun(cfg)) return dropCover();
    markShown(cfg);
  } catch (e) {
    return dropCover();
  }

  let root = null;
  let cancelProgress = null;
  let revealed = false;

  const finish = () => {
    if (revealed) return;
    revealed = true;
    try {
      if (cancelProgress) cancelProgress();
    } catch (e) {
      /* ignore */
    }
    try {
      teardown(root);
    } catch (e) {
      dropCover();
    }
  };

  try {
    root = ensureCover(cfg);
    if (cfg.shared.lockScroll) lockScroll();

    const chrome = buildChrome(root, cfg);
    const ctx = { visual: chrome.visual, content: chrome.content, root };

    const visual =
      cfg.mode === "custom"
        ? buildCustom(ctx, cfg.preset)
        : buildPreset(cfg.presetKey, ctx, cfg.preset);

    if (cfg.mode === "custom") playIntro(chrome.content, cfg.preset);

    const startReveal = () => {
      const run = visual.revealOverride
        ? (done) => visual.revealOverride(root, cfg.reveal, done)
        : (done) => playReveal(root, cfg.reveal, done);

      const go = () => {
        // Reveal the page BEFORE animating the cover away — otherwise the cover parts to
        // show the bare html background and the real content snaps in a frame later.
        try {
          uncoverPage();
        } catch (e) {
          /* non-fatal — the CSS failsafe still covers this */
        }
        try {
          run(finish);
        } catch (e) {
          finish();
        }
      };

      if (cfg.reveal.delay > 0) setTimeout(go, cfg.reveal.delay * 1000);
      else go();
    };

    cancelProgress = trackProgress({
      completeOn: cfg.shared.completeOn,
      minDuration: cfg.shared.minDuration,
      maxDuration: cfg.shared.maxDuration,
      onTick: (p) => {
        setReadout(chrome.readout, p);
        if (visual.tick) visual.tick(p);
      },
      onComplete: startReveal,
    });

    // Absolute watchdog. trackProgress already caps at maxDuration, but a reveal that
    // never settles would still leave the cover up — this is the last line of defence
    // before the CSS failsafe.
    setTimeout(
      finish,
      (cfg.shared.maxDuration + cfg.reveal.delay + cfg.reveal.duration) * 1000 +
        600,
    );
  } catch (e) {
    finish();
  }
}
