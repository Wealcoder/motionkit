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
/*!******************************************************************************************!*\
  !*** ./src/modules/animation-builder/frontend/animation-type/preset/imageStretchAnim.js ***!
  \******************************************************************************************/
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   imageStretchAnim: function() { return /* binding */ imageStretchAnim; }
/* harmony export */ });
function imageStretchAnim() {
  let sTimeline = {};
  let sContainerClass = [];
  let sItemClass = [];
  const handler = e => {
    (e.detail["wcf-image-stretch-animation"] || []).forEach(section => {
      const {
        containerClass,
        containerHeight,
        itemClass,
        itemWidth,
        objectFit
      } = section || {};
      if (!(containerClass && containerHeight && itemClass)) return;
      const containerEl = document.querySelector(containerClass);
      if (!containerEl) return;
      gsap.set(containerClass, {
        height: containerHeight,
        transition: "none"
      });
      gsap.set(itemClass, {
        objectFit
      });
      const istTimeline = gsap.timeline({
        scrollTrigger: {
          trigger: containerClass,
          pin: true,
          start: "top top",
          end: "bottom bottom",
          scrub: true,
          pinSpacing: false
        }
      });
      istTimeline.to(itemClass, {
        width: itemWidth !== null && itemWidth !== void 0 ? itemWidth : '100%'
      });
      sTimeline[section.id] = istTimeline;
      sContainerClass.push(containerClass);
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
imageStretchAnim();
/******/ })()
;
//# sourceMappingURL=imageStretchAnim.js.map