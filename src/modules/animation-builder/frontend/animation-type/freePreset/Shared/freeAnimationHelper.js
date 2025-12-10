import { freeAnimClassMapping } from "@/register/freeAnimClassMapping";

// ############## MAIN FUNCTION ##############
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

// ############## HELPER FUNCTION ##############
export function handleOrganizedSectionByTriggerType(sections = []) {
  if (!sections?.length) return;
  const ElementsMap = new Map();
  sections?.forEach((section) => {
    const {
      id,
      preset,
      triggerType,
      itemClass,
      styles,
      initElementStyle,
      type,
    } = section || {};
    const getElementsByType = ElementsMap?.get(triggerType) || [];
    const classToAdd = freeAnimClassMapping(preset);
    const newElement = {
      id,
      trigger: itemClass,
      classToAdd,
      styles,
      initElementStyle,
      type,
    };
    if (!getElementsByType?.length) {
      ElementsMap.set(triggerType, [newElement]);
    } else {
      const allElementsByType = ElementsMap?.get(triggerType);
      ElementsMap?.set(triggerType, [...allElementsByType, newElement]);
    }
  });
  return ElementsMap;
}

// ############## EVENT FUNCTION ##############
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
