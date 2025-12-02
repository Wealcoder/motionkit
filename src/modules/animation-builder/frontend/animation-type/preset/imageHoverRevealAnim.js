export function imageHoverRevealAnim() {
  let sTimeline = {};
  let sItemClass = [];
  let cursorImages = [];
  let eventListeners = [];

  const handler = (e) => {
    (e.detail["wcf-image-hover-reveal-animation"] || []).forEach((section) => {
      const {
        itemClass,
        imageUrl,
        imageWidth,
        imageHeight,
        zIndex,
        animationPosition
      } = section || {};

      if (!(itemClass && imageUrl)) return;

      gsap.set(itemClass, {
        transition: "none"
      })

      document.querySelectorAll(itemClass).forEach((itemEl) => {
        sItemClass.push(itemEl);

        const cursorImg = document.createElement("div");

        const width = imageWidth?.includes('px') ? imageWidth : `${imageWidth || 300}px`;
        const height = imageHeight?.includes('px') ? imageHeight : `${imageHeight || 300}px`;

        cursorImg.style.cssText = `
          position: absolute;
          width: ${width};
          height: ${height};
          background-image: url('${imageUrl}');
          background-size: cover;
          background-position: center;
          background-repeat: no-repeat;
          pointer-events: none;
          z-index: ${zIndex || 999};
          border-radius: 8px;
          top: 0;
          left: 0;
          will-change: transform;
        `;

        const parentEl = itemEl.parentElement;
        if (parentEl) {
          const parentPosition = window.getComputedStyle(parentEl).position;
          if (parentPosition === 'static') {
            parentEl.style.position = 'relative';
          }

          parentEl.appendChild(cursorImg);
          cursorImages.push(cursorImg);
        }

        let initialPosition = { scale: 0, opacity: 0 };

        switch (animationPosition) {
          case "center":
            initialPosition.xPercent = -50;
            initialPosition.yPercent = -50;
            break;
          case "left":
            initialPosition.xPercent = -100;
            initialPosition.yPercent = -50;
            break;
          case "right":
            initialPosition.xPercent = 0;
            initialPosition.yPercent = -50;
            break;
          case "top":
            initialPosition.xPercent = -50;
            initialPosition.yPercent = -100;
            break;
          case "bottom":

            initialPosition.xPercent = -50;
            initialPosition.yPercent = 0;
            break;
          default:
            initialPosition.xPercent = -50;
            initialPosition.yPercent = -50;
        }

        gsap.set(cursorImg, {
          ...initialPosition,
          force3D: true
        });

        const setCursorX = gsap.quickTo(cursorImg, "x", {
          duration: 0.6,
          ease: "expo"
        });

        const setCursorY = gsap.quickTo(cursorImg, "y", {
          duration: 0.6,
          ease: "expo"
        });

        const mouseMoveHandler = (evt) => {
          const parentRect = parentEl.getBoundingClientRect();
          const relativeX = evt.clientX - parentRect.left;
          const relativeY = evt.clientY - parentRect.top;

          setCursorX(relativeX);
          setCursorY(relativeY);
        };

        const tl = gsap.timeline({
          paused: true
        });

        tl.to(cursorImg, {
          scale: 1,
          opacity: 1,
          duration: 0.5,
          ease: "expo.inOut"
        });

        const mouseEnterHandler = () => {
          itemEl.addEventListener("mousemove", mouseMoveHandler);
          tl.play();
        };

        const mouseLeaveHandler = () => {
          itemEl.removeEventListener("mousemove", mouseMoveHandler);
          tl.reverse();
        };

        itemEl.addEventListener("mouseenter", mouseEnterHandler);
        itemEl.addEventListener("mouseleave", mouseLeaveHandler);

        eventListeners.push({
          element: itemEl,
          enterHandler: mouseEnterHandler,
          leaveHandler: mouseLeaveHandler,
          moveHandler: mouseMoveHandler
        });

        sTimeline[`${section.id}-${Math.random()}`] = tl;
      });
    });
  };

  function removeAnimation() {
    for (let x in sTimeline) {
      sTimeline[x].kill();
    }

    eventListeners.forEach(({ element, enterHandler, leaveHandler, moveHandler }) => {
      element.removeEventListener("mouseenter", enterHandler);
      element.removeEventListener("mouseleave", leaveHandler);
      element.removeEventListener("mousemove", moveHandler);
    });

    cursorImages.forEach((img) => {
      img.remove();
    });

    sItemClass?.forEach((itemEl) => {
      gsap.set(itemEl, { clearProps: "all" });
    });

    sTimeline = {};
    sItemClass = [];
    cursorImages = [];
    eventListeners = [];
  }

  document.addEventListener("aae-animation-event", handler);
  document.addEventListener("aae-reset-animation", removeAnimation);
}

imageHoverRevealAnim();