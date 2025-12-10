import {
  handleOnScrollAnimation,
  handleOrganizedSectionByTriggerType,
  handlePageLoadAnimation,
  resetAnimation,
} from "./Shared/freeAnimationHelper";

export function textClipSlideRightAnim() {
  let allElements;

  function handler(e) {
    const sections = e.detail["wcf-text-clip-slide-right-free-animation"] || [];

    // Organizing elements data by trigger type.
    allElements = handleOrganizedSectionByTriggerType(sections);

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
  document.addEventListener("aae-reset-animation", () => {
    if (allElements) {
      resetAnimation(allElements);
    }
  });

  return { destroy: resetAnimation };
}
textClipSlideRightAnim();
