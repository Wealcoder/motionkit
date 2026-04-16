"use strict";

import FreeAnimationEventHelperClass from "./lib/FreeAnimation/previewEventHelper";
window.WCFFreeAnimBuilder = null;
WCFFreeAnimBuilder = new FreeAnimationEventHelperClass();

(function () {
  var parentOrigin = null;

  var platform =
    document.querySelector('meta[name="motionkit-platform"]')?.content ||
    "html";

  var DEVICE_SENSITIVE_SETTINGS = [
    "scrollSmother",
    "preloader",
    "pageTransition",
  ];

  function flattenSettingsForDevice(all_settings, deviceKey) {
    var out = Object.assign({}, all_settings || {});
    for (var i = 0; i < DEVICE_SENSITIVE_SETTINGS.length; i++) {
      var key = DEVICE_SENSITIVE_SETTINGS[i];
      var node = out[key];
      if (node && typeof node === "object" && node[deviceKey]) {
        out[key] = Object.assign({}, node, node[deviceKey]);
      }
    }
    return out;
  }

  function groupByPreset(animations) {
    var groups = {};
    for (var i = 0; i < (animations || []).length; i++) {
      var section = animations[i];
      if (!section || !section.enable) continue;
      var bucket = section.type === "custom" ? "custom" : section.preset;
      if (!bucket) continue;
      (groups[bucket] = groups[bucket] || []).push(section);
    }
    return groups;
  }

  function matchMediaOnce(mediaQuery, callback) {
    try {
      var mq = window.matchMedia(mediaQuery);
      if (mq && mq.matches) callback();
    } catch (e) {
      /* invalid media query */
    }
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

  // Build a per-device animation object. Handles BOTH shapes:
  //
  //  Preset / free animation (animation-level devices):
  //    { id, preset, devices: { desktop: {animationDelay,...}, laptop: {...}, ... } }
  //
  //  Custom animation (timeline-level + step-level devices):
  //    { id, group: "custom_animation", timelines: [
  //        { id, devices: {desktop: {repeat, paused}, ...},
  //          animations: [
  //            { id, method, devices: {desktop: {...}, laptop: {...}} },
  //            ...
  //          ]
  //        }, ... ] }
  //
  // In both cases, after flattening, the devices bag is removed at every
  // level and per-device overrides for deviceKey are promoted onto each node.
  // True if animation's responsive[deviceKey] flag is NOT explicitly false.
  // Missing responsive object or missing key defaults to enabled (backwards-
  // compatible with older payloads that don't set it).
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

  function buildAnimationsForDevice(all_animations, deviceKey) {
    return (
      (all_animations || [])
        // Drop unpublished/disabled animations and ones off for this device.
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
              if (Array.isArray(tl.animations)) {
                // Filter inner steps by responsive flag + active flag.
                flatTl.animations = tl.animations
                  .filter(function (step) {
                    return (
                      isActive(step) && isResponsiveEnabled(step, deviceKey)
                    );
                  })
                  .map(function (step) {
                    return flattenDeviceBag(step, deviceKey);
                  });
              }
              return flatTl;
            });
            delete outCustom.devices;
            return outCustom;
          }

          // Preset / free animation — flatten the root devices bag.
          return flattenDeviceBag(a, deviceKey);
        })
    );
  }

  function resolveAndDispatch(all_animations, all_settings) {
    var devices = Object.values(
      (all_settings && all_settings.deviceConfig) || {},
    );

    var currentDevice = detectCurrentDevice(devices);
    var animationsForDevice = buildAnimationsForDevice(
      all_animations,
      currentDevice.key,
    );

    console.log({ animationsForDevice });

    // loop animationsForDevice and log each one's id and preset/type
    animationsForDevice.forEach(function (anim) {
      if (anim.group === "free_preset_animation") {
        document.dispatchEvent(
          new CustomEvent("aae-animation-event", {
            detail: anim,
            bubbles: true,
            cancelable: true,
          }),
        );
      }

      if (anim.group === "custom_animation") {
        //console.log('Custom animation:', anim.id);
      }

      if (anim.group === "premium_preset_animation") {
        //console.log('Premium preset animation:', anim.id);
      }
    });

    // GSAP-driven path (preset, custom)
    // if (window.gsap && devices.length) {
    //   activeMatchMedia = window.gsap.matchMedia();
    //   devices.forEach(function (device) {
    //     if (!device || !device.mediaQuery) return;
    //     activeMatchMedia.add(device.mediaQuery, function () {
    //       var settings = flattenSettingsForDevice(all_settings, device.key);
    //       var grouped = groupByPreset(all_animations);
    //       document.dispatchEvent(new CustomEvent('aae-animation-event', {
    //         detail: Object.assign({}, grouped, {
    //           animations: (all_animations || []).filter(function (a) { return a && a.enable; }),
    //           settings: settings,
    //           device: device.key,
    //         }),
    //         bubbles: true,
    //         cancelable: true,
    //       }));
    //     });
    //   });
    // }
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
