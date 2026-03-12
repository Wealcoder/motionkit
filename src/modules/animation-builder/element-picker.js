/**
 * Element Picker Module
 *
 * Provides hover overlay + toolbar for selecting DOM elements in the iframe.
 * Sends element class/ID info back to the parent editor via postMessage.
 *
 * Used by editor-bridge.js — toggle via motionkit-element-picker messages
 * or auto-enable on load.
 */

// ─── State ───────────────────────────────────────────────────
let elementPickerActive = false;
let elementPickerMoveHandler = null;
let elementPickerClickHandler = null;
let lastHighlightedElement = null;
let pickerToolbar = null;
let pickerOverlay = null;
let pickerFrozen = false;
let pickerClickLocked = false;
let pickerLockTimer = null;

// Callbacks set by the bridge to send data to parent
let onElementSelected = null;
let onExistingAnimationClicked = null;
let onPickerHoverChanged = null;

const PICKER_SKIP_TAGS = new Set(["HTML", "BODY", "SCRIPT", "STYLE", "LINK", "HEAD"]);

// ─── Helpers ─────────────────────────────────────────────────

function extractElementInfo(el) {
  if (!el) return { tagName: "", id: "", classList: [], classShort: "", classFull: "" };
  return {
    tagName: el.tagName || "",
    id: el.id || "",
    classList: Array.from(el.classList || []),
    classShort: el.classList?.[0] || "",
    classFull: el.className || "",
  };
}

/**
 * Walk up the DOM (max 5 levels) and collect ancestors.
 * Stops early if it hits BODY/HTML or finds an element with an ID (unique enough).
 */
function collectAncestors(el, max = 5) {
  const ancestors = [];
  let current = el?.parentElement;
  while (current && ancestors.length < max) {
    if (PICKER_SKIP_TAGS.has(current.tagName)) break;
    ancestors.push(extractElementInfo(current));
    if (current.id) break; // ID is unique, no need to go higher
    current = current.parentElement;
  }
  return ancestors;
}

function sendElementSelected(el) {
  if (!el || !onElementSelected) return;
  const ancestors = collectAncestors(el, 3);
  onElementSelected({
    element: extractElementInfo(el),
    parent: ancestors[0] || null,
    ancestors,
  });
}

// ─── Overlay & Toolbar DOM ───────────────────────────────────

function createPickerOverlay() {
  if (!pickerOverlay) {
    pickerOverlay = document.createElement("div");
    pickerOverlay.id = "mk-picker-overlay";
    pickerOverlay.style.cssText = "position:absolute;pointer-events:none;border:2px dashed #86B971;background:rgba(134,185,113,0.06);z-index:999998;display:none;box-sizing:border-box;transition:top .05s,left .05s,width .05s,height .05s;";
    document.body.appendChild(pickerOverlay);
  }

  if (!pickerToolbar) {
    pickerToolbar = document.createElement("div");
    pickerToolbar.id = "mk-picker-toolbar";
    pickerToolbar.style.cssText = "position:absolute;z-index:999999;display:none;background:#fff;border:1px solid #d4d4d4;border-radius:4px;padding:2px 6px;box-shadow:0 2px 8px rgba(0,0,0,.12);font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;font-size:12px;white-space:nowrap;pointer-events:auto;align-items:center;gap:6px;height:30px;";

    // Animation name input
    const nameInput = document.createElement("input");
    nameInput.type = "text";
    nameInput.placeholder = "Animation Name";
    nameInput.style.cssText = "border:none;outline:none;background:#E8F0E2;color:#333;font-size:11px;font-weight:500;padding:3px 8px;border-radius:3px;width:130px;height:22px;box-sizing:border-box;";
    nameInput.addEventListener("click", (e) => { e.stopPropagation(); });
    nameInput.addEventListener("mousedown", (e) => { e.stopPropagation(); });

    // Spacer
    const spacer = document.createElement("div");
    spacer.style.cssText = "flex:1;";

    // Existing animation selector button
    const existingAnimationBtn = document.createElement("button");
    existingAnimationBtn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none"><circle cx="7" cy="7" r="3" fill="#FF6B6B"/><circle cx="17" cy="7" r="3" fill="#4ECDC4"/><circle cx="7" cy="17" r="3" fill="#45B7D1"/><circle cx="17" cy="17" r="3" fill="#96CEB4"/></svg>';
    existingAnimationBtn.style.cssText = "border:none;background:none;cursor:pointer;padding:2px;display:flex;align-items:center;justify-content:center;border-radius:3px;";
    existingAnimationBtn.addEventListener("mouseenter", () => { existingAnimationBtn.style.background = "#f0f0f0"; });
    existingAnimationBtn.addEventListener("mouseleave", () => { existingAnimationBtn.style.background = "none"; });
    existingAnimationBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      console.log("Existing animation button clicked", lastHighlightedElement);
      if (!lastHighlightedElement || !onExistingAnimationClicked) return;
      onExistingAnimationClicked({
        element: extractElementInfo(lastHighlightedElement),
        parent: extractElementInfo(lastHighlightedElement.parentElement),
      });
    });

    // Class selector { } icon button
    const classBtn = document.createElement("button");
    classBtn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#333" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>';
    classBtn.style.cssText = "border:none;background:none;cursor:pointer;padding:2px;display:flex;align-items:center;justify-content:center;border-radius:3px;";
    classBtn.addEventListener("mouseenter", () => { classBtn.style.background = "#f0f0f0"; });
    classBtn.addEventListener("mouseleave", () => { classBtn.style.background = "none"; });
    classBtn.addEventListener("click", (e) => {

      e.preventDefault();
      e.stopPropagation();
      sendElementSelected(lastHighlightedElement);
      pickerClickLocked = false;
      pickerFrozen = false;
    });

    // Freeze overlay when mouse enters toolbar
    pickerToolbar.addEventListener("mouseenter", () => { pickerFrozen = true; });
    pickerToolbar.addEventListener("mouseleave", () => {
      if (!pickerClickLocked) pickerFrozen = false;
    });

    pickerToolbar.appendChild(nameInput);
    pickerToolbar.appendChild(spacer);
    pickerToolbar.appendChild(existingAnimationBtn);
    pickerToolbar.appendChild(classBtn);
    document.body.appendChild(pickerToolbar);
  }
}

// ─── Positioning ─────────────────────────────────────────────

function positionPickerUI(el) {
  if (!pickerOverlay || !pickerToolbar) return;
  const rect = el.getBoundingClientRect();
  const scrollX = window.scrollX;
  const scrollY = window.scrollY;

  pickerOverlay.style.display = "block";
  pickerOverlay.style.top = (rect.top + scrollY) + "px";
  pickerOverlay.style.left = (rect.left + scrollX) + "px";
  pickerOverlay.style.width = rect.width + "px";
  pickerOverlay.style.height = rect.height + "px";

  pickerToolbar.style.display = "flex";
  const toolbarHeight = 30;
  let toolbarTop = rect.top + scrollY - toolbarHeight - 4;
  if (toolbarTop < scrollY) {
    toolbarTop = rect.bottom + scrollY + 4;
  }
  pickerToolbar.style.top = toolbarTop + "px";
  pickerToolbar.style.left = (rect.left + scrollX) + "px";
}

function hidePickerUI() {
  if (pickerOverlay) pickerOverlay.style.display = "none";
  if (pickerToolbar) pickerToolbar.style.display = "none";
}

function removePickerUI() {
  if (pickerOverlay) { pickerOverlay.remove(); pickerOverlay = null; }
  if (pickerToolbar) { pickerToolbar.remove(); pickerToolbar = null; }
}

// ─── Enable / Disable ────────────────────────────────────────

export function enableElementPicker() {
  if (elementPickerActive) return;
  elementPickerActive = true;
  createPickerOverlay();

  elementPickerMoveHandler = (e) => {
    if (pickerFrozen) return;
    const el = e.target;
    if (PICKER_SKIP_TAGS.has(el.tagName)) return;
    if (el === pickerToolbar || pickerToolbar?.contains(el)) return;
    if (el === pickerOverlay) return;

    if (el !== lastHighlightedElement) {
      clearTimeout(pickerLockTimer);
      if (onPickerHoverChanged) onPickerHoverChanged();
      pickerLockTimer = setTimeout(() => {
        lastHighlightedElement = el;
        positionPickerUI(el);
      }, 200);
    }
  };

  elementPickerClickHandler = (e) => {
    const el = e.target;
    if (el === pickerToolbar || pickerToolbar?.contains(el)) return;
    if (PICKER_SKIP_TAGS.has(el.tagName)) return;
    if (el === pickerOverlay) return;
    e.preventDefault();
    e.stopPropagation();

    clearTimeout(pickerLockTimer);
    pickerFrozen = true;
    pickerClickLocked = true;
    lastHighlightedElement = el;
    positionPickerUI(el);

    pickerLockTimer = setTimeout(() => {
      pickerClickLocked = false;
      pickerFrozen = false;
    }, 1300);
  };

  document.addEventListener("mousemove", elementPickerMoveHandler, true);
  document.addEventListener("click", elementPickerClickHandler, true);
  document.body.style.cursor = "crosshair";
}

export function disableElementPicker() {
  if (!elementPickerActive) return;
  elementPickerActive = false;

  if (elementPickerMoveHandler) {
    document.removeEventListener("mousemove", elementPickerMoveHandler, true);
    elementPickerMoveHandler = null;
  }
  if (elementPickerClickHandler) {
    document.removeEventListener("click", elementPickerClickHandler, true);
    elementPickerClickHandler = null;
  }
  clearTimeout(pickerLockTimer);
  pickerFrozen = false;
  pickerClickLocked = false;
  lastHighlightedElement = null;
  hidePickerUI();
  removePickerUI();
  document.body.style.cursor = "";
}

/**
 * Set the callback for when an element is selected.
 * @param {(data: { element: object, parent: object }) => void} callback
 */
export function setElementSelectedCallback(callback) {
  onElementSelected = callback;
}

/**
 * Set the callback for when the existing animation button is clicked.
 * @param {(data: { element: object, parent: object }) => void} callback
 */
export function setExistingAnimationCallback(callback) {
  onExistingAnimationClicked = callback;
}

/**
 * Set the callback for when the hovered element changes (dismiss panel signal).
 * @param {() => void} callback
 */
export function setPickerHoverCallback(callback) {
  onPickerHoverChanged = callback;
}
