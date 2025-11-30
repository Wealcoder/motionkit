/******/ (function() { // webpackBootstrap
/******/ 	"use strict";
/******/ 	// The require scope
/******/ 	var __webpack_require__ = {};
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	!function() {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = function(exports, definition) {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	}();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	!function() {
/******/ 		__webpack_require__.o = function(obj, prop) { return Object.prototype.hasOwnProperty.call(obj, prop); }
/******/ 	}();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	!function() {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = function(exports) {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	}();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
/*!**************************************************************************************!*\
  !*** ./src/modules/animation-builder/frontend/animation-type/preset/textSpinAnim.js ***!
  \**************************************************************************************/
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   textSpinAnim: function() { return /* binding */ textSpinAnim; }
/* harmony export */ });
function textSpinAnim() {
  const activeTimelines = new Map();
  const splitTextInstances = new Map();

  // Main event handler
  const handler = e => {
    (e.detail["wcf-text-spin-animation"] || []).forEach(section => {
      const {
        id,
        triggerClass,
        triggerType,
        itemClass,
        start,
        startCustom,
        end,
        endCustom,
        delay,
        duration,
        stagger,
        markers,
        ease,
        timeout = 0
      } = section || {};
      if (!itemClass) return;
      const elements = Array.from(document.querySelectorAll(itemClass));
      if (!elements.length) return;
      elements.forEach((originalItem, index) => {
        const key = `${id || "aae"}_${index}`;

        // Skip if already processed
        if (splitTextInstances.has(key)) return;

        // Create wrapper and clone
        const cs = getComputedStyle(originalItem);
        const wrapper = document.createElement(cs.display && cs.display.includes("inline") ? "span" : "div");
        wrapper.className = "aae-text-spin-wrapper";
        wrapper.style.display = cs.display && cs.display.includes("inline") ? "inline-block" : cs.display || "inline-block";
        wrapper.style.position = "relative";
        wrapper.style.verticalAlign = cs.verticalAlign || "baseline";
        wrapper.style.lineHeight = cs.lineHeight || "normal";
        wrapper.style.perspective = cs.perspective || "600px";

        // Insert wrapper and move original element into it
        originalItem.parentNode.insertBefore(wrapper, originalItem);
        wrapper.appendChild(originalItem);

        // Create clone for animation
        const clonedItem = originalItem.cloneNode(true);
        clonedItem.classList.add("aae-text-spin-clone");
        clonedItem.style.cssText = `
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          overflow: visible;
          z-index: 2;
          white-space: ${cs.whiteSpace || "normal"};
          /* REMOVED opacity: 0 - GSAP will handle opacity entirely */
        `;
        wrapper.appendChild(clonedItem);

        // Split text into characters
        let originalSplit, cloneSplit;
        try {
          originalSplit = new SplitText(originalItem, {
            type: "chars"
          });
          cloneSplit = new SplitText(clonedItem, {
            type: "chars"
          });

          // Set initial states - original visible, clone hidden and rotated
          gsap.set(originalSplit.chars, {
            opacity: 1,
            rotationX: 0,
            transformPerspective: 600
          });
          gsap.set(cloneSplit.chars, {
            opacity: 0,
            // GSAP controls opacity
            rotationX: -90,
            transformPerspective: 600
          });
        } catch (err) {
          console.error("SplitText failed:", err);
          if (wrapper.parentNode) {
            wrapper.parentNode.insertBefore(originalItem, wrapper);
            wrapper.parentNode.removeChild(wrapper);
          }
          return;
        }

        // Store for cleanup
        splitTextInstances.set(key, {
          originalSplit,
          cloneSplit,
          wrapper,
          originalItem,
          clonedItem
        });

        // Setup after DOM is ready
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            // Position characters
            const wrapperRect = wrapper.getBoundingClientRect();
            originalSplit.chars.forEach((char, i) => {
              const cloneChar = cloneSplit.chars[i];
              if (!char || !cloneChar) return;
              char.style.display = "inline-block";
              char.style.position = "relative";
              char.style.backfaceVisibility = "hidden";
              const charRect = char.getBoundingClientRect();
              const left = Math.round(charRect.left - wrapperRect.left);
              const top = Math.round(charRect.top - wrapperRect.top);
              cloneChar.style.cssText = `
                position: absolute;
                left: ${left}px;
                top: ${top}px;
                width: ${Math.round(charRect.width)}px;
                height: ${Math.round(charRect.height)}px;
                display: inline-block;
                pointer-events: none;
                backface-visibility: hidden;
                color: ${window.getComputedStyle(char).color}; /* Copy text color */
              `;
              if (char.textContent.trim() === "") {
                cloneChar.innerHTML = "&nbsp;";
              }
              const h = Math.max(1, Math.round(charRect.height || 20));
              gsap.set([char, cloneChar], {
                transformOrigin: `50% 50% -${Math.round(h / 2)}px`
              });
            });

            // Create animation based on trigger type
            const animConfig = {
              delay: Number(delay) || 0,
              stagger: Number(stagger) || 0.03,
              duration: Number(duration) || 0.8,
              ease: ease || "power2.out"
            };

            // Remove existing timeline
            if (activeTimelines.has(key)) {
              const old = activeTimelines.get(key);
              if (old && old.kill) old.kill();
              activeTimelines.delete(key);
            }

            // Handle different trigger types
            switch (triggerType) {
              case "on_scroll":
                createScrollTriggerAnimation(originalSplit, cloneSplit);
                break;
              case "play_with_scroll":
                createScrubbedAnimation(originalSplit, cloneSplit);
                break;
              case "page_load":
                createPageLoadAnimation(originalSplit, cloneSplit);
                break;
              case "hover":
                createHoverAnimation(originalSplit, cloneSplit);
                break;
              case "click":
                createClickAnimation(originalSplit, cloneSplit);
                break;
              default:
                createAutoAnimation(originalSplit, cloneSplit);
            }
            function createScrollTriggerAnimation(originalSplit, cloneSplit) {
              const tl = gsap.timeline({
                paused: true
              });

              // Animate original chars out (rotate and fade out)
              tl.to(originalSplit.chars, {
                duration: animConfig.duration / 2,
                rotationX: 90,
                opacity: 0,
                stagger: {
                  each: animConfig.stagger,
                  from: "start"
                },
                ease: "power2.in"
              }, 0);

              // Animate clone chars in (rotate and fade in)
              tl.to(cloneSplit.chars, {
                duration: animConfig.duration / 2,
                rotationX: 0,
                opacity: 1,
                stagger: {
                  each: animConfig.stagger,
                  from: "start"
                },
                ease: "power2.out"
              }, animConfig.duration / 2);
              const stConfig = {
                id: key,
                trigger: triggerClass || wrapper,
                start: start === "custom" ? startCustom : start || "top 80%",
                end: end === "custom" ? endCustom : end || "bottom 20%",
                once: true
              };
              if (markers) stConfig.markers = markers === "true";
              if (window.ScrollTrigger) {
                const existing = ScrollTrigger.getById(key);
                if (existing) existing.kill();
              }
              tl.scrollTrigger = ScrollTrigger.create({
                ...stConfig,
                animation: tl
              });
              activeTimelines.set(key, tl);
            }
            function createScrubbedAnimation(originalSplit, cloneSplit) {
              // Reset transformations
              gsap.set(originalSplit.chars, {
                rotationX: 0,
                opacity: 1
              });
              gsap.set(cloneSplit.chars, {
                rotationX: -90,
                opacity: 0
              });
              const tl = gsap.timeline();

              // Animate original chars out
              tl.to(originalSplit.chars, {
                rotationX: 90,
                opacity: 0,
                stagger: {
                  each: animConfig.stagger,
                  from: "start"
                },
                ease: "none",
                duration: 1
              }, 0);

              // Animate clone chars in
              tl.to(cloneSplit.chars, {
                rotationX: 0,
                opacity: 1,
                stagger: {
                  each: animConfig.stagger,
                  from: "start"
                },
                ease: "none",
                duration: 1
              }, 0);
              const stConfig = {
                id: key,
                trigger: triggerClass || wrapper,
                start: start === "custom" ? startCustom : start || "top bottom",
                end: end === "custom" ? endCustom : end || "bottom top",
                scrub: true
              };
              if (markers) stConfig.markers = markers === "true";
              if (window.ScrollTrigger) {
                const existing = ScrollTrigger.getById(key);
                if (existing) existing.kill();
              }
              tl.scrollTrigger = ScrollTrigger.create({
                ...stConfig,
                animation: tl
              });
              activeTimelines.set(key, tl);
            }
            function createPageLoadAnimation(originalSplit, cloneSplit) {
              gsap.set(originalSplit.chars, {
                rotationX: 0,
                opacity: 1
              });
              gsap.set(cloneSplit.chars, {
                rotationX: -90,
                opacity: 0
              });
              setTimeout(() => {
                const tl = gsap.timeline();

                // Animate original chars out (rotate and fade out)
                tl.to(originalSplit.chars, {
                  duration: animConfig.duration / 2,
                  rotationX: 90,
                  opacity: 0,
                  stagger: {
                    each: animConfig.stagger,
                    from: "start"
                  },
                  ease: "power2.in"
                }, animConfig.delay);

                // Animate clone chars in (rotate and fade in)
                tl.to(cloneSplit.chars, {
                  duration: animConfig.duration / 2,
                  rotationX: 0,
                  opacity: 1,
                  stagger: {
                    each: animConfig.stagger,
                    from: "start"
                  },
                  ease: "power2.out"
                }, animConfig.delay + animConfig.duration / 2);
                activeTimelines.set(key, tl);
              }, timeout);
            }
            function createHoverAnimation(originalSplit, cloneSplit) {
              const triggers = triggerClass ? Array.from(document.querySelectorAll(triggerClass)) : [wrapper];
              triggers.forEach((trig, tIdx) => {
                const hoverId = `${key}_hover_${tIdx}`;
                let tl = null;
                const enter = () => {
                  // Kill any existing timeline
                  if (activeTimelines.has(hoverId)) {
                    const old = activeTimelines.get(hoverId);
                    if (old && old.kill) old.kill();
                  }

                  // Create forward animation timeline
                  tl = gsap.timeline();

                  // Animate original chars out (rotate and fade out)
                  tl.to(originalSplit.chars, {
                    duration: animConfig.duration / 2,
                    rotationX: 90,
                    opacity: 0,
                    stagger: {
                      each: animConfig.stagger,
                      from: "start"
                    },
                    ease: "power2.in"
                  }, animConfig.delay);

                  // Animate clone chars in (rotate and fade in)
                  tl.to(cloneSplit.chars, {
                    duration: animConfig.duration / 2,
                    rotationX: 0,
                    opacity: 1,
                    stagger: {
                      each: animConfig.stagger,
                      from: "start"
                    },
                    ease: "power2.out"
                  }, animConfig.delay + animConfig.duration / 2);
                  activeTimelines.set(hoverId, tl);
                };
                const leave = () => {
                  if (tl) {
                    // Reverse the timeline instead of creating a new one
                    tl.reverse();
                  }
                };
                trig.addEventListener("mouseenter", enter);
                trig.addEventListener("mouseleave", leave);
              });
            }
            function createClickAnimation(originalSplit, cloneSplit) {
              const triggers = triggerClass ? Array.from(document.querySelectorAll(triggerClass)) : [wrapper];
              triggers.forEach((trig, tIdx) => {
                const clickId = `${key}_click_${tIdx}`;
                const onClick = () => {
                  if (activeTimelines.has(clickId)) {
                    const old = activeTimelines.get(clickId);
                    if (old && old.kill) old.kill();
                  }

                  // Reset to initial state
                  gsap.set(originalSplit.chars, {
                    rotationX: 0,
                    opacity: 1
                  });
                  gsap.set(cloneSplit.chars, {
                    rotationX: -90,
                    opacity: 0
                  });
                  const tl = gsap.timeline();

                  // Animate original chars out (rotate and fade out)
                  tl.to(originalSplit.chars, {
                    duration: animConfig.duration / 2,
                    rotationX: 90,
                    opacity: 0,
                    stagger: {
                      each: animConfig.stagger,
                      from: "start"
                    },
                    ease: "power2.in"
                  }, animConfig.delay);

                  // Animate clone chars in (rotate and fade in)
                  tl.to(cloneSplit.chars, {
                    duration: animConfig.duration / 2,
                    rotationX: 0,
                    opacity: 1,
                    stagger: {
                      each: animConfig.stagger,
                      from: "start"
                    },
                    ease: "power2.out"
                  }, animConfig.delay + animConfig.duration / 2);
                  activeTimelines.set(clickId, tl);
                };
                trig.addEventListener("click", onClick);
              });
            }
            function createAutoAnimation(originalSplit, cloneSplit) {
              const tl = gsap.timeline();

              // Animate original chars out (rotate and fade out)
              tl.to(originalSplit.chars, {
                duration: animConfig.duration / 2,
                rotationX: 90,
                opacity: 0,
                stagger: {
                  each: animConfig.stagger,
                  from: "start"
                },
                ease: "power2.in"
              }, animConfig.delay);

              // Animate clone chars in (rotate and fade in)
              tl.to(cloneSplit.chars, {
                duration: animConfig.duration / 2,
                rotationX: 0,
                opacity: 1,
                stagger: {
                  each: animConfig.stagger,
                  from: "start"
                },
                ease: "power2.out"
              }, animConfig.delay + animConfig.duration / 2);
              activeTimelines.set(key, tl);
            }
          });
        });
      });
    });
  };

  // Cleanup function
  function removeAnimation() {
    // Kill all timelines
    activeTimelines.forEach(tl => {
      try {
        if (tl && tl.kill) tl.kill();
      } catch (e) {}
    });
    activeTimelines.clear();

    // Kill all ScrollTriggers
    if (window.ScrollTrigger) {
      try {
        ScrollTrigger.getAll().forEach(t => t.kill());
      } catch (e) {}
    }

    // Revert all SplitText instances and DOM changes
    splitTextInstances.forEach((meta, key) => {
      try {
        const {
          originalSplit,
          cloneSplit,
          wrapper,
          originalItem,
          clonedItem
        } = meta || {};

        // Revert splits
        if (originalSplit && originalSplit.revert) originalSplit.revert();
        if (cloneSplit && cloneSplit.revert) cloneSplit.revert();

        // Remove cloned element
        if (clonedItem && clonedItem.parentNode) {
          clonedItem.parentNode.removeChild(clonedItem);
        }

        // Restore original element position
        if (wrapper && wrapper.parentNode && wrapper.contains(originalItem)) {
          wrapper.parentNode.insertBefore(originalItem, wrapper);
          wrapper.parentNode.removeChild(wrapper);
        }
      } catch (err) {
        console.warn("Could not fully revert split instance", key, err);
      }
    });
    splitTextInstances.clear();
  }

  // Event listeners
  document.addEventListener("aae-animation-event", handler);
  document.addEventListener("aae-reset-animation", removeAnimation);
  return {
    destroy: removeAnimation
  };
}

// Initialize
textSpinAnim();
/******/ })()
;
//# sourceMappingURL=textSpinAnim.js.map