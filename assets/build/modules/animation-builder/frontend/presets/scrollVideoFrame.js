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
  !*** ./src/modules/animation-builder/frontend/animation-type/preset/scrollVideoFrame.js ***!
  \******************************************************************************************/
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   scrollVideoFrame: function() { return /* binding */ scrollVideoFrame; }
/* harmony export */ });
function scrollVideoFrame() {
  let sTimeline = {};
  let sContainerClass = [];
  let sItemClass = [];
  const handler = e => {
    (e.detail["wcf-scroll-video-animation"] || []).forEach(section => {
      const {
        containerClass,
        containerHeight,
        itemClass
      } = section || {};
      sContainerClass.push(containerClass);
      sItemClass.push(itemClass);
      if (!containerClass && !containerHeight && !itemClass) return;
      gsap.set(containerClass, {
        height: containerHeight,
        transition: "none"
      });
      gsap.set(itemClass, {
        maxHeight: "100vh"
      });
      const video = document.querySelector(itemClass);
      let src = video.currentSrc || video.src;
      const videoScrollTL = gsap.timeline({
        defaults: {
          duration: 1
        },
        scrollTrigger: {
          trigger: containerClass,
          pin: true,
          start: "top top",
          end: "bottom bottom",
          scrub: true,
          pinSpacing: false
        }
      });
      sTimeline[section.id] = videoScrollTL;

      /* Make sure the video is 'activated' on iOS */
      function once(el, event, fn, opts) {
        var onceFn = function (e) {
          el.removeEventListener(event, onceFn);
          fn.apply(this, arguments);
        };
        el.addEventListener(event, onceFn, opts);
        return onceFn;
      }
      once(document.documentElement, "touchstart", function (e) {
        video.play();
        video.pause();
      });
      once(video, "loadedmetadata", function () {
        videoScrollTL.to(video, {
          currentTime: video.duration,
          ease: "none"
        });
      });
      setTimeout(function () {
        if (window["fetch"]) {
          fetch(src).then(response => response.blob()).then(response => {
            var blobURL = URL.createObjectURL(response);
            var t = video.currentTime;
            once(document.documentElement, "touchstart", function (e) {
              video.play();
              video.pause();
            });
            video.setAttribute("src", blobURL);
            video.currentTime = t + 0.01;
          });
        }
      }, 1000);
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
scrollVideoFrame();
/******/ })()
;
//# sourceMappingURL=scrollVideoFrame.js.map