import { VOID_ELEMENTS } from "../../../config/VoidElement";

export function cursorHoverRevealAnim() {
  let sTimeline = {};
  let sItemClass = [];
  let cursorElements = [];
  let eventListeners = [];

  const handler = (e) => {
    (e.detail["wcf-cursor-hover-reveal-animation"] || []).forEach((section) => {
      const {
        itemClass,
        viewText,
        textColor,
        backgroundColor = '#000000',
        backgroundWidth = 70,
        backgroundHeight = 70,
        borderType,
        borderWidth,
        borderColor = '#000000',
        borderRadius,
        zIndex = 999
      } = section || {};


      if (!(itemClass && viewText)) return;

      document.querySelectorAll(itemClass).forEach((originalEl) => {
        const isVoid = VOID_ELEMENTS.has(originalEl.tagName);

        const itemEl = isVoid
          ? originalEl.parentElement
          : originalEl;

        if (!itemEl) return;

        if (isVoid && originalEl.tagName === "IMG") {
          originalEl.style.display = "block";
        }


        sItemClass.push(itemEl);

        const cursorEl = document.createElement("div");

        const width = backgroundWidth?.includes('px') ? backgroundWidth : `${backgroundWidth}px`;
        const height = backgroundHeight?.includes('px') ? backgroundHeight : `${backgroundHeight}px`;
        const radius = borderRadius?.includes('px') ? borderRadius : `${borderRadius || 50}px`;

        let borderStyle = '';
        if (borderType && borderType !== 'none' && borderWidth) {
          const bWidth = borderWidth?.includes('px') ? borderWidth : `${borderWidth}px`;
          borderStyle = `border: ${bWidth} ${borderType} ${borderColor};`;
        }

        cursorEl.style.cssText = `
          position: absolute;
          width: ${width};
          height: ${height};
          background-color: ${backgroundColor};
          color: ${textColor || '#ffffff'};
          pointer-events: none;
          z-index: ${zIndex};
          border-radius: ${radius};
          ${borderStyle}
          top: 0;
          left: 0;
          will-change: transform;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          font-weight: 500;
          text-align: center;
          padding: 8px;
          box-sizing: border-box;
        `;

        cursorEl.textContent = viewText;

        const itemPosition = window.getComputedStyle(itemEl).position;
        if (itemPosition === 'static') {
          itemEl.style.position = 'relative';
        }

        itemEl.appendChild(cursorEl);
        cursorElements.push(cursorEl);

        const initialPosition = {
          xPercent: -50,
          yPercent: -50,
          scale: 0,
          opacity: 0
        };

        gsap.set(cursorEl, {
          ...initialPosition,
          force3D: true
        });

        const setCursorX = gsap.quickTo(cursorEl, "x", {
          duration: 0.6,
          ease: "expo"
        });

        const setCursorY = gsap.quickTo(cursorEl, "y", {
          duration: 0.6,
          ease: "expo"
        });

        const mouseMoveHandler = (evt) => {
          const itemRect = itemEl.getBoundingClientRect();
          const relativeX = evt.clientX - itemRect.left;
          const relativeY = evt.clientY - itemRect.top;

          setCursorX(relativeX);
          setCursorY(relativeY);
        };

        const tl = gsap.timeline({
          paused: true
        });

        tl.to(cursorEl, {
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

    cursorElements.forEach((el) => {
      el.remove();
    });

    sItemClass?.forEach((itemEl) => {
      gsap.set(itemEl, { clearProps: "all" });
    });

    sTimeline = {};
    sItemClass = [];
    cursorElements = [];
    eventListeners = [];
  }

  document.addEventListener("aae-animation-event", handler);
  document.addEventListener("aae-reset-animation", removeAnimation);
}

cursorHoverRevealAnim();