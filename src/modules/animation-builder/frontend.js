"use strict";

import FreeAnimationEventHelperClass from "./lib/FreeAnimation/previewEventHelper";
window.WCFFreeAnimBuilder = null;
WCFFreeAnimBuilder = new FreeAnimationEventHelperClass();

(function () {
  var parentOrigin = null;

  var platform =
    document.querySelector('meta[name="motionkit-platform"]')?.content ||
    "html";

  // GSAP plugin keys we can detect by property presence on a tween `vars`
  // object. Mirrors the keys in editor globalSettings.gsapPlugin (minus `flip`,
  // which isn't expressed as a tween var in custom animations today).
  var GSAP_PLUGIN_VAR_KEYS = new Set([
    "scrollTo",
    "motionPath",
    "drawSVG",
    "morphSVG",
    "splitText",
    "physics2D",
    "physicsProps",
    "scrambleText",
  ]);

  // Skip GSAP/ScrollTrigger runtime back-references so we don't walk into the
  // tween's `parent`, the ScrollTrigger instance, or the DOM scroller — which
  // is how a native `window.scrollTo` was previously matching this scan.
  var GSAP_INTERNAL_KEYS = new Set([
    "parent",
    "scrollTrigger",
    "scroller",
    "targets",
    "callbackScope",
    "onComplete",
    "onStart",
    "onUpdate",
    "onRepeat",
    "onReverseComplete",
  ]);

  var deepClone =
    typeof structuredClone === "function"
      ? structuredClone
      : function (v) {
          return JSON.parse(JSON.stringify(v));
        };

  function isPlainObject(v) {
    if (!v || typeof v !== "object") return false;
    var proto = Object.getPrototypeOf(v);
    return proto === Object.prototype || proto === null;
  }

  // Return the deviceConfig entry whose mediaQuery currently matches.
  // Falls back to the first device or a synthetic 'desktop' entry so
  // callers always get *something* to work with.
  function detectCurrentDevice(devices) {
    for (var i = 0; i < (devices || []).length; i++) {
      var d = devices[i];
      if (!d || !d.mediaQuery) continue;
      try {
        if (window.matchMedia(d.mediaQuery).matches) return d;
      } catch (e) {
        /* invalid mq */
      }
    }
    return (devices && devices[0]) || { key: "desktop" };
  }

  // Pull devices[deviceKey] off a node and place it under a vars prop
  // on a shallow clone. Original root fields are preserved; devices bag
  // is removed. If no per-device override exists, vars = {}.
  function flattenDeviceBag(node, deviceKey) {
    if (!node || typeof node !== "object") return node;
    var perDevice = node.devices && node.devices[deviceKey];
    var out = Object.assign({}, node);
    out.vars =
      perDevice && typeof perDevice === "object"
        ? Object.assign({}, perDevice)
        : {};
    delete out.devices;
    return out;
  }

  function isResponsiveEnabled(node, deviceKey) {
    if (!node || typeof node !== "object") return true;
    var r = node.responsive;
    if (!r || typeof r !== "object") return true;
    return r[deviceKey] !== false;
  }

  // True if the node is published. Missing isPublished defaults to true
  // so payloads that never set the flag still run.
  function isActive(node) {
    if (!node || typeof node !== "object") return true;
    return node.isPublished !== false;
  }

  // Single recursive pass: detects plugin usage and recurses into nested
  // method bags (vars.from / vars.to / vars.fromTo) in the same key loop.
  // Depth cap protects against pathological / cyclic input.
  function collectPlugins(node, found, depth) {
    if (!isPlainObject(node) || depth > 4) return;
    var keys = Object.keys(node);
    for (var i = 0; i < keys.length; i++) {
      var k = keys[i];
      if (GSAP_INTERNAL_KEYS.has(k)) continue;
      var v = node[k];
      // Plugin values are strings/numbers/plain config objects — never
      // functions or DOM nodes (those are GSAP-injected references).
      if (
        GSAP_PLUGIN_VAR_KEYS.has(k) &&
        v &&
        typeof v !== "function" &&
        !(v instanceof Element)
      ) {
        found[k] = true;
      }
      if (isPlainObject(v)) collectPlugins(v, found, depth + 1);
    }
  }

  // Walk all_animations once: filter by published/responsive, flatten the
  // per-device vars bag, and collect active GSAP plugins inline. Returns
  // { animations, activePlugins } so callers don't re-walk the tree.
  function buildAnimationsForDevice(all_animations, deviceKey) {
    var activePlugins = {};
    var animations = (all_animations || [])
      .filter(function (a) {
        return isActive(a) && isResponsiveEnabled(a, deviceKey);
      })
      .map(function (a) {
        if (!a || typeof a !== "object") return a;

        // Custom animation branch — recurse into timelines + inner animations.
        if (Array.isArray(a.timelines)) {
          var outCustom = Object.assign({}, a);
          outCustom.timelines = a.timelines.map(function (tl) {
            if (!tl || typeof tl !== "object") return tl;
            var flatTl = flattenDeviceBag(tl, deviceKey);
            collectPlugins(flatTl.vars, activePlugins, 0);
            if (Array.isArray(tl.animations)) {
              flatTl.animations = tl.animations
                .filter(function (step) {
                  return isActive(step) && isResponsiveEnabled(step, deviceKey);
                })
                .map(function (step) {
                  var flatStep = flattenDeviceBag(step, deviceKey);
                  collectPlugins(flatStep.vars, activePlugins, 0);
                  return flatStep;
                });
            }
            return flatTl;
          });
          delete outCustom.devices;
          return outCustom;
        }

        // Preset / free animation — flatten the root devices bag.
        var flat = flattenDeviceBag(a, deviceKey);
        collectPlugins(flat.vars, activePlugins, 0);
        return flat;
      });

    return { animations: animations, activePlugins: activePlugins };
  }

  function resolveAndDispatch(all_animations, all_settings) {
    var devices = Object.values(
      (all_settings && all_settings.deviceConfig) || {},
    );

    console.log("Resolve And Dispatch", { all_animations });

    var currentDevice = detectCurrentDevice(devices);
    var built = buildAnimationsForDevice(all_animations, currentDevice.key);
    // Broadcast active plugins BEFORE per-animation dispatch — consumers may
    // need to load plugin scripts before the tweens run, and once GSAP runs
    // it mutates step.vars by adding `parent`, `scrollTrigger`, and DOM
    // back-refs which would pollute a post-dispatch scan.
    document.dispatchEvent(
      new CustomEvent("mk-animation-active-plugins", {
        detail: built.activePlugins,
        bubbles: true,
        cancelable: true,
      }),
    );

    // Deep-clone each anim before dispatch — GSAP mutates the vars object you
    // pass to it (adds `duration`, `ease`, `parent`, etc.). Without this, those
    // GSAP-injected props leak back into wcfanimb.all_animations.
    for (var i = 0; i < built.animations.length; i++) {
      document.dispatchEvent(
        new CustomEvent("aae-animation-event", {
          detail: deepClone(built.animations[i]),
          bubbles: true,
          cancelable: true,
        }),
      );
    }
  }

  // Notify parent that bridge is ready
  // Use same-origin since iframe is served via proxy-snapshot (same origin as editor)
  function sendReady() {
    window.parent.postMessage(
      {
        type: "motionkit-ready",
        data: {
          platform: platform,
          base_domain: window.location.origin,
        },
      },
      window.location.origin,
    );
  }

  // Listen for messages from the editor
  window.addEventListener("message", function (event) {
    if (!parentOrigin) parentOrigin = event.origin;

    if (event.data?.type === "wcf-animation-config") {
      var payload = event.data.data || {};
      var all_animations = payload.all_animations || [];
      var all_settings = payload.all_settings || {};
      window.wcfanimb = Object.assign({}, window.wcfanimb || {}, {
        all_animations: all_animations,
        all_settings: all_settings,
      });
      resolveAndDispatch(all_animations, all_settings);
    }

    // Reset animations
    if ("wcf-animation-config-reset" in event.data) {
      document.dispatchEvent(
        new CustomEvent("aae-reset-animation", {
          detail: "",
          bubbles: true,
          cancelable: true,
        }),
      );
    }
  });

  // Send ready after a short delay to let parent set up listener
  setTimeout(sendReady, 200);

  function loadFullPreviewData() {
    if (
      !/\/api\/full-preview(\/|$|\?)/.test(
        window.location.pathname + window.location.search,
      )
    ) {
      return null;
    }
    try {
      var session = new URLSearchParams(window.location.search).get("session");
      if (!session) return null;
      var raw = localStorage.getItem("mk-preview-" + session);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }

  window.addEventListener("load", () => {
    const source = loadFullPreviewData() || window.wcfanimb || {};
    resolveAndDispatch(source.all_animations, source.all_settings);
  });
})();
