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
  !*** ./src/modules/animation-builder/frontend/animation-type/preset/imageScaleAnim.js ***!
  \****************************************************************************************/
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   imageScaleAnim: function() { return /* binding */ imageScaleAnim; }
/* harmony export */ });
function imageScaleAnim() {
  let sTimeline = {};
  let sContainerClass = [];
  let sItemClass = [];
  const handler = e => {
    (e.detail["wcf-image-scale-animation"] || []).forEach(section => {
      const {
        containerClass,
        containerHeight,
        itemClass,
        scale,
        transformOrigin,
        animationStart,
        animationCStart,
        animationEnd,
        animationCEnd,
        ease,
        playOnScroll
      } = section || {};
      if (!(containerClass && containerHeight && itemClass)) return;
      const containerEl = document.querySelector(containerClass);
      if (!containerEl) return;
      gsap.set(containerEl, {
        height: containerHeight,
        transition: "none"
      });
      gsap.set(itemClass, {
        maxHeight: "100vh",
        objectFit: "cover"
      });
      const scaleTimeline = gsap.timeline({
        scrollTrigger: {
          trigger: containerEl,
          pin: true,
          start: animationStart === 'custom' ? animationCStart : animationStart,
          end: animationEnd === 'custom' ? animationCEnd : animationEnd,
          scrub: playOnScroll,
          pinSpacing: false
        }
      });
      scaleTimeline.from(itemClass, {
        scale,
        transformOrigin,
        ease
      });
      sTimeline[section.id] = scaleTimeline;
      sContainerClass.push(containerEl);
      sItemClass.push(itemClass);
    });
  };
  function removeAnimation() {
    for (let x in sTimeline) {
      sTimeline[x].revert();
      sTimeline[x].kill();
    }
    sContainerClass?.forEach(containerEl => {
      gsap.set(containerEl, {
        clearProps: "all"
      });
    });
    sItemClass?.forEach(itemEl => {
      gsap.set(itemEl, {
        clearProps: "all"
      });
    });
  }
  document.addEventListener("aae-animation-event", handler);
  document.addEventListener("aae-reset-animation", removeAnimation);
}
imageScaleAnim();
/******/ })()
;
//# sourceMappingURL=imageScaleAnim.js.map