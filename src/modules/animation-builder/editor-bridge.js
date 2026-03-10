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

/**
 * Allowed editor origins that can communicate with this bridge.
 * In production only editor.motionkit.io is allowed.
 * In development localhost origins are also permitted.
 */
const ALLOWED_ORIGINS = [
  "https://editor.motionkit.io",
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:3000",
  '*'
];

/**
 * Validate that a message event comes from an allowed editor origin.
 */
function isAllowedOrigin(origin) {
  return ALLOWED_ORIGINS.some((allowed) => origin === allowed);
}

/**
 * Get the validated parent origin for sending messages back.
 * Falls back to the referrer or first allowed origin.
 */
function getParentOrigin() {
  try {
    if (document.referrer) {
      const url = new URL(document.referrer);
      const origin = url.origin;
      if (isAllowedOrigin(origin)) return origin;
    }
  } catch (e) {
    // ignore invalid referrer
  }
  return ALLOWED_ORIGINS[0];
}

/**
 * Build a full REST API URL that works with both pretty and plain permalinks.
 *
 * Pretty:  https://site.com/wp-json/motionkit/v1/  + "configs"  → .../configs
 * Plain:   https://site.com/?rest_route=/motionkit/v1/  + "configs"  → ...&rest_route=.../configs
 *
 * WordPress rest_url() already handles the base, but simple string concat
 * breaks when the base contains a query string (?rest_route=).
 */
function restUrl(endpoint) {
  const base = wcfanimb.rest_url || "";
  // Plain permalinks: rest_url contains "?rest_route="
  if (base.includes("?")) {
    // base is e.g. "https://site.com/?rest_route=/motionkit/v1/"
    // We need to append the endpoint to the rest_route value
    return base + endpoint;
  }
  // Pretty permalinks: just concat
  console.log('6 REST URL (pretty permalinks):', base + endpoint);
  return base + endpoint;
}

/**
 * Extract the mk_token (JWT) from the current page URL.
 * The editor loads the iframe with ?action=motionkit-editor&mk_token=<jwt>
 */
function getMkToken() {
  try {
    const params = new URLSearchParams(window.location.search);
    return params.get("mk_token") || "";
  } catch (e) {
    return "";
  }
}

/**
 * Build auth headers for REST API calls.
 * Uses JWT Bearer token if mk_token exists (cross-origin editor session),
 * otherwise falls back to WP nonce (same-origin admin session).
 */
function getAuthHeaders() {
  const headers = { "Content-Type": "application/json" };
  const token = getMkToken();

  if (token) {
    headers["Authorization"] = "Bearer " + token;
  } else if (wcfanimb.rest_nonce) {
    headers["X-WP-Nonce"] = wcfanimb.rest_nonce;
  }

  return headers;
}

let storeAnimation = {};
let parentOrigin = null;

function receivePageConfig() {
  parentOrigin = getParentOrigin();

  window.addEventListener(
    "message",
    (event) => {
      // Debug: log all incoming messages
      console.log('[bridge] message from:', event.origin, 'type:', event.data?.type);

      // Validate origin — reject messages from unknown sources
      if (!isAllowedOrigin(event.origin)) {
        console.warn('[bridge] rejected origin:', event.origin);
        return;
      }

      // Lock to the first valid origin we receive from
      if (!parentOrigin) {
        parentOrigin = event.origin;
      }

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
        console.log('Received settings from editor:', { globalSettings, currentPageSettings });
        // Save global settings via REST API
        if (globalSettings) {
          fetch(restUrl("global-settings"), {
            method: "POST",
            headers: getAuthHeaders(),
            body: JSON.stringify({ animationConfigs: globalSettings }),
          })
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
              if (res.success) {
                wcfanimb.global_settings = globalSettings;
              }
            })
            .catch((err) => console.error("MotionKit: global settings save failed", err));
        }

        // Save current page settings via REST API
        if (currentPageSettings) {
          console.log('888 Saving current page settings via REST API:', {
            pageTypeConfigs: wcfanimb.pageTypeConfigs,
            animationConfigs: currentPageSettings,
          });
          fetch(restUrl("configs"), {
            method: "POST",
            headers: getAuthHeaders(),
            body: JSON.stringify({
              pageTypeConfigs: wcfanimb.pageTypeConfigs,
              animationConfigs: currentPageSettings,
            }),
          })
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
            base_domain: wcfanimb.base_domain,
            rest_url: wcfanimb.rest_url,
            mk_token: getMkToken(),
          },
        }, parentOrigin);

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
            base_domain: wcfanimb.base_domain,
            rest_url: wcfanimb.rest_url,
            mk_token: getMkToken(),
          },
        }, parentOrigin);

      }
    },
    false
  );

  // Notify parent (SaaS editor) that the iframe is ready
  setTimeout(() => {
    window.parent.postMessage({
      type: "motionkit-ready",
      data: {
        platform: wcfanimb.platform,
        base_domain: wcfanimb.base_domain,
        rest_url: wcfanimb.rest_url,
        mk_token: getMkToken(),
      },
    }, parentOrigin);
  }, 1000);
}

// Initialize on page load
window.addEventListener("load", () => {
  receivePageConfig();
});
