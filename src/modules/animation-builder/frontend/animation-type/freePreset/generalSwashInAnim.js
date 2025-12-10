import { freeAnimClassMapping } from "@/register/freeAnimClassMapping";
import {
  handleOnScrollAnimation,
  handlePageLoadAnimation,
  resetAnimation,
} from "./Shared/freeAnimationHelper";

export function generalSwashInAnim() {
  let allElements = new Map();

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

  // wordpress events
  document.addEventListener("aae-animation-event", handler);
  document.addEventListener("aae-reset-animation", resetAnimation(allElements));

  return { destroy: resetAnimation };
}
generalSwashInAnim();
