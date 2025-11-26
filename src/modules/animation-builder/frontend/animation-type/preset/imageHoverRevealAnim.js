export function imageHoverRevealAnim() {
  let sTimeline = {};
  let sItemClass = [];
  let cursorImages = []; // Store cursor image elements
  let eventListeners = []; // Store event listeners for cleanup

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

      // Query all matching items
      document.querySelectorAll(itemClass).forEach((itemEl) => {
        // Store selectors for reset
        sItemClass.push(itemEl);

        // Create cursor image element
        const cursorImg = document.createElement("div");

        // Parse dimensions properly
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

        // Insert into parent element and ensure parent has position context
        const parentEl = itemEl.parentElement;
        if (parentEl) {
          // Ensure parent has position context
          const parentPosition = window.getComputedStyle(parentEl).position;
          if (parentPosition === 'static') {
            parentEl.style.position = 'relative';
          }

          parentEl.appendChild(cursorImg);
          cursorImages.push(cursorImg);
        }

        // Set initial position based on animationPosition
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

        // Set initial state with force3D for better performance
        gsap.set(cursorImg, {
          ...initialPosition,
          force3D: true
        });

        // Create quickTo methods for smooth cursor movement
        const setCursorX = gsap.quickTo(cursorImg, "x", {
          duration: 0.6,
          ease: "expo"
        });

        const setCursorY = gsap.quickTo(cursorImg, "y", {
          duration: 0.6,
          ease: "expo"
        });

        // Mouse move handler for this specific item
        const mouseMoveHandler = (evt) => {
          // Get parent element's bounding rect for relative positioning
          const parentRect = parentEl.getBoundingClientRect();
          const relativeX = evt.clientX - parentRect.left;
          const relativeY = evt.clientY - parentRect.top;

          setCursorX(relativeX);
          setCursorY(relativeY);
        };

        // Create timeline for scale animation
        const tl = gsap.timeline({
          paused: true
        });

        tl.to(cursorImg, {
          scale: 1,
          opacity: 1,
          duration: 0.5,
          ease: "expo.inOut"
        });

        // Mouse enter handler
        const mouseEnterHandler = () => {
          itemEl.addEventListener("mousemove", mouseMoveHandler);
          tl.play();
        };

        // Mouse leave handler
        const mouseLeaveHandler = () => {
          itemEl.removeEventListener("mousemove", mouseMoveHandler);
          tl.reverse();
        };

        // Add event listeners
        itemEl.addEventListener("mouseenter", mouseEnterHandler);
        itemEl.addEventListener("mouseleave", mouseLeaveHandler);

        // Store for cleanup
        eventListeners.push({
          element: itemEl,
          enterHandler: mouseEnterHandler,
          leaveHandler: mouseLeaveHandler,
          moveHandler: mouseMoveHandler
        });

        // Store timeline for cleanup
        sTimeline[`${section.id}-${Math.random()}`] = tl;
      });
    });
  };

  function removeAnimation() {
    // Kill all timelines
    for (let x in sTimeline) {
      sTimeline[x].kill();
    }

    // Remove all event listeners
    eventListeners.forEach(({ element, enterHandler, leaveHandler, moveHandler }) => {
      element.removeEventListener("mouseenter", enterHandler);
      element.removeEventListener("mouseleave", leaveHandler);
      element.removeEventListener("mousemove", moveHandler);
    });

    // Remove cursor images
    cursorImages.forEach((img) => {
      img.remove();
    });

    // Clear stored items
    sItemClass?.forEach((itemEl) => {
      gsap.set(itemEl, { clearProps: "all" });
    });

    // Reset arrays
    sTimeline = {};
    sItemClass = [];
    cursorImages = [];
    eventListeners = [];
  }

  document.addEventListener("aae-animation-event", handler);
  document.addEventListener("aae-reset-animation", removeAnimation);
}

imageHoverRevealAnim();