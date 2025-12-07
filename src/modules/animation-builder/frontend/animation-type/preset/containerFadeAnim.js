export function containerFadeAnimation() {
  let containerClasses = [];
  let itemClasses = [];
  let activeTweens = new Map();

  // Helper functions
  function calculateFadeAxis(direction, offset = 40) {
    switch (direction) {
      case "top":
        return { x: 0, y: -offset };
      case "right":
        return { x: offset, y: 0 };
      case "bottom":
        return { x: 0, y: offset };
      case "left":
        return { x: -offset, y: 0 };
      case "zoom":
      default:
        return { x: 0, y: 0 };
    }
  }

  function runAnimation({
    config = {},
    secondaryConfig = {},
    target = "",
    method = "from",
  }) {
    let resolveCompleted;
    const isCompleted = new Promise((resolve) => (resolveCompleted = resolve));

    // handling gsap fromTo animation
    if (Object.keys(secondaryConfig)?.length) {
      const tween = gsap[method](target, config, {
        ...secondaryConfig,
        onComplete: () => resolveCompleted(true),
      });
      return { tween, isCompleted };
    }

    // handling general animation (from or To)
    const tween = gsap[method](target, {
      ...config,
      onComplete: () => resolveCompleted(true),
    });
    return { tween, isCompleted };
  }

  function handleKillAnimation(target) {
    if (window?.ScrollTrigger) {
      const animation = ScrollTrigger?.getById(target);
      if (animation) animation?.kill();
    }
    return;
  }

  function handleSetConfigAnimation({ config = {}, target = "" }) {
    if (!target) {
      console.error("Container Fade Animation: Target not found!");
      return;
    }
    gsap.set(target, config);
    return;
  }

  function handleCleanUpTweens(target, activeTweens) {
    if (typeof activeTweens !== "object" || !target) {
      console.error(
        "Container Fade Animation: Animation cleanup not working or target not found!"
      );
    }
    activeTweens.get(target).kill();
    activeTweens.delete(target);
    return;
  }

  // Animation functions
  function handleScrollAnimation({
    id,
    config,
    itemClass,
    triggerClass,
    start,
    end,
    markers,
  }) {
    // killing others animation
    handleKillAnimation(id);

    config.scrollTrigger = {
      id,
      trigger: triggerClass || itemClass,
      toggleActions: "play pause none pause",
      start: start || "top 80%",
      end: end || "bottom 20%",
      markers: markers === "true",
    };
    const { tween, isCompleted } = runAnimation({ config, target: itemClass });
    if (isCompleted) return tween;
    return;
  }

  function handlePageLoadAnimation(id, config, itemClass) {
    const intialConfig = { x: config.x, y: config.y, autoAlpha: 0 };
    handleSetConfigAnimation({ config: intialConfig, target: itemClass });

    const currentConfig = { ...config, x: 0, y: 0, autoAlpha: 1 };

    const { tween, isCompleted } = runAnimation({
      config: currentConfig,
      target: itemClass,
      method: "to",
    });

    if (isCompleted) return tween;
    return;
  }

  function handlePlayWithScroll({
    id,
    config,
    itemClass,
    triggerClass,
    start,
    end,
    markers,
  }) {
    // killing others animation
    handleKillAnimation();
    // preventing inital component render
    const fromConfig = {
      x: config.x,
      y: config.y,
      autoAlpha: 0,
      scrollTrigger: {
        markers: markers == "true",
      },
    };

    const toConfig = {
      x: 0,
      y: 0,
      autoAlpha: 1,
      stagger: config.stagger,
      ease: "none",
      scrollTrigger: {
        id,
        trigger: triggerClass || itemClass,
        scrub: 1,
        start: start || "top bottom",
        end: end || "bottom top",
        markers: markers === "true",
      },
    };

    const { tween, isCompleted } = runAnimation({
      config: fromConfig,
      secondaryConfig: toConfig,
      target: itemClass,
      method: "fromTo",
    });

    if (isCompleted) return tween;
    return;
  }

  function handleHoverAnimation(
    id = "",
    config = {},
    itemClass = "",
    triggerClass = "",
    activeTweens = {}
  ) {
    if (!triggerClass) {
      console.error("Container Fade Animation: Trigger class not found!");
      return;
    }

    const triggers = document.querySelectorAll(triggerClass);
    if (!triggers) {
      console.error("Container Fade Animation: Trigger elements not exits!");
      return;
    }

    // setting initial config
    const initialConfig = { x: config.x, y: config.y, autoAlpha: 0 };
    handleSetConfigAnimation({ config: initialConfig, target: itemClass });

    const mouseEnterConfig = {
      ...config,
      x: 0,
      y: 0,
      autoAlpha: 1,
    };

    const mouseLeaveConfig = {
      x: config.x,
      y: config.y,
      autoAlpha: 0,
      duration: config.duration * 0.6,
      stagger: config.stagger * 0.5,
      ease: config.ease,
    };

    triggers.forEach((triggerElement, index) => {
      const uniqueId = `${id}_hover_${index}`;
      const mouseEnter = () => {
        if (activeTweens.has(uniqueId)) {
          handleCleanUpTweens(uniqueId, activeTweens);
        }
        const { tween, isCompleted } = runAnimation({
          config: mouseEnterConfig,
          target: itemClass,
          method: "to",
        });
        if (isCompleted) activeTweens.set(uniqueId, tween);
        return;
      };

      const mouseLeave = () => {
        if (activeTweens.has(uniqueId)) {
          handleCleanUpTweens(uniqueId, activeTweens);
        }
        const { tween, isCompleted } = runAnimation({
          config: mouseLeaveConfig,
          target: itemClass,
          method: "to",
        });
        if (isCompleted) activeTweens.set(uniqueId, tween);
        return;
      };

      const newTriggerElement = triggerElement.cloneNode(true);
      triggerElement.parentNode.replaceChild(newTriggerElement, triggerElement);
      newTriggerElement.addEventListener("mouseenter", mouseEnter);
      newTriggerElement.addEventListener("mouseleave", mouseLeave);
    });
  }

  function handleClickAnimation(
    id = "",
    config = {},
    itemClass = "",
    triggerClass = "",
    activeTweens = {}
  ) {
    if (!triggerClass) {
      console.error("Container Fade Animation: Trigger class not found!");
      return;
    }
    const triggers = document.querySelectorAll(triggerClass);

    if (!triggers) {
      console.error("Container Fade Animation: Trigger elements not exits!");
      return;
    }

    triggers.forEach((triggerElement, index) => {
      const uniqueId = `${id}_click_${index}`;
      const preConfig = { x: config.x, y: config.y, autoAlpha: 0 };
      handleSetConfigAnimation({ config: preConfig, target: itemClass });

      const handleClick = () => {
        if (activeTweens.has(uniqueId)) {
          handleCleanUpTweens(uniqueId, activeTweens);
        }
        const intialCofig = { x: config.x, y: config.y, autoAlpha: 0 };
        handleSetConfigAnimation({ config: intialCofig, target: itemClass });

        const currentConfig = {
          ...config,
          x: 0,
          y: 0,
          autoAlpha: 1,
        };

        const { tween, isCompleted } = runAnimation({
          currentConfig,
          target: itemClass,
          method: "to",
        });

        if (isCompleted) activeTweens.set(uniqueId, tween);
        return;
      };

      triggerElement.replaceWith(triggerElement.cloneNode(true));
      triggerElement = document.querySelectorAll(triggerClass)[index];
      triggerElement.addEventListener("click", handleClick);
    });
  }

  function resetAnimation() {
    activeTweens.forEach((t) => t.kill?.());
    activeTweens.clear();

    if (window.ScrollTrigger) {
      ScrollTrigger.getAll().forEach((st) => st.kill());
    }

    [...containerClasses, ...itemClasses].forEach((cls) => {
      if (!cls) return;
      document.querySelectorAll(cls).forEach((el) => {
        gsap.set(el, { clearProps: "all" });
        el.style.transform = "";
        el.style.opacity = "";
        el.style.visibility = "";
      });
    });

    containerClasses = [];
    itemClasses = [];
  }

  function handler(e) {
    const sections = e.detail["wcf-container-fade-animation"] || [];
    sections.forEach((sections) => {
      const {
        id,
        triggerClass,
        triggerType,
        itemClass,
        fadeDirection,
        fadeOffset,
        delay,
        duration,
        stagger,
        ease,
        start,
        end,
        markers,
      } = sections || {};

      // validating itemclass
      if (!itemClass || !document.querySelector(itemClass)) return;

      // calculating x and y axis for gsap
      const { x, y } = calculateFadeAxis(fadeDirection, fadeOffset);

      // main config
      const config = {
        x,
        y,
        delay: delay || 0,
        duration: duration || 1,
        stagger: stagger || 0.05,
        ease: ease || "power1.out",
        autoAlpha: 0,
      };

      // killing existing animation for performance optimization
      if (activeTweens.has(id)) {
        handleCleanUpTweens(id, activeTweens);
      }

      let tween;

      // handling animation
      switch (triggerType) {
        case "on_scroll":
          tween = handleScrollAnimation({
            id,
            config,
            itemClass,
            triggerClass,
            start,
            end,
            markers,
          });
          break;
        case "page_load":
          tween = handlePageLoadAnimation(id, config, itemClass);
          break;
        case "play_with_scroll":
          tween = handlePlayWithScroll({
            id,
            config,
            itemClass,
            triggerClass,
            start,
            end,
            markers,
          });
          break;
        case "hover":
          handleHoverAnimation(
            id,
            config,
            itemClass,
            triggerClass,
            activeTweens
          );
          break;
        case "click":
          handleClickAnimation(
            id,
            config,
            itemClass,
            triggerClass,
            activeTweens
          );
          break;
        default:
          break;
      }
      if (tween) activeTweens.set(id, tween);
      containerClasses.push(triggerClass);
      itemClasses.push(itemClass);
    });
  }

  // wordpress events
  document.addEventListener("aae-animation-event", handler);
  document.addEventListener("aae-reset-animation", resetAnimation);

  return { destroy: resetAnimation };
}

// Init
containerFadeAnimation();
