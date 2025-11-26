export function resetAnimations({ config, timelines, createdScrollTriggers }) {
  for (let x in timelines) {
    if (timelines[x].split && typeof timelines[x].split.revert === "function") {
      timelines[x].split.revert();
    }
    timelines[x].revert();
    timelines[x].kill();
  }

  createdScrollTriggers?.forEach((st) => st.kill());
  createdScrollTriggers.length = 0;

  config?.forEach((section) => {
    section.animations?.forEach((animation) => {
      const selector = extractLastSelector(animation.applyAnimation.className);
      if (selector?.full && selector.full !== "") {
        gsap.set(selector.full, { clearProps: "all" });
      }
    });
  });
}

export function getFullSelector(element) {
  const path = [];
  let depth = 0; // Track depth

  while (element && element.tagName.toLowerCase() !== "html" && depth < 5) {
    let selector = getUniqueSelector(element);
    // Check if the current element has an ID
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
  // Add ID if available
  if (element.id) {
    return `${tag}#${element.id}`; // Only tag and ID, skip classes
  }

  if (element.dataset.id) {
    let customClass = `.elementor-element-${element.dataset.id}`;
    if (document.querySelectorAll(customClass).length === 1) {
      return `${customClass}`; // Only tag and ID, skip classes
    }
  }

  // Add class names, excluding the hover-highlight class
  const classList = Array.from(element.classList).filter(
    (cls) => cls !== "wcf-animb--hover-highlight"
  );
  if (classList.length > 0) {
    return `${tag}.${classList.join(".")}`; // Concatenated classes if no ID
  }

  return tag; // Return only tag if no ID or classes
}

export function extractLastSelector(selector) {
  if (selector === undefined) {
    return { full: "", tag: "", classes: false, id: "" };
  }
  // Regular expression to match selectors based on common delimiters
  const lastPart = selector
    .trim()
    .split(/[\s>+~]+/) // Split by spaces, >, +, or ~
    .pop() // Get the last element in the array
    .trim();

  // Extract the tag (if any) and classes (if any)
  const tag = lastPart.split(".")[0].split("#")[0]; // Takes the first part before classes or IDs
  const classes = lastPart
    .split(".")
    .slice(1) // Remove the tag name
    .join("."); // Join classes back
  const id = lastPart.split("#")[1]; // Extract the ID if present

  return { full: lastPart, tag, classes, id };
}

export function showPopup(selector, x, y) {
  const popup = document.getElementById("wcfanim-selectorPopup");
  const content = document.getElementById("wcfanim-popupContent");

  // Set the content of the popup (for example, display the selector string)
  content.textContent = selector;

  // Get the width and height of the popup and its content
  const popupWidth = popup.offsetWidth;
  const popupHeight = popup.offsetHeight;

  // Get the current viewport size
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;

  // Adjust the x-coordinate if the popup is too wide for the screen
  if (x + popupWidth > viewportWidth) {
    x = viewportWidth - popupWidth - 10; // Keep it 10px away from the right edge
  }

  // Adjust the y-coordinate if the popup is too tall for the screen
  if (y + popupHeight > viewportHeight) {
    y = viewportHeight - popupHeight - 10; // Keep it 10px away from the bottom edge
  }

  // Position the popup
  popup.style.left = `${x}px`;
  popup.style.top = `${y}px`;

  // Show the popup
  popup.style.display = "block";
}

export function hidePopup() {
  const popup = document.getElementById("wcfanim-selectorPopup");
  popup.style.display = "none";
}

export function extractNameAndValue(data) {
  return data.map((item) => ({
    name: item.name,
    value: item.value,
  }));
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
