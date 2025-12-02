export function horizontalScrollAnim() {
  let sTimeline = {};
  let sContainerClass = [];
  let sItemClass = [];

  function convertToPixels(value) {
    if (value.endsWith("px")) {
      return parseFloat(value);
    } else if (value.endsWith("vw")) {
      return (parseFloat(value) / 100) * window.innerWidth;
    } else if (value.endsWith("%")) {
      return (parseFloat(value) / 100) * window.innerWidth;
    } else {
      console.warn("Unsupported unit in itemWidth:", value);
      return 0;
    }
  }

  const handler = (e) => {
    (e.detail["wcf-horizontal-scroll-animation"] || []).forEach((section) => {
      const {
        containerClass,
        containerHeight,
        itemClass,
        itemWidth,
        itemWidthType,
        itemsWidth,
      } = section || {};

      if (!(containerClass && containerHeight && itemClass)) return;

      const containerEl = document.querySelector(containerClass);
      if (!containerEl) return;

      const items = Array.from(containerEl.querySelectorAll(itemClass));
      const itemCount = items.length;
      if (!itemCount) return;

      let widthsPx;
      if (itemWidthType === "custom" && itemsWidth.length) {
        widthsPx = itemsWidth
          .slice(0, itemCount)
          .map((w) => convertToPixels(w));
      } else {
        const def = convertToPixels(itemWidth);
        widthsPx = new Array(itemCount).fill(def);
      }

      const totalWidth = widthsPx.reduce((sum, w) => sum + w, 0);
      const totalScrollPx = totalWidth - containerEl.offsetWidth;

      gsap.set(containerClass, {
        width: totalScrollPx,
        height: containerHeight,
        transition: "none",
      });

      items.forEach((el, i) =>
        gsap.set(el, { width: widthsPx[i], flexShrink: 0 })
      );

      const hzTimeline = gsap.timeline({
        scrollTrigger: {
          trigger: containerClass,
          pin: true,
          start: "top top",
          end: "bottom bottom",
          // end: `+=${totalScrollPx}`,
          scrub: true,
          pinSpacing: false,
        },
      });

      hzTimeline.to(items, { x: () => -totalScrollPx });

      sTimeline[section.id] = hzTimeline;
      sContainerClass.push(containerClass);
      sItemClass.push(itemClass);
    });
  };

  function removeAnimation() {
    for (let x in sTimeline) {
      sTimeline[x].revert();
      sTimeline[x].kill();
    }

    sContainerClass?.forEach((containerClass) => {
      gsap.set(containerClass, { clearProps: "all" });
    });

    sItemClass?.forEach((itemClass) => {
      gsap.set(itemClass, { clearProps: "all" });
    });
  }

  document.addEventListener("aae-animation-event", handler);

  document.addEventListener("aae-reset-animation", removeAnimation);
}

horizontalScrollAnim();
