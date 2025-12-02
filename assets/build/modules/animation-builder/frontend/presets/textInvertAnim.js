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
  !*** ./src/modules/animation-builder/frontend/animation-type/preset/textInvertAnim.js ***!
  \****************************************************************************************/
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   textInvertAnim: function() { return /* binding */ textInvertAnim; }
/* harmony export */ });
function textInvertAnim() {
  let sTimeline = {};
  let sSplitText = [];
  const handler = e => {
    (e.detail["wcf-text-invert-animation"] || []).forEach(section => {
      const {
        triggerClass,
        itemClass,
        start,
        startCustom,
        end,
        endCustom,
        markers = false
      } = section || {};
      if (!itemClass) return;
      gsap.set(itemClass, {
        transition: "none"
      });
      if (triggerClass) {
        gsap.set(triggerClass, {
          transition: "none"
        });
      }
      const elements = document.querySelectorAll(itemClass);
      elements.forEach((element, index) => {
        const split = new SplitText(element, {
          type: "lines",
          linesClass: "invert-line"
        });
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: triggerClass || itemClass,
            start: start === 'custom' ? startCustom : start,
            end: end === 'custom' ? endCustom : end,
            scrub: 1,
            markers: markers === 'true' ? true : false
          }
        });
        const lines = element.querySelectorAll(".invert-line");
        tl.from(lines, {
          opacity: 0.2,
          ease: "none",
          stagger: 0.1
        });
        const uniqueId = `${section.id}_${index}`;
        sTimeline[uniqueId] = {
          timeline: tl,
          split
        };
        sSplitText.push(split);
      });
    });
  };
  function removeAnimation() {
    for (let x in sTimeline) {
      const {
        timeline,
        split
      } = sTimeline[x];
      if (timeline) {
        timeline.revert();
        timeline.kill();
      }
      if (split) {
        split.revert();
      }
    }
    sTimeline = {};
    sSplitText = [];
  }
  document.addEventListener("aae-animation-event", handler);
  document.addEventListener("aae-reset-animation", removeAnimation);
  return {
    destroy: removeAnimation
  };
}

// Initialize
textInvertAnim();
/******/ })()
;
//# sourceMappingURL=textInvertAnim.js.map