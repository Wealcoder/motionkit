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
/*!*******************************************************************************************!*\
  !*** ./src/modules/animation-builder/frontend/animation-type/freePreset/faSwashInAnim.js ***!
  \*******************************************************************************************/
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   faSwashInAnim: function() { return /* binding */ faSwashInAnim; }
/* harmony export */ });
function faSwashInAnim() {
  return {
    classname: "wcf-fa-swashin",
    category: "fade",
    // TODO: Change this
    properties: {
      keyframes: {
        "0%": {
          opacity: "0",
          transformOrigin: "50% 50%",
          transform: "scale(0, 0)"
        },
        "90%": {
          opacity: "1",
          transformOrigin: "50% 50%",
          transform: "scale(0.9, 0.9)"
        },
        "100%": {
          opacity: "1",
          transformOrigin: "50% 50%",
          transform: "scale(1, 1)"
        }
      },
      duration: 1000,
      easing: "power2.out",
      delay: 0,
      repeat: 1
    }
  };
}
/******/ })()
;
//# sourceMappingURL=faSwashInAnim.js.map