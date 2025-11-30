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
/*!**********************************************************************************************!*\
  !*** ./src/modules/animation-builder/frontend/animation-type/preset/horizontalScrollAnim.js ***!
  \**********************************************************************************************/
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   horizontalScrollAnim: function() { return /* binding */ horizontalScrollAnim; }
/* harmony export */ });
function horizontalScrollAnim() {
  let sTimeline = {};
  let sContainerClass = [];
  let sItemClass = [];
  function convertToPixels(value) {
    if (value.endsWith("px")) {
      return parseFloat(value);
    } else if (value.endsWith("vw")) {
      return parseFloat(value) / 100 * window.innerWidth;
    } else if (value.endsWith("%")) {
      return parseFloat(value) / 100 * window.innerWidth;
    } else {
      console.warn("Unsupported unit in itemWidth:", value);
      return 0;
    }
  }
  const handler = e => {
    (e.detail["wcf-horizontal-scroll-animation"] || []).forEach(section => {
      const {
        containerClass,
        containerHeight,
        itemClass,
        itemWidth,
        itemWidthType,
        itemsWidth
      } = section || {};
      if (!(containerClass && containerHeight && itemClass)) return;
      const containerEl = document.querySelector(containerClass);
      if (!containerEl) return;

      // find children inside container
      const items = Array.from(containerEl.querySelectorAll(itemClass));
      const itemCount = items.length;
      if (!itemCount) return; // nothing to animate

      // build an array of pixel widths
      let widthsPx;
      if (itemWidthType === "custom" && itemsWidth.length) {
        // use only as many custom widths as there are items
        widthsPx = itemsWidth.slice(0, itemCount).map(w => convertToPixels(w));
      } else {
        // default: one width for all
        const def = convertToPixels(itemWidth);
        widthsPx = new Array(itemCount).fill(def);
      }

      // compute total scrollable width
      const totalWidth = widthsPx.reduce((sum, w) => sum + w, 0);
      const totalScrollPx = totalWidth - containerEl.offsetWidth;
      gsap.set(containerClass, {
        width: totalScrollPx,
        height: containerHeight,
        transition: "none"
      });
      items.forEach((el, i) => gsap.set(el, {
        width: widthsPx[i],
        flexShrink: 0
      }));
      const hzTimeline = gsap.timeline({
        scrollTrigger: {
          trigger: containerClass,
          pin: true,
          start: "top top",
          end: "bottom bottom",
          // end: `+=${totalScrollPx}`,
          scrub: true,
          pinSpacing: false
        }
      });
      hzTimeline.to(items, {
        x: () => -totalScrollPx
      });
      sTimeline[section.id] = hzTimeline;
      sContainerClass.push(containerClass);
      sItemClass.push(itemClass);
    });
  };
  function removeAnimation() {
    for (let x in sTimeline) {
      sTimeline[x].revert();
      sTimeline[x].kill();
    }
    sContainerClass?.forEach(containerClass => {
      gsap.set(containerClass, {
        clearProps: "all"
      });
    });
    sItemClass?.forEach(itemClass => {
      gsap.set(itemClass, {
        clearProps: "all"
      });
    });
  }
  document.addEventListener("aae-animation-event", handler);
  document.addEventListener("aae-reset-animation", removeAnimation);
}
horizontalScrollAnim();
/******/ })()
;
//# sourceMappingURL=horizontalScrollAnim.js.map