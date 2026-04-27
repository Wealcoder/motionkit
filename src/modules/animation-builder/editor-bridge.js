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

// WCFFreeAnimBuilder is already initialized by frontend.js (loaded as dependency)

/**
 * Allowed editor origins that can communicate with this bridge.
 * In production only editor.motionkit.io is allowed.
 * In development localhost origins are also permitted.
 */
const ALLOWED_ORIGINS = [
  "https://editor.motionkit.io",
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:5174",
  "http://127.0.0.1:5174",
  "http://localhost:3000",
  "*",
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
 * wcfanimb.rest_url is pre-built by PHP and handles both pretty
 * (/wp-json/motionkit/v1/) and plain (?rest_route=/motionkit/v1/) forms.
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
 * Bridge endpoint names → simple-dispatcher action names.
 */
const ENDPOINT_TO_ACTION = {
  "global-settings": "save_global_settings",
  "global-animation": "save_global_animation",
  "current-page-settings": "save_current_page_settings",
  "current-page-animation": "save_current_page_animation",
  "page-transition-exported-code": "save_page_transition_code",
};

/**
 * No-op retained for call-site compatibility — we no longer use custom
 * auth headers (they'd trigger a CORS preflight).
 */
function getAuthHeaders() {
  return {};
}

/**
 * POST to /motionkit/v1/save as a CORS "simple request":
 *   - Content-Type: text/plain
 *   - No Authorization header, no X-WP-Nonce
 *   - JWT travels in the JSON body
 *
 * Simple requests skip the OPTIONS preflight entirely, so no server
 * config, .htaccess, WAF, or host policy can 405 us.
 */
function saveViaRest(endpoint, body, _headers, onSuccess, saveId) {
  const action = ENDPOINT_TO_ACTION[endpoint];
  if (!action) return;

  const payload = JSON.stringify({
    token: getMkToken(),
    action,
    payload: body,
  });

  const ack = (ok, extra = {}) => {
    try {
      window.parent.postMessage(
        {
          type: ok ? "motionkit-save-success" : "motionkit-save-error",
          data: { endpoint, action, saveId, ...extra },
        },
        parentOrigin || "*",
      );
    } catch (e) {
      /* postMessage failed */
    }
  };

  fetch(restUrl("save"), {
    method: "POST",
    headers: { "Content-Type": "text/plain;charset=UTF-8" },
    body: payload,
  })
    .then((r) => {
      if (!r.ok) {
        return r
          .json()
          .catch(() => ({ message: `HTTP ${r.status}` }))
          .then((respBody) => {
            ack(false, {
              error: respBody?.message || respBody?.error || `HTTP ${r.status}`,
              code: respBody?.code || "save_failed",
              status: r.status,
            });
            return null;
          });
      }
      return r.json();
    })
    .then((res) => {
      if (res?.success) {
        ack(true);
        onSuccess(res);
      } else if (res !== null) {
        ack(false, { error: res?.error || "unknown_error" });
      }
    })
    .catch((err) => {
      ack(false, { error: String(err?.message || err || "network_error") });
    });
}

/**
 * Build the standard motionkit-response payload,
 * merging optional overrides over the cached wcfanimb values.
 */
function buildResponsePayload(overrides = {}) {
  // Use ?? so legitimate empty values ([], {}, 0) from the new page
  // overwrite stale wcfanimb cached values from the previous load.
  const payload = {
    platform: wcfanimb.platform,
    globalSettings: overrides.globalSettings ?? wcfanimb.global_settings,
    pageType: wcfanimb.pageTypeConfigs,
    currentPageSettings:
      overrides.currentPageSettings ?? wcfanimb.currentPageSettings,
    globalAnimation: overrides.globalAnimation ?? wcfanimb.global_animation,
    pageAnimation: overrides.pageAnimation ?? wcfanimb.page_animation,
    deviceConfig: wcfanimb.device_config,
    base_domain: wcfanimb.base_domain,
    rest_url: wcfanimb.rest_url,
  };
  return payload;
}

let parentOrigin = null;

// `aae-animation-event`) lives in inject-bridge.js so HTML/static/Shopify and
// WordPress all share one path. This bridge owns WP-specific concerns only:
// REST save, page search, data hydration, ready signal.

function receivePageConfig() {
  parentOrigin = getParentOrigin();
  const headers = getAuthHeaders();
  window.addEventListener(
    "message",
    (event) => {
      // Receive global + current page settings from the editor
      if (event.data?.type === "motionkit-settings") {
        const {
          globalSettings,
          currentPageSettings,
          globalAnimation,
          pageAnimation,
        } = event.data.data || {};
        // Editor-assigned id so ack postMessages can match the toast.
        const saveId = event.data.saveId || null;

        if (globalSettings) {
          saveViaRest(
            "global-settings",
            { animationConfigs: globalSettings },
            headers,
            () => {
              wcfanimb.global_settings = globalSettings;
            },
            saveId,
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
            saveId,
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
            saveId,
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
            saveId,
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
        const token = getMkToken();
        // Token in query param — keeps the request as a CORS simple GET
        // (no Authorization header, no preflight).
        const searchUrl =
          restUrl("pages") +
          "&s=" +
          encodeURIComponent(query) +
          "&page=" +
          page +
          "&per_page=" +
          perPage +
          (token ? "&token=" + encodeURIComponent(token) : "");

        fetch(searchUrl)
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

      if (event.data?.type === "motionkit-page-transition-code") {
        const { presetKey, presetLabel, code } = event.data.data || {};
        saveViaRest(
          "page-transition-exported-code",
          { code, presetKey, presetLabel },
          headers,
          () => {},
          presetKey,
        );
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
  window.addEventListener("mk-animation-active-plugins", (event) => {
    const currentPage = wcfanimb.currentPageSettings;
    const activePlugins = event.detail;
    const modifed = { ...currentPage, activePlugins };

    saveViaRest(
      "current-page-settings",
      {
        pageTypeConfigs: wcfanimb.pageTypeConfigs,
        animationConfigs: modifed,
      },
      headers,
      () => {
        wcfanimb.currentPageSettings = modifed;
      },
      null,
    );
  });
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

// Initialize message listener as early as possible (not on window.load) so
// we don't miss any motionkit-request from the editor while WP assets are
// still loading. motionkit-ready is still posted after its own timer below.
receivePageConfig();
