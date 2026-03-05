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

      // Receive global + current page settings from the editor
      if (event.data?.type === "motionkit-settings") {
        const { globalSettings, currentPageSettings } = event.data.data || {};
        console.log("Received global and page settings from editor", { globalSettings, currentPageSettings });
        // Save global settings via WP AJAX
        if (globalSettings) {
          const globalForm = new FormData();
          globalForm.append("action", "motionkit_builder_gl_configs_store");
          globalForm.append("wcf_nonce", wcfanimb.nonce);
          globalForm.append("animationConfigs", JSON.stringify(globalSettings));

          fetch(wcfanimb.ajaxurl, { method: "POST", body: globalForm, credentials: "include" })
            .then((r) => {
              if (!r.ok) {
                return r.text().then((txt) => {
                  console.error("MotionKit: global settings HTTP", r.status, txt);
                  return null;
                });
              }
              return r.json();
            })
            .then((res) => {
              if (!res) return;
              console.log("MotionKit: global settings response", res);
              if (res.success) {
                wcfanimb.global_settings = globalSettings;
              }
            })
            .catch((err) => console.error("MotionKit: global settings save failed", err));
        }

        // Save current page settings via WP AJAX
        if (currentPageSettings) {
          const pageForm = new FormData();
          pageForm.append("action", "motionkit_builder_pagetype_configs");
          pageForm.append("wcf_nonce", wcfanimb.nonce);
          pageForm.append("pageTypeConfigs", JSON.stringify(wcfanimb.pageTypeConfigs));
          pageForm.append("animationConfigs", JSON.stringify(currentPageSettings));

          fetch(wcfanimb.ajaxurl, { method: "POST", body: pageForm, credentials: "include" })
            .then((r) => {
              if (!r.ok) {
                return r.text().then((txt) => {
                  console.error("MotionKit: page settings HTTP", r.status, txt);
                  return null;
                });
              }
              return r.json();
            })
            .then((res) => {
              if (!res) return;
              console.log("MotionKit: page settings response", res);
              if (res.success) {
                wcfanimb.animation_config = currentPageSettings;
              }
            })
            .catch((err) => console.error("MotionKit: page settings save failed", err));
        }

        // Send updated response back to the editor
        window.parent.postMessage({
          type: "motionkit-response",
          data: {
            platform: wcfanimb.platform,
            globalSettings: globalSettings || wcfanimb.global_settings,
            pageType: wcfanimb.pageTypeConfigs,
            pageSettings: currentPageSettings || wcfanimb.animation_config,
            deviceConfig: wcfanimb.device_config,
            ajaxurl: wcfanimb.ajaxurl,
            nonce: wcfanimb.nonce,
            base_domain: wcfanimb.base_domain,
          },
        }, "*");

        document.dispatchEvent(
          new CustomEvent("motionkit-settings-update", {
            detail: { globalSettings, currentPageSettings },
            bubbles: true,
            cancelable: true,
          })
        );
      }

      // Respond to data requests from the SaaS editor
      if (event.data?.type === "motionkit-request" && event.data?.request === "get-data") {

        window.parent.postMessage({
          type: "motionkit-response",
          data: {
            platform: wcfanimb.platform,
            globalSettings: wcfanimb.global_settings,
            pageType: wcfanimb.pageTypeConfigs,
            pageSettings: wcfanimb.animation_config,
            deviceConfig: wcfanimb.device_config,
            ajaxurl: wcfanimb.ajaxurl,
            nonce: wcfanimb.nonce,
            base_domain: wcfanimb.base_domain,
          },
        }, "*");

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
