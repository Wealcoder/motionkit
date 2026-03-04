export function imageStretchAnim() {
  let sTimeline = {};
  let sContainerClass = [];
  let sItemClass = [];

  const handler = (e) => {
    (e.detail["wcf-image-stretch-animation"] || []).forEach((section) => {
      const {
        containerClass,
        containerHeight,
        itemClass,
        itemMaxWidth,
        itemMinWidth,
        itemHeight,
        start,
        startCustom,
        end,
        endCustom,
        objectFit,
        markers
      } = section || {};

      if (!(containerClass && containerHeight && itemClass)) return;

      const containerEl = document.querySelector(containerClass);
      if (!containerEl) return;

      gsap.set(containerClass, {
        height: containerHeight,
        transition: "none",
      });
      gsap.set(itemClass, { objectFit, width: itemMinWidth, height: itemHeight });

      const istTimeline = gsap.timeline({
        scrollTrigger: {
          trigger: containerClass,
          pin: true,
          start: start === "custom" ? startCustom : start || "top top",
          end: end === "custom" ? endCustom : end || "bottom bottom",
          scrub: true,
          pinSpacing: false,
          markers: markers === "true" ? true : false
        },
      });

      istTimeline.to(itemClass, { width: itemMaxWidth ?? '100%' });

      sTimeline[section.id] = istTimeline;
      sContainerClass.push(containerClass);
      sItemClass.push(itemClass);

    });
  };

  function removeAnimation() {
    for (let x in sTimeline) {
      sTimeline[x].revert();
      sTimeline[x].kill();
    }


    sContainerClass?.forEach((containerEl) => {
      gsap.set(containerEl, { clearProps: "all" });
    });
    sItemClass?.forEach((itemEl) => {
      gsap.set(itemEl, { clearProps: "all" });
    });
  }

  document.addEventListener("aae-animation-event", handler);
  document.addEventListener("aae-reset-animation", removeAnimation);
}

imageStretchAnim();
