export function imageRevealAnim() {
  let sTimeline = {};
  let sContainerClass = [];
  let sItemClass = [];

  const handler = (e) => {
    (e.detail["wcf-image-reveal-animation"] || []).forEach((section) => {
      const {
        triggerClass,
        triggerType,
        itemClass,
        delay,
        duration,
        animationTo,
        animationStart,
        animationCStart,
        ease
      } = section || {};

      if (!itemClass) return;

      document.querySelectorAll(itemClass).forEach((itemEl) => {
        const containerEl = itemEl.parentElement;

        if (!containerEl) return;

        sContainerClass.push(containerEl);
        sItemClass.push(itemEl);


        gsap.set(containerEl, {
          autoAlpha: 1,
          overflow: "hidden",
          transition: "none",
        });
        gsap.set(itemEl, {
          overflow: "hidden",
          objectFit: "cover",
        });

        const imgrTimeline = triggerType !== 'page_load' ? gsap.timeline({
          delay,
          scrollTrigger: {
            trigger: triggerClass || containerEl,
            start: animationStart === 'custom' ? animationCStart : animationStart,
            scrub: triggerType === "play_with_scroll"
          },
        }) : gsap.timeline({
          delay
          
        });

        let contentAnim = { ease, duration: 1.5 + duration };
        let imageAnim = { scale: 1.3, delay: -1.5 - duration, ease, duration: 1.5 + duration };

        switch (animationTo) {
          case "left":
            contentAnim.xPercent = -100;
            imageAnim.xPercent = 100;
            break;
          case "right":
            contentAnim.xPercent = 100;
            imageAnim.xPercent = -100;
            break;
          case "top":
            contentAnim.yPercent = -100;
            imageAnim.yPercent = 100;
            break;
          case "bottom":
            contentAnim.yPercent = 100;
            imageAnim.yPercent = -100;
            break;
        }

        imgrTimeline.from(containerEl, contentAnim);
        imgrTimeline.from(itemEl, imageAnim);

        sTimeline[`${section.id}-${Math.random()}`] = imgrTimeline;
      });
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

imageRevealAnim();
