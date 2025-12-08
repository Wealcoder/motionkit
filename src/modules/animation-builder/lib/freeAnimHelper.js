// Helper function
export function handleAddClassName(
  elements = null,
  classList = [],
  generalStyle = {}
) {
  if (!elements || !Array.isArray(classList) || !classList.length) return;
  elements = Array.isArray(elements) ? elements : Array.from(elements);
  elements.forEach((item) => {
    if (generalStyle && typeof generalStyle === "object") {
      Object.entries(generalStyle).forEach(([key, value]) => {
        if (value != null) {
          item.style[key] = value;
        }
      });
    }
    item.classList.add(...classList);
  });
}

export function handleRemoveClassName(elements = null, classList = []) {
  if (!elements || !Array.isArray(classList) || !classList?.length) return;
  elements?.forEach((item) => item.classList.remove(...classList));
}

// Event function
export function onScrollTrigger(trigger, callback, threshold = 0.2) {
  if (!trigger || typeof callback !== "function") return;

  const elements =
    typeof trigger === "string"
      ? document.querySelectorAll(trigger)
      : Array.isArray(trigger)
      ? trigger
      : [trigger];

  if (!elements.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          callback(entry.target);
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold,
    }
  );

  elements.forEach((el) => observer.observe(el));
}
