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
/*!*****************************************************************************************!*\
  !*** ./src/modules/animation-builder/frontend/animation-type/preset/imageRevealAnim.js ***!
  \*****************************************************************************************/
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   imageRevealAnim: function() { return /* binding */ imageRevealAnim; }
/* harmony export */ });
function imageRevealAnim() {
  let sTimeline = {};
  let sContainerClass = [];
  let sItemClass = [];
  const handler = e => {
    (e.detail["wcf-image-reveal-animation"] || []).forEach(section => {
      const {
        triggerClass,
        itemClass,
        animationTo,
        animationStart,
        animationCStart,
        ease
      } = section || {};
      if (!itemClass) return;
      document.querySelectorAll(itemClass).forEach(itemEl => {
        const containerEl = itemEl.parentElement;
        if (!containerEl) return;
        sContainerClass.push(containerEl);
        sItemClass.push(itemEl);
        gsap.set(containerEl, {
          autoAlpha: 1,
          overflow: "hidden",
          transition: "none"
        });
        gsap.set(itemEl, {
          overflow: "hidden",
          objectFit: "cover"
        });
        const imgrTimeline = gsap.timeline({
          scrollTrigger: {
            trigger: triggerClass || containerEl,
            start: animationStart === 'custom' ? animationCStart : animationStart
          }
        });
        let contentAnim = {
          ease
        };
        let imageAnim = {
          scale: 1.3,
          delay: -1.5,
          ease
        };
        switch (animationTo) {
          case "left":
            contentAnim.xPercent = -100;
            imageAnim.xPercent = 100;
            break;
          case "right":
            contentAnim.xPercent = 100;
            imageAnim.xPercent = -100;
            break;
          case "top":
            contentAnim.yPercent = -100;
            imageAnim.yPercent = 100;
            break;
          case "bottom":
            contentAnim.yPercent = 100;
            imageAnim.yPercent = -100;
            break;
        }
        imgrTimeline.from(containerEl, 1.5, contentAnim);
        imgrTimeline.from(itemEl, 1.5, imageAnim);
        sTimeline[`${section.id}-${Math.random()}`] = imgrTimeline;
      });
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
imageRevealAnim();
/******/ })()
;
//# sourceMappingURL=imageRevealAnim.js.map