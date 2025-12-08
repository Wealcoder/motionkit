import {
  handleAddClassName,
  handleRemoveClassName,
  onScrollTrigger,
} from "@/lib/freeAnimHelper";
import { freeAnimClassMapping } from "@/register/freeAnimClassMapping";

export function containerSwashInAnim() {
  let allElements = [];

  function handleOnScrollAnimation({
    elements = [],
    trigger = "",
    classToAdd = [],
    styles = {},
  }) {
    if (!trigger) return;
    onScrollTrigger(
      trigger,
      () => {
        handleAddClassName(elements, classToAdd, styles);
      },
      0.2
    );
  }

  function handlePageLoadAnimation() {}

  function handlePlayWithScroll() {}

  function handleHoverAnimation() {}

  function handleClickAnimation() {}

  function handler(e) {
    const sections = e.detail["wcf-general-swash-in-free-animation"] || [];
    sections.forEach((section) => {
      const {
        enable,
        id,
        itemClass,
        preset,
        presetGroup,
        title,
        triggerClass,
        triggerType,
        styles,
        type,
      } = section || {};

      const elements = document.querySelectorAll(itemClass) || [];
      const animationClasses = freeAnimClassMapping(preset);
      const currentTriggerClass = triggerClass || itemClass;

      if (!itemClass || !elements?.length || !animationClasses?.length) return;

      // storing preview animation information for removing animation purpose
      allElements = elements;

      // handle animations based on trigger type
      switch (triggerType) {
        case "on_scroll":
          handleOnScrollAnimation({
            elements,
            trigger: currentTriggerClass,
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
    handleRemoveClassName(allElements, ["magictime", "swashIn"]);
    allElements = null;
  }

  // wordpress events
  document.addEventListener("aae-animation-event", handler);
  document.addEventListener("aae-reset-animation", resetAnimation);

  return { destroy: resetAnimation };
}
containerSwashInAnim();
