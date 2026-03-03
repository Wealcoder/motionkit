/**
 * MotionKit Editor Bridge
 *
 * PostMessage bridge between the SaaS editor (motionkit.io) and the WordPress site.
 * Loaded only when ?action=motionkit-editor is present.
 *
 * Receives animation configs from the parent editor iframe,
 * processes them through gsap.matchMedia / CSS matchMedia,
 * and dispatches CustomEvents for preset scripts to consume.
 */

import { handleMediaQuery } from "@/lib/utils";

// WCFFreeAnimBuilder is already initialized by frontend.js (loaded as dependency)

let storeAnimation = {};

function receivePageConfig() {
  window.addEventListener(
    "message",
    (event) => {
      // Receive animation config from SaaS editor
      if ("wcf-animation-config" in event.data) {
        storeAnimation = {};
        let mm;

        // GSAP-based animations (preset, custom)
        if (window.gsap) {
          mm?.revert();
          mm = gsap.matchMedia();
          wcfanimb?.device_config?.map((device) => {
            mm.add(device.mediaQuery, () => {
              event.data["wcf-animation-config"]?.[device?.key]?.forEach(
                (section) => {
                  if (section.enable) {
                    if (section.type === "preset") {
                      storeAnimation[section?.preset] = [
                        ...(storeAnimation[section?.preset] || []),
                        section,
                      ];
                    } else if (section.type === "custom") {
                      storeAnimation["custom"] = [
                        ...(storeAnimation["custom"] || []),
                        section,
                      ];
                    }
                  }
                }
              );
            });
          });
        }

        // CSS-based free animations (no GSAP dependency)
        wcfanimb?.device_config?.map((device) => {
          handleMediaQuery(device.mediaQuery, () => {
            event.data["wcf-animation-config"]?.[device?.key]?.forEach(
              (section) => {
                if (section.enable && section.type === "free_animation") {
                  storeAnimation[section?.preset] = [
                    ...(storeAnimation[section?.preset] || []),
                    section,
                  ];
                }
              }
            );
          });
        });

        // Dispatch to preset scripts
        document.dispatchEvent(
          new CustomEvent("aae-animation-event", {
            detail: storeAnimation,
            bubbles: true,
            cancelable: true,
          })
        );
      }

      // Reset animations
      if ("wcf-animation-config-reset" in event.data) {
        document.dispatchEvent(
          new CustomEvent("aae-reset-animation", {
            detail: "",
            bubbles: true,
            cancelable: true,
          })
        );
      }
    },
    false
  );

  // Notify parent (SaaS editor) that the iframe is ready
  setTimeout(() => {
    window.parent.postMessage(wcfanimb);
  }, 1000);
}

// Initialize on page load
window.addEventListener("load", () => {
  receivePageConfig();
});
