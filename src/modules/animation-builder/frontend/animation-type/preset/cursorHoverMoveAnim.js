export function cursorHoverMoveAnim() {
  let sTimeline = {};
  let sItemClass = [];
  let eventListeners = [];

  const handler = (e) => {
    (e.detail["wcf-cursor-hover-move-animation"] || []).forEach((section) => {
      const { itemClass, moveX, moveY, duration } = section || {};

      if (!itemClass) return;

      const windowWidth = window.innerWidth;
      const windowHeight = window.innerHeight;

      document.querySelectorAll(itemClass).forEach((itemEl) => {
        sItemClass.push(itemEl);

        const mouseMoveHandler = (evt) => {
          const xPosPercent = evt.clientX / windowWidth - 0.5;
          const yPosPercent = evt.clientY / windowHeight - 0.5;

          const config = {
            x: xPosPercent * (moveX || 0),
            y: yPosPercent * (moveY || 0),
            ease: "power3.out",
            duration: Number(duration)
          };

          gsap.to(itemEl, config);
        };

        const mouseEnterHandler = () => {
          itemEl.addEventListener("mousemove", mouseMoveHandler);
        };

        const mouseLeaveHandler = () => {
          itemEl.removeEventListener("mousemove", mouseMoveHandler);

          gsap.to(itemEl, {
            x: 0,
            y: 0,
            ease: "power3.out",
            duration: 0.6
          });
        };

        itemEl.addEventListener("mouseenter", mouseEnterHandler);
        itemEl.addEventListener("mouseleave", mouseLeaveHandler);

        eventListeners.push({
          element: itemEl,
          enterHandler: mouseEnterHandler,
          leaveHandler: mouseLeaveHandler,
          moveHandler: mouseMoveHandler
        });

        sTimeline[`${section.id}-${Math.random()}`] = true;
      });
    });
  };

  function removeAnimation() {
    for (let x in sTimeline) {
      delete sTimeline[x];
    }

    eventListeners.forEach(({ element, enterHandler, leaveHandler, moveHandler }) => {
      element.removeEventListener("mouseenter", enterHandler);
      element.removeEventListener("mouseleave", leaveHandler);
      element.removeEventListener("mousemove", moveHandler);
    });

    sItemClass?.forEach((itemEl) => {
      gsap.set(itemEl, { clearProps: "all" });
    });

    sTimeline = {};
    sItemClass = [];
    eventListeners = [];
  }

  document.addEventListener("aae-animation-event", handler);
  document.addEventListener("aae-reset-animation", removeAnimation);
}

cursorHoverMoveAnim();