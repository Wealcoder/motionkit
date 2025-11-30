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
/*!*********************************************************************************************!*\
  !*** ./src/modules/animation-builder/frontend/animation-type/preset/cursorHoverMoveAnim.js ***!
  \*********************************************************************************************/
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   cursorHoverMoveAnim: function() { return /* binding */ cursorHoverMoveAnim; }
/* harmony export */ });
function cursorHoverMoveAnim() {
  let sTimeline = {};
  let sItemClass = [];
  let eventListeners = [];
  const handler = e => {
    (e.detail["wcf-cursor-hover-move-animation"] || []).forEach(section => {
      const {
        itemClass,
        moveX,
        moveY,
        duration
      } = section || {};
      if (!itemClass) return;
      const windowWidth = window.innerWidth;
      const windowHeight = window.innerHeight;

      // Query all matching items
      document.querySelectorAll(itemClass).forEach(itemEl => {
        // Store selectors for reset
        sItemClass.push(itemEl);

        // Mouse move handler for this specific item
        const mouseMoveHandler = evt => {
          // Calculate the percentage of the cursor's position relative to the screen
          const xPosPercent = evt.clientX / windowWidth - 0.5;
          const yPosPercent = evt.clientY / windowHeight - 0.5;
          const config = {
            x: xPosPercent * (moveX || 0),
            y: yPosPercent * (moveY || 0),
            ease: "power3.out",
            duration: Number(duration)
          };

          // GSAP animation to move the element
          gsap.to(itemEl, config);
        };

        // Mouse enter handler
        const mouseEnterHandler = () => {
          itemEl.addEventListener("mousemove", mouseMoveHandler);
        };

        // Mouse leave handler
        const mouseLeaveHandler = () => {
          itemEl.removeEventListener("mousemove", mouseMoveHandler);

          // Reset position when mouse leaves
          gsap.to(itemEl, {
            x: 0,
            y: 0,
            ease: "power3.out",
            duration: 0.6
          });
        };

        // Add event listeners
        itemEl.addEventListener("mouseenter", mouseEnterHandler);
        itemEl.addEventListener("mouseleave", mouseLeaveHandler);

        // Store for cleanup
        eventListeners.push({
          element: itemEl,
          enterHandler: mouseEnterHandler,
          leaveHandler: mouseLeaveHandler,
          moveHandler: mouseMoveHandler
        });

        // Store timeline reference for cleanup
        sTimeline[`${section.id}-${Math.random()}`] = true;
      });
    });
  };
  function removeAnimation() {
    // Kill all timelines
    for (let x in sTimeline) {
      delete sTimeline[x];
    }

    // Remove all event listeners
    eventListeners.forEach(({
      element,
      enterHandler,
      leaveHandler,
      moveHandler
    }) => {
      element.removeEventListener("mouseenter", enterHandler);
      element.removeEventListener("mouseleave", leaveHandler);
      element.removeEventListener("mousemove", moveHandler);
    });

    // Clear stored items
    sItemClass?.forEach(itemEl => {
      gsap.set(itemEl, {
        clearProps: "all"
      });
    });

    // Reset arrays
    sTimeline = {};
    sItemClass = [];
    eventListeners = [];
  }
  document.addEventListener("aae-animation-event", handler);
  document.addEventListener("aae-reset-animation", removeAnimation);
}
cursorHoverMoveAnim();
/******/ })()
;
//# sourceMappingURL=cursorHoverMoveAnim.js.map