export const debounceFn = (mainFunction, delay = 300) => {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => {
      mainFunction(...args);
    }, delay);
  };
};
