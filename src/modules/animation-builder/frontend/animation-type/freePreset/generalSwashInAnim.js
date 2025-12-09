import { freeAnimClassMapping } from "@/register/freeAnimClassMapping";

export function generalSwashInAnim() {
  let allElements = new Map();

  function handleOnScrollAnimation({ elements = [] }) {
    if (!WCFFreeAnimBuilder) {
      console.error("LOG: Free animation event handler not found!");
      return;
    }
    WCFFreeAnimBuilder.triggerOnScrollObserver(elements);
  }

  function handlePageLoadAnimation({ elements = [] }) {
    if (!WCFFreeAnimBuilder) {
      console.error("LOG: Free animation event handler not found!");
      return;
    }
    WCFFreeAnimBuilder.initOnPageLoadEvent(elements);
  }

  function handlePlayWithScroll() {}

  function handleHoverAnimation() {}

  function handleClickAnimation() {}

  function handler(e) {
    const sections = e.detail["wcf-general-swash-in-free-animation"] || [];

    // Organizing elements data by trigger type.
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
      const getElementsByType = allElements?.get(triggerType) || [];
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
        allElements.set(triggerType, [newElement]);
      } else {
        const allElementsByType = allElements?.get(triggerType);
        allElements?.set(triggerType, [...allElementsByType, newElement]);
      }
    });

    const allOnScrollElements = allElements?.get("on_scroll");
    const allPageLoadAnimation = allElements?.get("page_load");

    if (allOnScrollElements?.length > 0) {
      handleOnScrollAnimation({ elements: allOnScrollElements });
    }

    if (allPageLoadAnimation?.length > 0) {
      handlePageLoadAnimation({ elements: allPageLoadAnimation });
    }

    return;
  }

  function resetAnimation() {
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

  // wordpress events
  document.addEventListener("aae-animation-event", handler);
  document.addEventListener("aae-reset-animation", resetAnimation);

  return { destroy: resetAnimation };
}
generalSwashInAnim();
