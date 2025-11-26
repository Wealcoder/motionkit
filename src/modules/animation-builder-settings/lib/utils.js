import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export const debounceFn = (mainFunction, delay = 300) => {
  let timer;

  return function (...args) {
    clearTimeout(timer);

    timer = setTimeout(() => {
      mainFunction(...args);
    }, delay);
  };
};

export const deviceMediaMatch = () => {
  if (window.matchMedia("(min-width: 1440px)").matches) {
    return 3;
  } else {
    return 2;
  }
};

export const generateSearchContent = (
  fullContent = [],
  categoryKey,
  subItems
) => {
  if (subItems) {
    const allItems = [];
    fullContent?.map((el) =>
      el?.[subItems].map((item) => {
        allItems.push(item);
      })
    );

    const result = {
      category: categoryKey,
      items: allItems,
    };

    return result;
  } else {
    const result = {
      category: categoryKey,
      items: fullContent,
    };

    return result;
  }
};
