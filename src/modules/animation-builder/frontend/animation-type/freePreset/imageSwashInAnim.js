import {
  handleOnScrollAnimation,
  handleOrganizedSectionByTriggerType,
  handlePageLoadAnimation,
  resetAnimation,
} from "./Shared/freeAnimationHelper";

export function generalSwashInAnim() {
  let allElements;

  function handler(e) {
    const sections = e.detail["wcf-image-swash-in-free-animation"] || [];

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
    // callback need to get latest value. by default event listener register allelements by undefined!
    if (allElements) {
      resetAnimation(allElements);
    }
  });

  return { destroy: resetAnimation };
}
generalSwashInAnim();
