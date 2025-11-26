export function imageScaleAnim() {
  let sTimeline = {};
  let sContainerClass = [];
  let sItemClass = [];

  const handler = (e) => {
    (e.detail["wcf-image-scale-animation"] || []).forEach((section) => {
      const {
        containerClass,
        containerHeight,
        itemClass,
        scale,
        transformOrigin,
        animationStart,
        animationCStart,
        animationEnd,
        animationCEnd,
        ease,
        playOnScroll
      } = section || {};

      if (!(containerClass && containerHeight && itemClass)) return;

      const containerEl = document.querySelector(containerClass);
      if (!containerEl) return;

      gsap.set(containerEl, {
        height: containerHeight,
        transition: "none",
      });

      gsap.set(itemClass, {
        maxHeight: "100vh",
        objectFit: "cover",
      });

      const scaleTimeline = gsap.timeline({
        scrollTrigger: {
          trigger: containerEl,
          pin: true,
          start: animationStart === 'custom' ? animationCStart : animationStart,
          end: animationEnd === 'custom' ? animationCEnd : animationEnd,
          scrub: playOnScroll,
          pinSpacing: false,
        },
      });

      scaleTimeline.from(itemClass, { scale, transformOrigin, ease })

      sTimeline[section.id] = scaleTimeline;
      sContainerClass.push(containerEl);
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

imageScaleAnim();
