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
/*!****************************************************************************************!*\
  !*** ./src/modules/animation-builder/frontend/animation-type/preset/textRotateAnim.js ***!
  \****************************************************************************************/
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   textRotateAnim: function() { return /* binding */ textRotateAnim; }
/* harmony export */ });
function textRotateAnim() {
  let sContainerClass = [];
  let sItemClass = [];
  let activeTweens = new Map();
  let splitTextInstances = new Map();
  const handler = e => {
    (e.detail["wcf-text-rotate-animation"] || []).forEach(section => {
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
        rotationX,
        rotationY,
        transformOrigin,
        markers,
        ease,
        timeout = 0
      } = section || {};
      if (!itemClass) {
        return;
      }
      const itemElements = document.querySelectorAll(itemClass);
      if (!itemElements.length) {
        return;
      }
      try {
        gsap.set(itemClass, {
          transition: "none"
        });
        if (triggerClass) {
          gsap.set(triggerClass, {
            transition: "none"
          });
        }
        const splitInstance = new SplitText(itemClass, {
          type: "lines"
        });
        splitTextInstances.set(id, splitInstance);
        const target = splitInstance["lines"];
        if (!target || target.length === 0) {
          console.warn("No split targets found for", "chars");
          return;
        }
        gsap.killTweensOf(target);
        if (activeTweens.has(id)) {
          activeTweens.get(id).kill();
          activeTweens.delete(id);
        }
        const animationConfig = {
          rotationX: rotationX || 0,
          rotationY: rotationY || 0,
          force3D: true,
          transformOrigin: transformOrigin,
          autoAlpha: 0,
          delay: delay || 0,
          stagger: stagger || 0.05,
          duration: duration || 1,
          ease
        };
        const runAnimation = () => {
          if (activeTweens.has(id)) {
            activeTweens.get(id).kill();
          }
          if (triggerType === "on_scroll") {
            const scrollTriggerConfig = {
              id: id,
              trigger: triggerClass || itemClass,
              start: start === "custom" ? startCustom : start || "top 80%",
              end: end === "custom" ? endCustom : end || "bottom 20%",
              once: false
            };
            if (markers) scrollTriggerConfig.markers = markers === "true" ? true : false;
            if (window.ScrollTrigger) {
              const existing = ScrollTrigger.getById(id);
              if (existing) existing.kill();
            }
            gsap.set(target, {
              rotationX: animationConfig.rotationX,
              rotationY: animationConfig.rotationY,
              autoAlpha: 0
            });
            const tween = gsap.to(target, {
              rotationX: 0,
              rotationY: 0,
              force3D: true,
              transformOrigin: transformOrigin,
              autoAlpha: 1,
              delay: animationConfig.delay,
              stagger: animationConfig.stagger,
              duration: animationConfig.duration,
              ease: animationConfig.ease,
              scrollTrigger: scrollTriggerConfig
            });
            activeTweens.set(id, tween);
          } else if (triggerType === "play_with_scroll") {
            const scrollTriggerConfig = {
              id: id,
              trigger: triggerClass || itemClass,
              start: start === "custom" ? startCustom : start || "top bottom",
              end: end === "custom" ? endCustom : end || "bottom top",
              scrub: 1
            };
            if (markers) scrollTriggerConfig.markers = markers === "true" ? true : false;
            if (window.ScrollTrigger) {
              const existing = ScrollTrigger.getById(id);
              if (existing) existing.kill();
            }
            const tween = gsap.fromTo(target, {
              rotationX: animationConfig.rotationX,
              rotationY: animationConfig.rotationY,
              autoAlpha: 0
            }, {
              rotationX: 0,
              rotationY: 0,
              autoAlpha: 1,
              force3D: true,
              transformOrigin: transformOrigin,
              stagger: animationConfig.stagger,
              duration: 1,
              ease: "none",
              scrollTrigger: scrollTriggerConfig
            });
            activeTweens.set(id, tween);
          } else if (triggerType === "page_load") {
            gsap.set(target, {
              rotationX: animationConfig.rotationX,
              rotationY: animationConfig.rotationY,
              autoAlpha: 0
            });
            setTimeout(() => {
              const tween = gsap.to(target, {
                rotationX: 0,
                rotationY: 0,
                autoAlpha: 1,
                force3D: true,
                transformOrigin: transformOrigin,
                delay: animationConfig.delay,
                stagger: animationConfig.stagger,
                duration: animationConfig.duration,
                ease: animationConfig.ease
              });
              activeTweens.set(id, tween);
            }, timeout);
          } else if (triggerType === "hover" || triggerType === "click") {
            gsap.set(target, {
              rotationX: animationConfig.rotationX,
              rotationY: animationConfig.rotationY,
              autoAlpha: 0
            });
          }
        };
        if (triggerType === "hover") {
          if (triggerClass) {
            gsap.set(target, {
              rotationX: animationConfig.rotationX,
              rotationY: animationConfig.rotationY,
              autoAlpha: 0
            });
            const triggerElements = document.querySelectorAll(triggerClass);
            triggerElements.forEach((triggerElement, index) => {
              const uniqueId = `${id}_${index}`;
              const handleMouseEnter = () => {
                gsap.killTweensOf(target);
                if (activeTweens.has(uniqueId)) {
                  activeTweens.get(uniqueId).kill();
                  activeTweens.delete(uniqueId);
                }
                const tween = gsap.to(target, {
                  rotationX: 0,
                  rotationY: 0,
                  autoAlpha: 1,
                  force3D: true,
                  transformOrigin: transformOrigin,
                  delay: animationConfig.delay,
                  stagger: animationConfig.stagger,
                  duration: animationConfig.duration,
                  ease: animationConfig.ease
                });
                activeTweens.set(uniqueId, tween);
              };
              const handleMouseLeave = () => {
                gsap.killTweensOf(target);
                if (activeTweens.has(uniqueId)) {
                  activeTweens.get(uniqueId).kill();
                  activeTweens.delete(uniqueId);
                }
                const tween = gsap.to(target, {
                  rotationX: animationConfig.rotationX,
                  rotationY: animationConfig.rotationY,
                  autoAlpha: 0,
                  force3D: true,
                  transformOrigin: transformOrigin,
                  duration: animationConfig.duration * 0.6,
                  stagger: animationConfig.stagger * 0.5,
                  ease: animationConfig.ease
                });
                activeTweens.set(uniqueId, tween);
              };
              const newTriggerElement = triggerElement.cloneNode(true);
              triggerElement.parentNode.replaceChild(newTriggerElement, triggerElement);
              newTriggerElement.addEventListener("mouseenter", handleMouseEnter);
              newTriggerElement.addEventListener("mouseleave", handleMouseLeave);
              newTriggerElement.addEventListener("hover", handleMouseEnter);
              newTriggerElement.addEventListener("mouseout", handleMouseLeave);
            });
          }
        } else if (triggerType === "click") {
          if (triggerClass) {
            const triggerElements = document.querySelectorAll(triggerClass);
            triggerElements.forEach((triggerElement, index) => {
              const uniqueId = `${id}_click_${index}`;
              gsap.set(target, {
                rotationX: animationConfig.rotationX,
                rotationY: animationConfig.rotationY,
                autoAlpha: 0
              });
              const handleClick = () => {
                if (activeTweens.has(uniqueId)) {
                  activeTweens.get(uniqueId).kill();
                }
                gsap.set(target, {
                  rotationX: animationConfig.rotationX,
                  rotationY: animationConfig.rotationY,
                  autoAlpha: 0
                });
                const tween = gsap.to(target, {
                  rotationX: 0,
                  rotationY: 0,
                  autoAlpha: 1,
                  force3D: true,
                  transformOrigin: transformOrigin,
                  delay: animationConfig.delay,
                  stagger: animationConfig.stagger,
                  duration: animationConfig.duration,
                  ease: animationConfig.ease
                });
                activeTweens.set(uniqueId, tween);
              };
              triggerElement.removeEventListener("click", handleClick);
              triggerElement.addEventListener("click", handleClick);
            });
          }
        } else {
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
  function removeAnimation() {
    activeTweens.forEach(tween => {
      if (tween && tween.kill) {
        tween.kill();
      }
    });
    activeTweens.clear();
    if (window.ScrollTrigger) {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    }
    splitTextInstances.forEach((splitInstance, id) => {
      try {
        if (splitInstance && splitInstance.revert) {
          splitInstance.revert();
        }
      } catch (e) {
        console.warn(`Could not revert split text instance for ${id}:`, e);
      }
    });
    splitTextInstances.clear();
    [...sContainerClass, ...sItemClass].forEach(className => {
      if (className) {
        const elements = document.querySelectorAll(className);
        elements.forEach(el => {
          gsap.set(el, {
            clearProps: "all"
          });
          if (el.style) {
            el.style.transform = '';
            el.style.opacity = '';
            el.style.visibility = '';
            el.style.display = '';
          }
        });
      }
    });
    sContainerClass.length = 0;
    sItemClass.length = 0;
    document.querySelectorAll('[data-split-animation]').forEach(el => {
      const newEl = el.cloneNode(true);
      if (el.parentNode) {
        el.parentNode.replaceChild(newEl, el);
      }
    });
  }
  document.addEventListener("aae-animation-event", handler);
  document.addEventListener("aae-reset-animation", removeAnimation);
  return {
    destroy: removeAnimation
  };
}

// Initialize
textRotateAnim();
/******/ })()
;
//# sourceMappingURL=textRotateAnim.js.map