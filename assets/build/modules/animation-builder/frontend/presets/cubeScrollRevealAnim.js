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
  !*** ./src/modules/animation-builder/frontend/animation-type/preset/cubeScrollRevealAnim.js ***!
  \**********************************************************************************************/
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   cubeScrollRevealAnim: function() { return /* binding */ cubeScrollRevealAnim; }
/* harmony export */ });
function cubeScrollRevealAnim() {
  let sTimeline = {};
  let sItemClass = [];
  const handler = e => {
    (e.detail["wcf-cube-scroll-reveal-animation"] || []).forEach(data => {
      const {
        itemClass,
        endSectionClass,
        cubeMinWidth,
        cubeMaxWidth,
        cubeMaxHeight,
        position,
        expandFace,
        scale,
        frontMedia,
        backMedia,
        leftMedia,
        rightMedia,
        topMedia,
        bottomMedia,
        cubeAnimStart,
        cubeAnimCStart
      } = data || {};
      if (!(itemClass && endSectionClass)) return;
      sItemClass.push(itemClass);
      const cubeMinWidthNum = parseFloat(cubeMinWidth);
      const cubeMaxWidthNum = parseFloat(cubeMaxWidth);
      const cubeMaxHeightNum = parseFloat(cubeMaxHeight);
      const positionNum = parseFloat(position);
      const scaleNum = parseFloat(scale);
      const container = document.querySelector(itemClass);
      if (!container) return;
      container.classList.add("wcfanimb-skip-selector-full");
      container.innerHTML = '';
      const scrollContainer = document.createElement('div');
      scrollContainer.className = 'aab_wc-scroll-container';
      const scene = document.createElement('div');
      scene.className = 'aab_wc-scene';
      const animContainer = document.createElement('div');
      animContainer.className = 'aab_wc-animation-container';
      animContainer.style.width = `${cubeMinWidthNum}px`;
      animContainer.style.height = `${cubeMinWidthNum}px`;
      const cube = document.createElement('div');
      cube.className = 'aab_wc-cube';
      const mediaMap = {
        front: frontMedia,
        back: backMedia,
        left: leftMedia,
        right: rightMedia,
        top: topMedia,
        bottom: bottomMedia
      };
      const getFaceContent = faceName => {
        const media = mediaMap[faceName];
        if (!media || !media.url) {
          return '';
        }
        if (media.type === 'video') {
          return `
            <div class="aab_wc-video-player">
              <video class="aab_wc-video" data-face="${faceName}" muted loop playsinline>
                <source src="${media.url}" type="video/mp4" />
              </video>
            </div>
          `;
        } else if (media.type === 'image') {
          return `<img src="${media.url}" alt="${faceName}" />`;
        }
        return '';
      };
      const faces = [{
        class: 'aab_wc-front',
        name: 'front'
      }, {
        class: 'aab_wc-back',
        name: 'back'
      }, {
        class: 'aab_wc-right',
        name: 'right'
      }, {
        class: 'aab_wc-left',
        name: 'left'
      }, {
        class: 'aab_wc-top',
        name: 'top'
      }, {
        class: 'aab_wc-bottom',
        name: 'bottom'
      }];
      faces.forEach(face => {
        const faceElement = document.createElement('div');
        faceElement.className = `aab_wc-face ${face.class}`;
        faceElement.innerHTML = getFaceContent(face.name);
        cube.appendChild(faceElement);
      });
      const videoControl = document.createElement('button');
      videoControl.className = 'aab_wc-video-control';
      videoControl.textContent = 'Play';
      animContainer.appendChild(cube);
      scene.appendChild(animContainer);
      scene.appendChild(videoControl);
      scrollContainer.appendChild(scene);
      container.appendChild(scrollContainer);
      const style = document.createElement('style');
      style.textContent = `

        ${itemClass} {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
          
        }
        ${itemClass} .aab_wc-scroll-container {
          position: relative;
          z-index: 9999999999
        }
        ${itemClass} .aab_wc-scene {
          width: 100%;
          display: flex;
          justify-content: center;
          position: relative;
        }
        ${itemClass} .aab_wc-animation-container {
          position: relative;
          transform-style: preserve-3d;
          perspective: 1000px;
        }
        ${itemClass} .aab_wc-cube {
          width: 100%;
          height: 100%;
          position: relative;
          transform-style: preserve-3d;
          transform: rotateX(-30deg) rotateY(45deg);
        }
        ${itemClass} .aab_wc-face {
          position: absolute;
          width: 100%;
          height: 100%;
          display: flex;
          justify-content: center;
          align-items: center;
          backface-visibility: hidden;
          overflow: hidden;
        }
        ${itemClass} .aab_wc-face img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        ${itemClass} .aab_wc-front {
          transform: translateZ(${cubeMinWidthNum / 2}px);
        }
        ${itemClass} .aab_wc-back {
          transform: rotateY(180deg) translateZ(${cubeMinWidthNum / 2}px);
        }
        ${itemClass} .aab_wc-right {
          transform: rotateY(90deg) translateZ(${cubeMinWidthNum / 2}px);
        }
        ${itemClass} .aab_wc-left {
          transform: rotateY(-90deg) translateZ(${cubeMinWidthNum / 2}px);
        }
        ${itemClass} .aab_wc-top {
          transform: rotateX(90deg) translateZ(${cubeMinWidthNum / 2}px);
        }
        ${itemClass} .aab_wc-bottom {
          transform: rotateX(-90deg) translateZ(${cubeMinWidthNum / 2}px);
        }
        ${itemClass} .aab_wc-video-player {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          overflow: hidden;
        }
        ${itemClass} .aab_wc-video {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        ${itemClass} .aab_wc-video-control {
          position: absolute;
          background: rgba(0, 0, 0, 0.7);
          color: #fff;
          border: none;
          border-radius: 100px;
          padding: 8px 16px;
          cursor: pointer;
          font-size: 12px;
          transition: all 0.3s ease;
          z-index: 10;
          height: 100px;
          width: 100px;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          opacity: 0;
          display: none;
        }
        ${itemClass} .aab_wc-animation-container:hover + .aab_wc-video-control,
        ${itemClass} .aab_wc-video-control:hover {
          opacity: 1;
        }
      `;
      container.appendChild(style);
      const controlBtn = container.querySelector(".aab_wc-video-control");
      const animContainerEl = container.querySelector(".aab_wc-animation-container");
      const cubeEl = container.querySelector(".aab_wc-cube");
      const front = container.querySelector(".aab_wc-front");
      const back = container.querySelector(".aab_wc-back");
      const right = container.querySelector(".aab_wc-right");
      const left = container.querySelector(".aab_wc-left");
      const topFace = container.querySelector(".aab_wc-top");
      const bottom = container.querySelector(".aab_wc-bottom");
      const face = container.querySelectorAll(".aab_wc-face");
      const expandingFaceMedia = mediaMap[expandFace];
      const hasExpandingVideo = expandingFaceMedia?.type === 'video' && expandingFaceMedia?.url;
      const video = hasExpandingVideo ? container.querySelector(`.aab_wc-video[data-face="${expandFace}"]`) : null;
      const faceRotations = {
        front: {
          rotationY: 0,
          rotationX: 0
        },
        back: {
          rotationY: 180,
          rotationX: 0
        },
        right: {
          rotationY: -90,
          rotationX: 0
        },
        left: {
          rotationY: 90,
          rotationX: 0
        },
        top: {
          rotationY: 0,
          rotationX: -90
        },
        bottom: {
          rotationY: 0,
          rotationX: 90
        }
      };
      const targetRotation = faceRotations[expandFace] || faceRotations.front;
      const allFaces = [front, back, right, left, topFace, bottom];
      const faceElements = {
        front: front,
        back: back,
        right: right,
        left: left,
        top: topFace,
        bottom: bottom
      };
      const facesToHide = allFaces.filter(face => face !== faceElements[expandFace]);
      const showVideoControls = hasExpandingVideo && video;
      const endElement = document.querySelector(endSectionClass);
      let endDistance = window.innerHeight * 1.5;
      if (endElement) {
        const containerRect = scrollContainer.getBoundingClientRect();
        const endRect = endElement.getBoundingClientRect();
        const containerTop = containerRect.top + window.scrollY;
        const endTop = endRect.top + window.scrollY;
        endDistance = endTop - containerTop;
      }
      const cubeTimeline = gsap.timeline({
        scrollTrigger: {
          trigger: scrollContainer,
          start: cubeAnimStart === 'custom' ? cubeAnimCStart : cubeAnimStart,
          end: "+=" + endDistance,
          scrub: 1,
          pin: true,
          pinSpacing: false
        }
      });
      cubeTimeline.to(animContainerEl, {
        scale: scaleNum,
        duration: 0.8
      }, 0);
      cubeTimeline.to(scene, {
        x: positionNum
      }, 0);
      cubeTimeline.to(cubeEl, {
        rotationY: targetRotation.rotationY,
        rotationX: targetRotation.rotationX,
        rotate: 0,
        duration: 1.3
      }, 0);
      cubeTimeline.to(animContainerEl, {
        width: cubeMaxWidthNum,
        height: cubeMaxHeightNum,
        scale: 1,
        duration: 0.5
      }, 1.5);
      cubeTimeline.to(face, {
        scale: 0.9,
        duration: 0.8
      }, 1.5);
      cubeTimeline.to(facesToHide, {
        opacity: 0,
        duration: 0.5
      }, 1.5);
      if (showVideoControls) {
        cubeTimeline.to(controlBtn, {
          display: "block",
          duration: 0.1
        }, 1.5);
        cubeTimeline.eventCallback("onUpdate", () => {
          if (video) {
            if (cubeTimeline.progress() >= 0.7 && video.paused) {
              video.play().catch(e => console.log('Video play failed:', e));
              controlBtn.textContent = "Pause";
            } else if (cubeTimeline.progress() < 0.7 && !video.paused) {
              video.pause();
              controlBtn.textContent = "Play";
            }
          }
        });
        ScrollTrigger.create({
          trigger: scrollContainer,
          start: cubeAnimStart === "custom" ? cubeAnimCStart : cubeAnimStart,
          end: "+=" + endDistance,
          onEnter: () => {
            if (cubeTimeline.progress() >= 0.7 && video) {
              video.play().catch(e => console.log('Video play failed:', e));
              controlBtn.textContent = "Pause";
            }
          },
          onEnterBack: () => {
            if (cubeTimeline.progress() >= 0.7 && video) {
              video.play().catch(e => console.log('Video play failed:', e));
              controlBtn.textContent = "Pause";
            }
          },
          onLeave: () => {
            if (video) {
              video.pause();
              controlBtn.textContent = "Play";
            }
          },
          onLeaveBack: () => {
            if (video) {
              video.pause();
              controlBtn.textContent = "Play";
            }
          }
        });
        if (controlBtn && video) {
          controlBtn.addEventListener("click", () => {
            if (video.paused) {
              video.play();
              controlBtn.textContent = "Pause";
            } else {
              video.pause();
              controlBtn.textContent = "Play";
            }
          });
        }
      }
      sTimeline[itemClass] = {
        cubeTimeline
      };
    });
  };
  function removeAnimation() {
    for (let x in sTimeline) {
      if (sTimeline[x]) {
        sTimeline[x].cubeTimeline?.scrollTrigger?.kill();
        sTimeline[x].cubeTimeline?.kill();
      }
    }
    sItemClass?.forEach(itemClass => {
      gsap.set(itemClass, {
        clearProps: "all"
      });
      const container = document.querySelector(itemClass);
      if (container) {
        container.innerHTML = "";
      }
    });
    sTimeline = {};
    sItemClass = [];
  }
  document.addEventListener("aae-animation-event", handler);
  document.addEventListener("aae-reset-animation", removeAnimation);
}
cubeScrollRevealAnim();
/******/ })()
;
//# sourceMappingURL=cubeScrollRevealAnim.js.map