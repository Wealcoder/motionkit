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
/*!**************************************************************************************************!*\
  !*** ./src/modules/animation-builder/frontend/animation-type/freePreset/containerSwashInAnim.js ***!
  \**************************************************************************************************/
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   containerSwashInAnim: function() { return /* binding */ containerSwashInAnim; }
/* harmony export */ });
function containerSwashInAnim() {
  function handler(e) {
    const sections = e.detail["wcf-container-swash-in-free-animation"] || [];
    sections.forEach(sections => {
      const {
        id,
        triggerClass,
        itemClass,
        delay,
        duration,
        repeat
      } = sections || {};
      console.log("swashInFreeAnim", {
        id,
        triggerClass,
        itemClass,
        delay,
        duration,
        repeat
      });

      // validating itemclass
      if (!itemClass || !document.querySelector(itemClass)) return;
    });
  }

  // wordpress events
  document.addEventListener("aae-animation-event", handler);
  document.addEventListener("aae-reset-animation", resetAnimation);
  return {
    destroy: resetAnimation
  };
}
containerSwashInAnim();
/******/ })()
;
//# sourceMappingURL=containerSwashInAnim.js.map