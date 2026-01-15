// formatter functions
export const toCamelCase = (str = "") => {
  if (!str || typeof str !== "string") return;
  return str
    .trim()
    .replace(/[^a-zA-Z0-9 ]+/g, "")
    .replace(/\s+(.)/g, (_, c) => c.toUpperCase())
    .replace(/^(.)/, (_, c) => c.toLowerCase());
};

export const trimString = (str = "", limit = 0) => {
  if (!str) return;
  if (limit === 0) return str;
  if (str?.length > limit) {
    return str.slice(0, limit) + "...";
  }
  return str;
};

// utility functions
export const debounceFn = (mainFunction, delay = 300) => {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => {
      mainFunction(...args);
    }, delay);
  };
};
