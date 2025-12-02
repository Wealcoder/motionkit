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
/*!********************************************************************************************!*\
  !*** ./src/modules/animation-builder/frontend/animation-type/freePreset/freeAnimations.js ***!
  \********************************************************************************************/
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   freeAnimations: function() { return /* binding */ freeAnimations; }
/* harmony export */ });
// free default animations config list
const defaultConfig = {
  duration: 1,
  delay: 0,
  repeat: 1
};
const freeAnimations = [
// swashIn
{
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
    ...defaultConfig
  }
},
// vanishIn
{
  classname: "wcf-fa-vanishin",
  category: "fade",
  // TODO: Change this
  properties: {
    keyframes: {
      "0%": {
        opacity: "0",
        transformOrigin: "50% 50%",
        transform: "scale(2, 2)",
        filter: "blur(90px)"
      },
      "100%": {
        opacity: "1",
        transformOrigin: "50% 50%",
        transform: "scale(1, 1)",
        filter: "blur(0px)"
      }
    },
    ...defaultConfig
  }
},
// spaceInLeft
{
  classname: "wcf-fa-spaceinleft",
  category: "fade",
  // TODO: Change this
  properties: {
    keyframes: {
      "0%": {
        opacity: "0",
        transformOrigin: "0% 50%",
        transform: "scale(0.2) translate(-200%, 0%)"
      },
      "100%": {
        opacity: "1",
        transformOrigin: "0% 50%",
        transform: "scale(1) translate(0%, 0%)"
      }
    },
    ...defaultConfig
  }
},
// spaceInRight
{
  classname: "wcf-fa-spaceinright",
  category: "fade",
  // TODO: Change this
  properties: {
    keyframes: {
      "0%": {
        opacity: "0",
        transformOrigin: "100% 50%",
        transform: "scale(0.2) translate(200%, 0%)"
      },
      "100%": {
        opacity: "1",
        transformOrigin: "100% 50%",
        transform: "scale(1) translate(0%, 0%)"
      }
    },
    ...defaultConfig
  }
},
// swap
{
  classname: "wcf-fa-swap",
  category: "fade",
  // TODO: Change this
  properties: {
    keyframes: {
      "0%": {
        opacity: "0",
        transformOrigin: "0 100%",
        transform: "scale(0, 0) translate(-700px, 0px)"
      },
      "100%": {
        opacity: "1",
        transformOrigin: "100% 100%",
        transform: "scale(1, 1) translate(0px, 0px)"
      }
    },
    ...defaultConfig
  }
}];
/******/ })()
;
//# sourceMappingURL=freeAnimations.js.map