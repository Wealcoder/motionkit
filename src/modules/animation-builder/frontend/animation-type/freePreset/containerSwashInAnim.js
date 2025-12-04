export function containerSwashInAnim() {
  function handler(e) {
    const sections = e.detail["wcf-container-swash-in-free-animation"] || [];
    sections.forEach((sections) => {
      const { id, triggerClass, itemClass, delay, duration, repeat } =
        sections || {};

      console.log("swashInFreeAnim", {
        id,
        triggerClass,
        itemClass,
        delay,
        duration,
        repeat,
      });

      // validating itemclass
      if (!itemClass || !document.querySelector(itemClass)) return;
    });
  }

  const resetAnimation = () => {};

  // wordpress events
  document.addEventListener("aae-animation-event", handler);
  document.addEventListener("aae-reset-animation", resetAnimation);

  return { destroy: resetAnimation };
}
containerSwashInAnim();
