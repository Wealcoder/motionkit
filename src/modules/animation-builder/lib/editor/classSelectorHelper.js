import {
  getClassSelectorInnerHTML,
  getOverlayInnerHTML,
} from "@/components/classSelector/classSelector";
import { copyToClipboard } from "@/utils/copyToClipboard";
import { handleToastEventFromIframe } from "./core/iframe_events/toasterEvent";

//  class or id selection mapping on svg click.
const copySelectorMap = {
  "wcf-ab-cpc-copy": "parentUniqueSelector",
  "wcf-ab-cpid-copy": "parentId",
  "wcf-ab-cccs-copy": "currentUniqueSelector",
  "wcf-ab-ccid-copy": "currentId",
  "wcf-ab-cccl-copy": "currentFullSelector",
};

// ##################### Class Selector Main Functions #####################

// overlay element. (creating overlay and modal anchor to avoid layout breaking of iframe)
export function initOverlayRoot(event) {
  const document = event.target;
  if (!document) return null;
  const body = document.body;
  if (!body) return null;
  ["wcf-ab-iframe-overlay-root", "wcf-ab-iframe-modal-root"]?.forEach(
    (rootId) => {
      let root = document.getElementById(rootId);
      if (!root) {
        root = document.createElement("div");
        root.id = rootId;
        body.appendChild(root);
      }
    }
  );
}

// highlighting target element on mouseover event for new animation by injecting overlay inside wcf-ab-iframe-overlay-root (created by initOverlayRoot on dom load)
export function handleMouseOver(event) {
  event.stopPropagation();
  const target = event.target;
  const document = target.ownerDocument;
  const overlayRoot = document.getElementById("wcf-ab-iframe-overlay-root");
  if (!overlayRoot) return;
  if (
    target.classList.contains("wcfanimb-skip-selector") ||
    target.closest(".wcfanimb-skip-selector-full") ||
    target.closest("[data-wcf-anim-id]") ||
    target.closest(".wcf-animb-wrapper")
  ) {
    return;
  }

  // storing element informaiton for button actions (Very important for show class selector function)
  overlayRoot.__wcf_ab_target_element = target;

  // extracting target information
  const hasAnimation = target.closest("[data-wcf-anim-id]") ?? false;
  const targetTag = `&lt;${target.tagName.toLowerCase()}&gt;`;

  // getting target element position
  const rect = target.getBoundingClientRect();

  // injecting overlay
  overlayRoot.innerHTML = getOverlayInnerHTML(rect, hasAnimation, targetTag);
  target.classList.add("wcf-animb--hover-highlight");
}

// showing modal after clicking code button from overlay by injecting overlay inside wcf-ab-iframe-modal-root (created by initOverlayRoot on dom load)
export function showClassSelector() {
  const overlayRootEl = document.getElementById("wcf-ab-iframe-overlay-root");
  const target = overlayRootEl?.__wcf_ab_target_element;
  const iframeBody = target.ownerDocument.body;

  const parent = target.parentElement;
  if (!parent || parent === iframeBody) return;

  let modalInfo = {};

  // Parent info
  modalInfo.parentId = parent.id || "N/A";
  modalInfo.parentUniqueSelector = getUniqueSelector(parent) || "N/A";

  // Current element info
  modalInfo.currentId = target.id || "N/A";
  modalInfo.currentUniqueSelector = getUniqueSelector(target) || "N/A";
  modalInfo.currentFullSelector = getFullSelector(target) || "N/A";

  // saving overlay for future extraction to editor. Extracting data inside dispathSelectorClipboardEvent function
  overlayRootEl.dataset.__wcf_ab_target_info = JSON.stringify(modalInfo);

  // getting modal root for modal injection
  const overlayModalRoot = document.getElementById("wcf-ab-iframe-modal-root");
  overlayModalRoot.innerHTML = getClassSelectorInnerHTML(modalInfo);
}

// copying informaiton from class selector to editor controller
export async function dispathSelectorClipboardEvent(e) {
  const eventTarget = e.target;
  const action = eventTarget.dataset.action ?? "";
  if (!action) {
    console.warn("Clipboard action not found!");
    return;
  }

  // extracting data from modalinfo
  const overlayModalRoot = document.getElementById(
    "wcf-ab-iframe-overlay-root"
  );

  const modalInfo =
    JSON.parse(overlayModalRoot.dataset.__wcf_ab_target_info ?? "") ?? null;

  if (!modalInfo) {
    console.warn("Unable to find target information!");
    return;
  }

  const textToCopy = modalInfo[copySelectorMap[action]];
  if (!textToCopy) return;

  // differentiating for toast message
  const isIdBtnPressed = action.indexOf("id") !== -1;

  try {
    await copyToClipboard(textToCopy);
    // triggering toast
    handleToastEventFromIframe({
      type: "success",
      message: `Successfully copied element ${isIdBtnPressed ? "id" : "class"}`,
    });
    hideClassSelector();
  } catch (err) {
    handleToastEventFromIframe({
      type: "error",
      message: `The selected element ${
        isIdBtnPressed ? "id" : "class"
      } not available!`,
    });
    hideClassSelector();
  }
}

// closing modal and and cleanup target infromation
export function hideClassSelector() {
  setTimeout(() => {
    const overlayRootEl = document.getElementById("wcf-ab-iframe-overlay-root");
    delete overlayRootEl.dataset.__wcf_ab_target_element;
    delete overlayRootEl.dataset.__wcf_ab_target_info;
    overlayRootEl.innerHTML = "";
    const overlayModalRoot = document.getElementById(
      "wcf-ab-iframe-modal-root"
    );
    overlayModalRoot.innerHTML = "";
  }, 150);
}

// ##################### Class Selector Helper Functions #####################

export function getClosestAnimId(element) {
  let el = element;
  while (el) {
    if (el.dataset && el.dataset.wcfAnimId) {
      return el.dataset.wcfAnimId;
    }
    el = el.parentElement;
  }
  return null;
}

export function getFullSelector(element) {
  const path = [];
  let depth = 0;

  while (element && element.tagName.toLowerCase() !== "html" && depth < 5) {
    let selector = getUniqueSelector(element);
    path.unshift(selector);
    if (document.querySelectorAll(selector).length === 1 || element.id) {
      break;
    }

    element = element.parentElement;
    depth++;
  }
  let result = path;
  if (path.length > 4) {
    result = [path[0], path[path.length - 1]];
  }
  return result.join(" ");
}

export function getUniqueSelector(element) {
  const tag = element.tagName.toLowerCase();
  if (element.id) {
    return `${tag}#${CSS.escape(element.id)}`;
  }
  if (element.dataset.id) {
    let customClass = `.elementor-element-${element.dataset.id}`;
    if (document.querySelectorAll(customClass).length === 1) {
      return `${customClass}`;
    }
  }
  const classList = Array.from(element.classList).filter(
    (cls) =>
      cls !== "wcf-animb--hover-highlight" &&
      cls !== "hover-outline-highlight-builder" &&
      cls !== "hover-outline-highlight-default" &&
      !/[.#]/.test(cls)
  );
  if (classList.length > 0) {
    return `${tag}.${classList.join(".")}`;
  }
  return tag;
}

export function extractLastSelector(selector) {
  if (selector === undefined) {
    return { full: "", tag: "", classes: false, id: "" };
  }
  const lastPart = selector
    .trim()
    .split(/[\s>+~]+/) // Split by spaces, >, +, or ~
    .pop()
    .trim();

  const tag = lastPart.split(".")[0].split("#")[0];
  const classes = lastPart?.split(".")?.slice(1)?.join(".");
  const id = lastPart.split("#")[1];

  return { full: lastPart, tag, classes, id };
}
