export function headerStickyAnim() {
  let sTimeline = {};
  let sItemClass = [];
  let scrollStates = {};

  function convertToPixels(value) {
    if (typeof value === "number") return value;

    if (/^\d+(\.\d+)?$/.test(value)) return parseFloat(value);

    const el = document.createElement("div");
    el.style.position = "absolute";
    el.style.visibility = "hidden";
    el.style.height = value;
    document.body.appendChild(el);

    const px = el.offsetHeight;
    document.body.removeChild(el);

    return px;
  }

  const handler = (e) => {
    (e.detail["wcf-header-sticky-animation"] || []).forEach((section) => {
      let { itemClass, endClass, startPosition = 0, zIndex = 9999, styleClass, ease, upScroll, duration } = section || {};

      if (!itemClass) return;

      function isScrollSmootherActive() {
        if (typeof window.ScrollSmoother === "undefined") {
          return false;
        }

        const smoother = window.ScrollSmoother.get();
        return !!smoother;
      }

      const defaultTop = 0;
      const defaultDuration = duration;
      const calculatedPosition = convertToPixels(startPosition)
      const calculateItemPosition = isScrollSmootherActive() ? calculatedPosition : 0



      const item = document.querySelector(itemClass);
      const itemClone = item.cloneNode(true);

      if (styleClass && typeof styleClass === "string") {
        const cleanClass = styleClass.replace(/^[.#]/, "");
        itemClone.classList.add(cleanClass);
      }

      const wrapper = document.createElement("div");
      wrapper.style.position = "relative";
      wrapper.style.width = "100%";
      wrapper.style.zIndex = zIndex


      item.parentNode.insertBefore(wrapper, item);
      wrapper.appendChild(item);
      wrapper.appendChild(itemClone);


      if (!endClass && endClass === '') {
        endClass = '.wcf-ab-pin-end-selector-26'
      }


      gsap.set(itemClone, {
        position: 'absolute',
        width: "100%",
        top: 0,
        left: 0,
        right: 0,
        zIndex,
        opacity: 0,
        y: defaultTop,
        transition: "none",
        willChange: "transform, opacity",
      });

      if (upScroll) {
        const sectionId = section.id;
        scrollStates[sectionId] = {
          lastScrollY: window.scrollY,
          isVisible: false,
          isInRange: false
        };

        const stickyTimeline = gsap.timeline({
          scrollTrigger: {
            trigger: wrapper,
            endTrigger: endClass,
            pin: wrapper,
            start: `top+=${calculatedPosition} top`,
            end: "bottom bottom-=600",
            pinSpacing: false,
            invalidateOnRefresh: true,
            onEnter: () => {
              scrollStates[sectionId].isInRange = true;
              scrollStates[sectionId].lastScrollY = window.scrollY;

              gsap.to(item, {
                opacity: 0,
              });
            },
            onLeave: () => {
              scrollStates[sectionId].isInRange = false;
              scrollStates[sectionId].isVisible = false;

              gsap.killTweensOf(itemClone);
              gsap.to(itemClone, {
                y: defaultTop,
                opacity: 0,
                duration: defaultDuration,
                ease,
                overwrite: true
              });

              gsap.to(item, {
                opacity: 1,
              });

            },
            onEnterBack: () => {
              scrollStates[sectionId].isInRange = true;
              scrollStates[sectionId].lastScrollY = window.scrollY;

              gsap.to(item, {
                opacity: 0,
              });
            },
            onLeaveBack: () => {
              scrollStates[sectionId].isInRange = false;
              scrollStates[sectionId].isVisible = false;

              gsap.killTweensOf(itemClone);
              gsap.to(itemClone, {
                y: defaultTop,
                opacity: 0,
                duration: defaultDuration,
                ease,
                overwrite: true
              });

              gsap.to(item, {
                opacity: 1,
              });

            },
          },
        });

        const scrollHandler = () => {
          if (!scrollStates[sectionId].isInRange) return;

          const currentScrollY = window.scrollY;
          const scrollDiff = currentScrollY - scrollStates[sectionId].lastScrollY;
          const isScrollingUp = scrollDiff < -5;
          const isScrollingDown = scrollDiff > 5;

          if (isScrollingUp && !scrollStates[sectionId].isVisible) {
            gsap.killTweensOf(itemClone);
            gsap.to(itemClone, {
              y: calculateItemPosition,
              opacity: 1,
              duration: defaultDuration,
              ease,
              overwrite: true
            });
            scrollStates[sectionId].isVisible = true;
          } else if (isScrollingDown && scrollStates[sectionId].isVisible) {
            gsap.killTweensOf(itemClone);
            gsap.to(itemClone, {
              y: defaultTop,
              opacity: 0,
              duration: defaultDuration,
              ease,
              overwrite: true
            });
            scrollStates[sectionId].isVisible = false;
          }

          scrollStates[sectionId].lastScrollY = currentScrollY;
        };

        window.addEventListener('scroll', scrollHandler, { passive: true });

        stickyTimeline.scrollHandler = scrollHandler;

        sTimeline[section.id] = stickyTimeline;
      } else {
        let lastScrollY = window.scrollY;
        const stickyTimeline = gsap.timeline({
          scrollTrigger: {
            trigger: wrapper,
            endTrigger: endClass,
            pin: wrapper,
            pinType: "transform",
            anticipatePin: 1,
            start: `top+=${calculatedPosition} top`,
            end: "bottom bottom-=600",
            pinSpacing: false,
            invalidateOnRefresh: true,
            onEnter: () => {
              gsap.killTweensOf(itemClone);
              gsap.to(itemClone, {
                y: calculateItemPosition,
                opacity: 1,
                duration: defaultDuration,
                ease,
                overwrite: true
              });

              gsap.to(item, {
                opacity: 0,
              });
            },
            onLeave: () => {
              gsap.killTweensOf(itemClone);
              gsap.to(itemClone, {
                y: defaultTop,
                opacity: 0,
                duration: defaultDuration,
                ease,
                overwrite: true
              });

              gsap.to(item, {
                opacity: 1,
              });
            },
            onEnterBack: () => {
              gsap.killTweensOf(itemClone);
              gsap.to(itemClone, {
                y: calculateItemPosition,
                opacity: 1,
                duration: defaultDuration,
                ease,
                overwrite: true
              });

              gsap.to(item, {
                opacity: 0,
              });
            },
            onLeaveBack: () => {
              gsap.killTweensOf(itemClone);
              gsap.to(itemClone, {
                y: defaultTop,
                opacity: 0,
                duration: defaultDuration,
                ease,
                overwrite: true
              });

              gsap.to(item, {
                opacity: 1,
              });
            },
          },
        });

        sTimeline[section.id] = stickyTimeline;

        const scrollHandler = () => {
          const currentScrollY = window.scrollY;
          const scrollDiff = currentScrollY - lastScrollY;
          const isScrollingDown = scrollDiff > 5;

          if (isScrollingDown) {
            gsap.to(itemClone, {
              y: calculateItemPosition,
            });
          }
          lastScrollY = currentScrollY;

        };

        window.addEventListener('scroll', scrollHandler, { passive: true });
        window.stickyScrollHandler = scrollHandler;
      }


    });
  };

  function removeAnimation() {
    for (let x in sTimeline) {
      if (sTimeline[x].scrollHandler) {
        window.removeEventListener('scroll', sTimeline[x].scrollHandler);
      }
      sTimeline[x].revert();
      sTimeline[x].kill();
    }

    sItemClass?.forEach((itemClass) => {
      itemClass.remove();
    });

    scrollStates = {};
  }

  document.addEventListener("aae-animation-event", handler);
  document.addEventListener("aae-reset-animation", removeAnimation);
}

headerStickyAnim();