export function textSplitAnim() {
  let sContainerClass = [];
  let sItemClass = [];
  let activeTweens = new Map();

  const handler = (e) => {
    (e.detail["wcf-container-fade-animation"] || []).forEach((section) => {
      const {
        id,
        title,
        type,
        enable,
        presetGroup,
        preset,
        method,
        triggerClass,
        triggerType,
        itemClass,
        start,
        startCustom,
        end,
        endCustom,
        fadeOffset,
        delay,
        duration,
        stagger,
        fadeDirection,
        ease,
        markers,
        timeout = 0, // Add timeout parameter for page_load
      } = section || {};

      if (!itemClass) {
        return;
      }

      const itemElements = document.querySelectorAll(itemClass);
      if (!itemElements.length) {
        return;
      }

      // Split text
      try {
        //
        // Clear any existing tweens for this target
        // gsap.killTweensOf(target);
        // if (activeTweens.has(id)) {
        //   activeTweens.get(id).kill();
        //   activeTweens.delete(id);
        // }

        const animationConfig = {
          autoAlpha: 0,
          delay: delay || 0,
          stagger: stagger || 0.05,
          duration: duration || 1,
          ease,
        };

        // calculating translate x and translate y
        const { x, y } = calculateFadeAxis(fadeDirection, fadeOffset);
        animationConfig.x = x;
        animationConfig.y = y;

        //  adding scale properties when fadeDirection is zoom
        if (fadeDirection == "zoom") {
          animationConfig.scale = 1.2;
        }

        console.log("final Config Obj", { animationConfig });

        // TODO : Check start trigger and end trigger and start and end functionality.

        const runAnimation = () => {
          // Kill any existing animation for this ID
          if (activeTweens.has(id)) {
            activeTweens.get(id).kill();
          }

          if (triggerType === "on_scroll") {
            const scrollTriggerConfig = {
              id: id,
              trigger: triggerClass || itemClass,
              start: start === "custom" ? startCustom : start || "top 80%",
              end: end === "custom" ? endCustom : end || "bottom 20%",
              once: false,
            };

            if (markers)
              scrollTriggerConfig.markers = markers === "true" ? true : false;

            // Kill existing ScrollTrigger
            if (window.ScrollTrigger) {
              const existing = ScrollTrigger.getById(id);
              if (existing) existing.kill();
            }

            // Set initial state
            gsap.set(target, {
              x: animationConfig.x,
              y: animationConfig.y,
              autoAlpha: 0,
            });

            const tween = gsap.to(target, {
              x: 0,
              y: 0,
              autoAlpha: 1,
              delay: animationConfig.delay,
              stagger: animationConfig.stagger,
              duration: animationConfig.duration,
              ease: animationConfig.ease,
              scrollTrigger: scrollTriggerConfig,
            });

            activeTweens.set(id, tween);
          } else if (triggerType === "play_with_scroll") {
            const scrollTriggerConfig = {
              id: id,
              trigger: triggerClass || itemClass,
              start: start === "custom" ? startCustom : start || "top bottom",
              end: end === "custom" ? endCustom : end || "bottom top",
              scrub: 1, // Smooth scrub
            };

            if (markers)
              scrollTriggerConfig.markers = markers === "true" ? true : false;

            // Kill existing ScrollTrigger
            if (window.ScrollTrigger) {
              const existing = ScrollTrigger.getById(id);
              if (existing) existing.kill();
            }

            const tween = gsap.fromTo(
              target,
              {
                x: animationConfig.x,
                y: animationConfig.y,
                autoAlpha: 0,
              },
              {
                x: 0,
                y: 0,
                autoAlpha: 1,
                stagger: animationConfig.stagger,
                duration: 1, // Duration is less important with scrub
                ease: "none", // Use "none" for scrub animations
                scrollTrigger: scrollTriggerConfig,
              }
            );

            activeTweens.set(id, tween);
          } else if (triggerType === "page_load") {
            // Set initial state
            gsap.set(target, {
              x: animationConfig.x,
              y: animationConfig.y,
              autoAlpha: 0,
            });

            // Add timeout for page load
            setTimeout(() => {
              const tween = gsap.to(target, {
                x: 0,
                y: 0,
                autoAlpha: 1,
                delay: animationConfig.delay,
                stagger: animationConfig.stagger,
                duration: animationConfig.duration,
                ease: animationConfig.ease,
              });
              activeTweens.set(id, tween);
            }, timeout);
          } else if (triggerType === "hover" || triggerType === "click") {
            // Set initial state for interactive triggers - but don't animate yet
            gsap.set(target, {
              x: animationConfig.x,
              y: animationConfig.y,
              autoAlpha: 0,
            });
          }
        };

        // Handle different trigger types
        if (triggerType === "hover") {
          if (triggerClass) {
            // Set initial state for the target elements
            gsap.set(target, {
              x: animationConfig.x,
              y: animationConfig.y,
              autoAlpha: 0,
            });

            const triggerElements = document.querySelectorAll(triggerClass);

            triggerElements.forEach((triggerElement, index) => {
              const uniqueId = `${id}_${index}`;

              const handleMouseEnter = () => {
                // Kill any existing animation for this target
                gsap.killTweensOf(target);
                if (activeTweens.has(uniqueId)) {
                  activeTweens.get(uniqueId).kill();
                  activeTweens.delete(uniqueId);
                }

                // Play forward animation
                const tween = gsap.to(target, {
                  x: 0,
                  y: 0,
                  autoAlpha: 1,
                  delay: animationConfig.delay,
                  stagger: animationConfig.stagger,
                  duration: animationConfig.duration,
                  ease: animationConfig.ease,
                });

                activeTweens.set(uniqueId, tween);
              };

              const handleMouseLeave = () => {
                // Kill any existing animation for this target
                gsap.killTweensOf(target);
                if (activeTweens.has(uniqueId)) {
                  activeTweens.get(uniqueId).kill();
                  activeTweens.delete(uniqueId);
                }

                // Play reverse animation
                const tween = gsap.to(target, {
                  x: animationConfig.x,
                  y: animationConfig.y,
                  autoAlpha: 0,
                  duration: animationConfig.duration * 0.6,
                  stagger: animationConfig.stagger * 0.5,
                  ease: animationConfig.ease,
                });

                activeTweens.set(uniqueId, tween);
              };

              // Clean up existing event listeners by cloning the element
              const newTriggerElement = triggerElement.cloneNode(true);
              triggerElement.parentNode.replaceChild(
                newTriggerElement,
                triggerElement
              );

              // Add fresh event listeners to the new element
              newTriggerElement.addEventListener(
                "mouseenter",
                handleMouseEnter
              );
              newTriggerElement.addEventListener(
                "mouseleave",
                handleMouseLeave
              );

              // Also add backup events for better browser compatibility
              newTriggerElement.addEventListener("hover", handleMouseEnter);
              newTriggerElement.addEventListener("mouseout", handleMouseLeave);
            });
          }
        } else if (triggerType === "click") {
          if (triggerClass) {
            const triggerElements = document.querySelectorAll(triggerClass);

            triggerElements.forEach((triggerElement, index) => {
              const uniqueId = `${id}_click_${index}`;

              // Set initial state
              gsap.set(target, {
                x: animationConfig.x,
                y: animationConfig.y,
                autoAlpha: 0,
              });

              const handleClick = () => {
                // Kill any existing animation
                if (activeTweens.has(uniqueId)) {
                  activeTweens.get(uniqueId).kill();
                }

                // Reset to initial state first
                gsap.set(target, {
                  x: animationConfig.x,
                  y: animationConfig.y,
                  autoAlpha: 0,
                });

                // Play animation from start
                const tween = gsap.to(target, {
                  x: 0,
                  y: 0,
                  autoAlpha: 1,
                  delay: animationConfig.delay,
                  stagger: animationConfig.stagger,
                  duration: animationConfig.duration,
                  ease: animationConfig.ease,
                });

                activeTweens.set(uniqueId, tween);
              };

              // Remove existing event listener
              triggerElement.removeEventListener("click", handleClick);

              // Add new event listener
              triggerElement.addEventListener("click", handleClick);
            });
          }
        } else {
          // Auto-run for scroll triggers and page load
          runAnimation();
        }
      } catch (err) {
        console.error("Text Split Animation: Error splitting text", err);
      } finally {
        sContainerClass.push(triggerClass);
        sItemClass.push(itemClass);
      }
    });
  };

  function calculateFadeAxis(direction, offset) {
    // gettings fade direction and fading ofset
    switch (direction) {
      case "top":
        return { x: 0, y: -offset };
      case "right":
        return { x: offset, y: 0 };
      case "bottom":
        return { x: 0, y: offset };
      case "left":
        return { x: -offset, y: 0 };
      case "in":
      case "zoom":
      default:
        return { x: 0, y: -offset };
    }
  }

  function removeAnimation() {
    // Kill all active tweens first
    activeTweens.forEach((tween) => {
      if (tween && tween.kill) {
        tween.kill();
      }
    });
    activeTweens.clear();

    // Kill all ScrollTriggers
    if (window.ScrollTrigger) {
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    }

    // Reset all container and item elements
    [...sContainerClass, ...sItemClass].forEach((className) => {
      if (className) {
        const elements = document.querySelectorAll(className);
        elements.forEach((el) => {
          // Clear all GSAP properties
          gsap.set(el, { clearProps: "all" });

          // Reset any inline styles that might have been set
          if (el.style) {
            el.style.transform = "";
            el.style.opacity = "";
            el.style.visibility = "";
            el.style.display = "";
          }
        });
      }
    });

    // Clear the arrays
    sContainerClass.length = 0;
    sItemClass.length = 0;

    // Also clean up any remaining event listeners on trigger elements
    document.querySelectorAll("[data-split-animation]").forEach((el) => {
      const newEl = el.cloneNode(true);
      if (el.parentNode) {
        el.parentNode.replaceChild(newEl, el);
      }
    });
  }

  // Event listeners
  document.addEventListener("aae-animation-event", handler);
  document.addEventListener("aae-reset-animation", removeAnimation);

  // Return cleanup function for manual cleanup if needed
  return {
    destroy: removeAnimation,
  };
}

// Initialize
textSplitAnim();
