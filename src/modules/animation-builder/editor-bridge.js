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
 * Build a full REST API URL.
 * Uses plain permalink format (?rest_route=) to avoid permalink flush requirements.
 * e.g. https://site.com/?rest_route=/motionkit/v1/ + "global-animation"
 */
function restUrl(endpoint) {
  return (wcfanimb.rest_url || "") + endpoint;
}

/**
 * Extract the mk_token (JWT) for editor authentication.
 *
 * Priority:
 * 1. wcfanimb.mk_token — set by PHP (already validated server-side, most reliable)
 * 2. URL query param ?mk_token — fallback for cases where localized data is unavailable
 */
function getMkToken() {
  try {
    if (typeof wcfanimb !== "undefined" && wcfanimb.mk_token) {
      return wcfanimb.mk_token;
    }
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

/**
 * POST data to a REST endpoint with standardized error handling.
 * On failure, sends a motionkit-error postMessage to the parent editor.
 *
 * @param {string}   endpoint   REST endpoint name (e.g. "global-settings")
 * @param {object}   body       JSON body to POST
 * @param {object}   headers    Pre-built auth headers from getAuthHeaders()
 * @param {function} onSuccess  Callback invoked with the parsed JSON on success
 */
function saveViaRest(endpoint, body, headers, onSuccess) {
  fetch(restUrl(endpoint), {
    method: "POST",
    headers,
    credentials: "include",
    body: JSON.stringify(body),
  })
    .then((r) => {
      if (!r.ok) {
        return r
          .json()
          .catch(() => ({ message: `HTTP ${r.status}` }))
          .then((respBody) => {
            console.log(respBody);
            const msg = respBody?.message || `HTTP ${r.status}`;

            try {
              window.parent.postMessage(
                {
                  type: "motionkit-error",
                  data: {
                    error: msg,
                    code: respBody?.code || "save_failed",
                    endpoint,
                    status: r.status,
                  },
                },
                parentOrigin || "*",
              );
            } catch (e) {
              console.warn("MotionKit: postMessage failed", e);
            }
            return null;
          });
      }

      return r.json();
    })
    .then((res) => {
      if (res?.success) onSuccess(res);
    })
    .catch((err) => console.error(`MotionKit: ${endpoint} save failed`, err));
}

/**
 * Build the standard motionkit-response payload,
 * merging optional overrides over the cached wcfanimb values.
 */
function buildResponsePayload(overrides = {}) {
  return {
    platform: wcfanimb.platform,
    globalSettings: overrides.globalSettings || wcfanimb.global_settings,
    pageType: wcfanimb.pageTypeConfigs,
    currentPageSettings:
      overrides.currentPageSettings || wcfanimb.currentPageSettings,
    globalAnimation: overrides.globalAnimation || wcfanimb.global_animation,
    pageAnimation: overrides.pageAnimation || wcfanimb.page_animation,
    deviceConfig: wcfanimb.device_config,
    base_domain: wcfanimb.base_domain,
    rest_url: wcfanimb.rest_url,
  };
}

let storeAnimation = {};
let parentOrigin = null;

function receivePageConfig() {
  parentOrigin = getParentOrigin();
  window.addEventListener(
    "message",
    (event) => {
      // Lock to the first valid origin we receive from
      if (!parentOrigin) {
        parentOrigin = event.origin;
      }

      // Receive animation config from SaaS editor
      if (event?.data?.type === "wcf-animation-config") {
        storeAnimation = {};
        let mm;
        console.log("Received animation config from editor Play", event.data);
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
                },
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
              },
            );
          });
        });

        // Dispatch to preset scripts
        document.dispatchEvent(
          new CustomEvent("aae-animation-event", {
            detail: storeAnimation,
            bubbles: true,
            cancelable: true,
          }),
        );
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

      // Receive global + current page settings from the editor
      if (event.data?.type === "motionkit-settings") {
        const {
          globalSettings,
          currentPageSettings,
          globalAnimation,
          pageAnimation,
        } = event.data.data || {};

        console.log("Recived from motionkit connector", {
          globalSettings,
          currentPageSettings,
          globalAnimation,
          pageAnimation,
        });

        const headers = getAuthHeaders();

        if (globalSettings) {
          saveViaRest(
            "global-settings",
            { animationConfigs: globalSettings },
            headers,
            () => {
              wcfanimb.global_settings = globalSettings;
            },
          );
        }

        if (currentPageSettings) {
          saveViaRest(
            "current-page-settings",
            {
              pageTypeConfigs: wcfanimb.pageTypeConfigs,
              animationConfigs: currentPageSettings,
            },
            headers,
            () => {
              wcfanimb.currentPageSettings = currentPageSettings;
            },
          );
        }

        if (globalAnimation) {
          saveViaRest(
            "global-animation",
            { animationConfigs: globalAnimation },
            headers,
            () => {
              wcfanimb.global_animation = globalAnimation;
            },
          );
        }

        if (pageAnimation) {
          saveViaRest(
            "current-page-animation",
            {
              pageTypeConfigs: wcfanimb.pageTypeConfigs,
              animationConfigs: pageAnimation,
            },
            headers,
            () => {
              wcfanimb.page_animation = pageAnimation;
            },
          );
        }
       
        document.dispatchEvent(
          new CustomEvent("motionkit-settings-update", {
            detail: {
              globalSettings,
              currentPageSettings,
              globalAnimation,
              pageAnimation,
            },
            bubbles: true,
            cancelable: true,
          }),
        );
      }

      // Handle page search from the SaaS editor
      if (event.data?.type === "motionkit-page-search") {
        const query = event.data.query || "";
        const page = event.data.page || 1;
        const perPage = event.data.per_page || 10;
        const headers = getAuthHeaders();
        const searchUrl =
          restUrl("pages") +
          "&s=" +
          encodeURIComponent(query) +
          "&page=" +
          page +
          "&per_page=" +
          perPage;

        fetch(searchUrl, { headers })
          .then((r) => r.json())
          .then((res) => {
            window.parent.postMessage(
              {
                type: "motionkit-page-search-result",
                data: res?.data || [],
                query,
                page: res?.page || page,
                has_more: res?.has_more || false,
                total: res?.total || 0,
              },
              parentOrigin,
            );
          })
          .catch((err) => {
            window.parent.postMessage(
              {
                type: "motionkit-page-search-result",
                data: [],
                query,
                page,
                has_more: false,
                total: 0,
              },
              parentOrigin,
            );
          });
      }

      // Respond to data requests from the SaaS editor
      if (
        event.data?.type === "motionkit-request" &&
        event.data?.request === "get-data"
      ) {
        window.parent.postMessage(
          { type: "motionkit-response", data: buildResponsePayload() },
          parentOrigin,
        );
      }
    },
    false,
  );

  // Notify parent (SaaS editor) that the iframe is ready
  setTimeout(() => {
    window.parent.postMessage(
      {
        type: "motionkit-ready",
        data: {
          platform: wcfanimb.platform,
          base_domain: wcfanimb.base_domain,
          rest_url: wcfanimb.rest_url,
        },
      },
      parentOrigin,
    );
  }, 1000);
}

// Initialize on page load
window.addEventListener("load", () => {
  receivePageConfig();
});
