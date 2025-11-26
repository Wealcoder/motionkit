export function textInvertAnim() {
  let sTimeline = {};
  let sSplitText = [];

  const handler = (e) => {
    (e.detail["wcf-text-invert-animation"] || []).forEach((section) => {
      const {
        triggerClass,
        itemClass,
        start,
        startCustom,
        end,
        endCustom,
        markers = false,
      } = section || {};

      if (!itemClass) return;

      const elements = document.querySelectorAll(itemClass);
      elements.forEach((element, index) => {
        // Create SplitText instance
        const split = new SplitText(element, {
          type: "lines",
          linesClass: "invert-line",
        });

        // Create timeline for the animation
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: triggerClass || itemClass,
            start: start === 'custom' ? startCustom : start,
            end: end === 'custom' ? endCustom : end,
            scrub: 1,
            markers: markers === 'true' ? true : false,
          },
        });

        // Animate each line with opacity
        const lines = element.querySelectorAll(".invert-line");
        tl.from(lines, {
          opacity: 0.2,
          ease: "none",
          stagger: 0.1,
        });

        // Store references for cleanup
        const uniqueId = `${section.id}_${index}`;
        sTimeline[uniqueId] = { timeline: tl, split };
        sSplitText.push(split);
      });
    });
  };

  function removeAnimation() {
    // Clean up timelines and SplitText instances
    for (let x in sTimeline) {
      const { timeline, split } = sTimeline[x];

      if (timeline) {
        timeline.revert();
        timeline.kill();
      }

      if (split) {
        split.revert();
      }
    }

    // Clear arrays
    sTimeline = {};
    sSplitText = [];
  }

  // Event listeners
  document.addEventListener("aae-animation-event", handler);
  document.addEventListener("aae-reset-animation", removeAnimation);

  // Return cleanup function
  return {
    destroy: removeAnimation
  };
}

// Initialize the animation
textInvertAnim();