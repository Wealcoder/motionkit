export function handleOnScrollAnimation({ elements = [] }) {
  if (!WCFFreeAnimBuilder) {
    console.error("LOG: Free animation event handler not found!");
    return;
  }
  WCFFreeAnimBuilder.triggerOnScrollObserver(elements);
}

export function handlePageLoadAnimation({ elements = [] }) {
  if (!WCFFreeAnimBuilder) {
    console.error("LOG: Free animation event handler not found!");
    return;
  }
  WCFFreeAnimBuilder.initOnPageLoadEvent(elements);
}

// Commented for future update.
// export function handlePlayWithScroll() {}

// export function handleHoverAnimation() {}

// export function handleClickAnimation() {}

// Reset Animation;

export function resetAnimation(allElements) {
  if (!allElements?.size) return;
  // removing all animations elements property by trigger class.
  const flattenElements = [...allElements.values()].flat();

  flattenElements?.forEach((element) => {
    const { trigger, classToAdd: classToRemove, styles } = element || {};
    const nodes = document.querySelectorAll(trigger) || [];
    nodes.forEach((entry) => {
      WCFFreeAnimBuilder.handleRemoveClassName({
        element: entry,
        classList: classToRemove,
        style: styles,
      });
    });
  });

  // kill running observer if available
  WCFFreeAnimBuilder.killOnScrollObserver();

  // clear Map.
  allElements?.clear();
  return;
}
