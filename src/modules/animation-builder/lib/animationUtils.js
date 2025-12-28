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

export function showPopup(selector, x, y) {
  const popup = document.getElementById("wcfanim-selectorPopup");
  const content = document.getElementById("wcfanim-popupContent");

  content.textContent = selector;

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
  const popup = document.getElementById("wcfanim-selectorPopup");
  popup.style.display = "none";
}

export function handleMouseOver(event) {
  const target = event.target;

  if (target.classList.contains("wcfanimb-skip-selector")) {
    return;
  }

  if (target.closest(".wcfanimb-skip-selector-full")) {
    return;
  }

  target.classList.add("wcf-animb--hover-highlight");
  target.addEventListener(
    "mouseleave",
    () => {
      target.classList.remove("wcf-animb--hover-highlight");
    },
    { once: true }
  );
}
