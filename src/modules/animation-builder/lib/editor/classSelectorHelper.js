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

export function showPopup(element = null, x = 0, y = 0) {
  // TODO: popup should open from selector code button.
  return;

  if (!element) return;

  const iframeDoc = element.ownerDocument;
  const iframeBody = iframeDoc.body;

  const popup = document.getElementById("wcfanim-selectorPopup");
  popup.style.display = "fixed";
  popup.classList.add("is-visible");

  if (!popup) {
    console.error("Animation Builder popup wrapper not found!");
    return;
  }

  const parent = element.parentElement;
  if (!parent || parent === iframeBody) {
    console.warn("Parent selection blocked (BODY or null)");
    return;
  }

  // --- Parent info ---
  const parentId = parent.id || "N/A";
  const parentUniqueSelector = getUniqueSelector(parent) || "N/A";

  // --- Current element info ---
  const currentId = element.id || "N/A";
  const currentUniqueSelector = getUniqueSelector(element) || "N/A";
  const currentFullSelector = getFullSelector(element) || "N/A";

  // --- Insert data into popup (truncated for display) ---
  const parentClassEl = document.getElementById(
    "wcfanimb-parent-class-content"
  );
  parentClassEl.textContent =
    parentUniqueSelector.length > 25
      ? parentUniqueSelector.slice(0, 25) + "..."
      : parentUniqueSelector;
  parentClassEl.dataset.selector = parentUniqueSelector;

  const parentIdEl = document.getElementById("wcfanimb-parent-id-content");
  parentIdEl.textContent = parentId;
  parentIdEl.dataset.selector = parentId;

  const currentClassEl = document.getElementById(
    "wcfanimb-current-class-content"
  );
  currentClassEl.textContent =
    currentUniqueSelector.length > 25
      ? currentUniqueSelector.slice(0, 25) + "..."
      : currentUniqueSelector;
  currentClassEl.dataset.selector = currentUniqueSelector;

  const currentIdEl = document.getElementById("wcfanimb-current-id-content");
  currentIdEl.textContent = currentId;
  currentIdEl.dataset.selector = currentId;

  const currentLongClassEl = document.getElementById(
    "wcfanimb-current-long-class-content"
  );
  currentLongClassEl.textContent =
    currentFullSelector.length > 100
      ? currentFullSelector.slice(0, 100) + "..."
      : currentFullSelector;
  currentLongClassEl.dataset.selector = currentFullSelector;

  // --- Position popup inside viewport ---
  const popupWidth = popup.offsetWidth;
  const popupHeight = popup.offsetHeight;
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;

  if (x + popupWidth > viewportWidth) {
    x = viewportWidth - popupWidth - 10;
  }
  if (y + popupHeight > viewportHeight) {
    y = viewportHeight - popupHeight - 10;
  }

  popup.style.left = `${x}px`;
  popup.style.top = `${y}px`;
  popup.style.display = "block";
}

export function hidePopup() {
  setTimeout(() => {
    const popup = document.getElementById("wcfanim-selectorPopup");
    popup.style.display = "none";
  }, 150);
}

// overlay element. (creating overlay anchor to avoid layout breaking of iframe)
function getOverlayRoot(currentTarget) {
  const doc = currentTarget?.ownerDocument;
  if (!doc) return null;
  const body = doc.body;
  if (!body) return null;
  let root = doc.getElementById("wcf-animb-overlay-root");
  if (!root) {
    root = doc.createElement("div");
    root.id = "wcf-animb-overlay-root";
    root.style.position = "fixed";
    root.style.inset = "0";
    root.style.pointerEvents = "none";
    root.style.zIndex = "999999";
    body.appendChild(root);
  }
  return root;
}

export function clearAllHighlights(iframeDocument, exceptEl) {
  const highlighted = iframeDocument.querySelectorAll(
    ".wcf-animb--hover-highlight"
  );
  highlighted.forEach((el) => {
    if (el !== exceptEl) {
      el.classList.remove("wcf-animb--hover-highlight");
    }
  });
}

export function handleMouseOver(event) {
  const target = event.target;
  event.stopPropagation();
  const overlayRoot = getOverlayRoot(target);
  if (!overlayRoot) return;
  if (
    target.classList.contains("wcfanimb-skip-selector") ||
    target.closest(".wcfanimb-skip-selector-full") ||
    target.closest("[data-wcf-anim-id]") ||
    target.closest(".wcf-animb-wrapper")
  ) {
    return;
  }

  // clearing all highlighted class
  clearAllHighlights(target.ownerDocument, target);

  // extracting target information
  const hasAnimation = target.closest("[data-wcf-anim-id]") ?? false;
  const targetTag = `&lt;${target.tagName.toLowerCase()}&gt;`;

  // getting target element position
  const rect = target.getBoundingClientRect();
  // injecting target inside overlay.

  // todo: fix animation name, animation name div and selector action btn not stay with the element.
  // todo: apply button functionality and animation detection on the component.

  overlayRoot.innerHTML = `
    <div class="wcf-animb-overlay" style="
      position: absolute;
      top: ${rect.top}px;
      left: ${rect.left}px;
      width: ${rect.width}px;
      height: ${rect.height}px;
      min-width:250px;
      background: #7da76926;
      outline: 2px solid #a6c398;
    ">
      <div class="wcf-animb-label">
        ${hasAnimation ? "Animation Name" : `${targetTag}`}
      </div>
      <div class="wcf-animb-actions">
        <button class="wcf-animb-color-btn">
          <img style="hight:40px;width:40px" src="${`${wcf_anim_preview_object?.base_path}/assets/images/Logo.png`}" alt="Animation Builder"/>
        </button>
        <button class="wcf-animb-code-btn">
          <svg width="30" height="30" viewBox="0 0 30 30" fill="none"
            xmlns="http://www.w3.org/2000/svg">
            <path d="M18.3337 21.6663C19.8738 21.6663 21.1225 20.8135 21.1225 19.7615C21.1225 17.7272 21.1452 16.889 22.9253 15.6732C23.4698 15.3012 23.4698 14.6982 22.9253 14.3262C21.1452 13.1103 21.1225 12.2722 21.1225 10.2378C21.1225 9.18579 19.8738 8.33301 18.3337 8.33301M11.667 21.6663C10.1268 21.6663 8.87821 20.8135 8.87821 19.7615C8.87821 17.7272 8.85552 16.889 7.07541 15.6732C6.53086 15.3012 6.53086 14.6982 7.07539 14.3262C8.85552 13.1103 8.87821 12.2722 8.87821 10.2378C8.87821 9.18579 10.1268 8.33301 11.667 8.33301"
              stroke="#27272A" stroke-width="2" stroke-linecap="round"
              stroke-linejoin="round"/>
          </svg>
        </button>
      </div>
    </div>
  `;
  target.classList.add("wcf-animb--hover-highlight");
}
