export function containerSwashInAnim() {
  function handler(e) {
    const sections = e.detail["wcf-general-swash-in-free-animation"] || [];
    sections.forEach((sections) => {
      const elements = document.querySelectorAll(sections?.itemClass);
      console.log({ elements, document, sections });
      elements.forEach((item) => {
        item.classList.add("magictime", "swashIn");
      });

      // if (!itemClass || !document.querySelector(itemClass)) return;
    });
  }

  const resetAnimation = () => {};

  // wordpress events
  document.addEventListener("aae-animation-event", handler);
  document.addEventListener("aae-reset-animation", resetAnimation);

  return { destroy: resetAnimation };
}
containerSwashInAnim();
