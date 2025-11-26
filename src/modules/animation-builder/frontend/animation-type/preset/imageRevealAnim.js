export function imageRevealAnim() {
  let sTimeline = {};
  let sContainerClass = [];
  let sItemClass = [];

  const handler = (e) => {
    (e.detail["wcf-image-reveal-animation"] || []).forEach((section) => {
      const {
        triggerClass,
        itemClass,
        animationTo,
        animationStart,
        animationCStart,
        ease
      } = section || {};

      if (!itemClass) return;

      // Query all matching items
      document.querySelectorAll(itemClass).forEach((itemEl) => {
        const containerEl = itemEl.parentElement; // first parent

        if (!containerEl) return;

        // Store selectors for reset
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

        const imgrTimeline = gsap.timeline({
          scrollTrigger: {
            trigger: triggerClass || containerEl,
            start: animationStart === 'custom' ? animationCStart : animationStart,
          },
        });

        let contentAnim = { ease };
        let imageAnim = { scale: 1.3, delay: -1.5, ease };

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

        imgrTimeline.from(containerEl, 1.5, contentAnim);
        imgrTimeline.from(itemEl, 1.5, imageAnim);

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
