import { freeAnimClassMapping } from "@/register/freeAnimClassMapping";

export function containerSwashInAnim() {
  let allElements = new Map();

  function handleOnScrollAnimation({ elements = [] }) {
    if (!WCFFreeAnimBuilder) {
      console.error("LOG: Free animation event handler not found!");
      return;
    }
    WCFFreeAnimBuilder.triggerOnScrollObserver(elements);
  }

  function handlePageLoadAnimation() {}

  function handlePlayWithScroll() {}

  function handleHoverAnimation() {}

  function handleClickAnimation() {}

  // TODO: Work on replay function . and remove observer on reset animation
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

    if (allOnScrollElements?.length > 0) {
      handleOnScrollAnimation({ elements: allOnScrollElements });
    }

    return;
    sections.forEach((section) => {
      const {
        enable,
        id,
        itemClass,
        preset,
        presetGroup,
        title,
        triggerType,
        styles,
        type,
      } = section || {};

      const elements = document.querySelectorAll(itemClass) || [];

      console.log({ elements });

      if (!itemClass || !elements?.length || !animationClasses?.length) return;

      // storing preview animation information for removing animation purpose
      allElements = elements;

      // handle animations based on trigger type
      switch (triggerType) {
        case "on_scroll":
          handleOnScrollAnimation({
            trigger: itemClass,
            classToAdd: animationClasses,
            styles,
          });
          break;
        case "page_load":
          break;
        case "play_with_scroll":
          break;
        case "hover":
          break;
        case "click":
          break;
        default:
          break;
      }
    });
  }

  function resetAnimation(e) {
    console.log("Testng reset");
  }

  // wordpress events
  document.addEventListener("aae-animation-event", handler);
  document.addEventListener("aae-reset-animation", resetAnimation);

  return { destroy: resetAnimation };
}
containerSwashInAnim();
