/******/ (function() { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/modules/animation-builder/frontend/animationUtils.js":
/*!******************************************************************!*\
  !*** ./src/modules/animation-builder/frontend/animationUtils.js ***!
  \******************************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   extractLastSelector: function() { return /* binding */ extractLastSelector; },
/* harmony export */   extractNameAndValue: function() { return /* binding */ extractNameAndValue; },
/* harmony export */   getFullSelector: function() { return /* binding */ getFullSelector; },
/* harmony export */   getUniqueSelector: function() { return /* binding */ getUniqueSelector; },
/* harmony export */   handleMouseOver: function() { return /* binding */ handleMouseOver; },
/* harmony export */   hidePopup: function() { return /* binding */ hidePopup; },
/* harmony export */   resetAnimations: function() { return /* binding */ resetAnimations; },
/* harmony export */   showPopup: function() { return /* binding */ showPopup; }
/* harmony export */ });
function resetAnimations({
  config,
  timelines,
  createdScrollTriggers
}) {
  for (let x in timelines) {
    if (timelines[x].split && typeof timelines[x].split.revert === "function") {
      timelines[x].split.revert();
    }
    timelines[x].revert();
    timelines[x].kill();
  }
  createdScrollTriggers?.forEach(st => st.kill());
  createdScrollTriggers.length = 0;
  config?.forEach(section => {
    section.animations?.forEach(animation => {
      const selector = extractLastSelector(animation.applyAnimation.className);
      if (selector?.full && selector.full !== "") {
        gsap.set(selector.full, {
          clearProps: "all"
        });
      }
    });
  });
}
function getFullSelector(element) {
  const path = [];
  let depth = 0; // Track depth

  while (element && element.tagName.toLowerCase() !== "html" && depth < 5) {
    let selector = getUniqueSelector(element);
    // Check if the current element has an ID
    path.unshift(selector);
    if (document.querySelectorAll(selector).length === 1 || element.id) {
      break;
    }
    element = element.parentElement;
    depth++;
  }
  let result = path;
  if (path.length > 4) {
    result = [path[0], path[path.length - 1]];
  }
  return result.join(" ");
}
function getUniqueSelector(element) {
  const tag = element.tagName.toLowerCase();
  // Add ID if available
  if (element.id) {
    return `${tag}#${element.id}`; // Only tag and ID, skip classes
  }
  if (element.dataset.id) {
    let customClass = `.elementor-element-${element.dataset.id}`;
    if (document.querySelectorAll(customClass).length === 1) {
      return `${customClass}`; // Only tag and ID, skip classes
    }
  }

  // Add class names, excluding the hover-highlight class
  const classList = Array.from(element.classList).filter(cls => cls !== "wcf-animb--hover-highlight");
  if (classList.length > 0) {
    return `${tag}.${classList.join(".")}`; // Concatenated classes if no ID
  }
  return tag; // Return only tag if no ID or classes
}
function extractLastSelector(selector) {
  if (selector === undefined) {
    return {
      full: "",
      tag: "",
      classes: false,
      id: ""
    };
  }
  // Regular expression to match selectors based on common delimiters
  const lastPart = selector.trim().split(/[\s>+~]+/) // Split by spaces, >, +, or ~
  .pop() // Get the last element in the array
  .trim();

  // Extract the tag (if any) and classes (if any)
  const tag = lastPart.split(".")[0].split("#")[0]; // Takes the first part before classes or IDs
  const classes = lastPart.split(".").slice(1) // Remove the tag name
  .join("."); // Join classes back
  const id = lastPart.split("#")[1]; // Extract the ID if present

  return {
    full: lastPart,
    tag,
    classes,
    id
  };
}
function showPopup(selector, x, y) {
  const popup = document.getElementById("wcfanim-selectorPopup");
  const content = document.getElementById("wcfanim-popupContent");

  // Set the content of the popup (for example, display the selector string)
  content.textContent = selector;

  // Get the width and height of the popup and its content
  const popupWidth = popup.offsetWidth;
  const popupHeight = popup.offsetHeight;

  // Get the current viewport size
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;

  // Adjust the x-coordinate if the popup is too wide for the screen
  if (x + popupWidth > viewportWidth) {
    x = viewportWidth - popupWidth - 10; // Keep it 10px away from the right edge
  }

  // Adjust the y-coordinate if the popup is too tall for the screen
  if (y + popupHeight > viewportHeight) {
    y = viewportHeight - popupHeight - 10; // Keep it 10px away from the bottom edge
  }

  // Position the popup
  popup.style.left = `${x}px`;
  popup.style.top = `${y}px`;

  // Show the popup
  popup.style.display = "block";
}
function hidePopup() {
  const popup = document.getElementById("wcfanim-selectorPopup");
  popup.style.display = "none";
}
function extractNameAndValue(data) {
  return data.map(item => ({
    name: item.name,
    value: item.value
  }));
}
function handleMouseOver(event) {
  const target = event.target;
  if (target.classList.contains("wcfanimb-skip-selector")) {
    return;
  }
  if (target.closest(".wcfanimb-skip-selector-full")) {
    return;
  }
  target.classList.add("wcf-animb--hover-highlight");
  target.addEventListener("mouseleave", () => {
    target.classList.remove("wcf-animb--hover-highlight");
  }, {
    once: true
  });
}

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
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
// This entry needs to be wrapped in an IIFE because it needs to be isolated against other modules in the chunk.
!function() {
/*!**********************************************************************************!*\
  !*** ./src/modules/animation-builder/frontend/animation-type/customAnimation.js ***!
  \**********************************************************************************/
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   customAnimation: function() { return /* binding */ customAnimation; }
/* harmony export */ });
/* harmony import */ var _animationUtils__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../animationUtils */ "./src/modules/animation-builder/frontend/animationUtils.js");

function customAnimation() {
  const timelines = {};
  const createdScrollTriggers = [];
  let config = [];
  document.addEventListener("aae-animation-event", e => {
    const formattedConfig = e.detail || {};
    config = formattedConfig["custom"];
    formattedConfig["custom"]?.forEach(section => {
      const scrollConfig = section.ScrollTrigger;
      section.timelines?.forEach(timeline => {
        const config = timeline?.properties?.reduce((acc, prop) => {
          if (!prop.isError) {
            acc[prop.name] = prop.unit ? `${prop.value}${prop.unit}` : prop.value;
          }
          return acc;
        }, {});
        const createTimeline = gsap.timeline(config);
        timelines[timeline.id] = createTimeline;
      });
      section.animations.forEach(animation => {
        const timeline = timelines[animation.timeline];
        if (animation.applyAnimation.className && animation.applyAnimation.className !== "") {
          const findDrawSVG = animation?.properties?.find(el => el.name === "drawSVG" && el.value);
          const targetElement = document.querySelector(animation.applyAnimation.className);
          if (!targetElement) {
            console.warn(`Target not found for animation: ${animation.title}`);
            return;
          }

          // 👉 If drawSVG exists
          if (findDrawSVG) {
            let container = null;
            const selector = `path, circle, rect, line, polyline, polygon, ellipse, textPath`.trim();

            // First: check if target is inside an SVG (go upward)
            if (targetElement.closest("svg")) {
              container = targetElement.closest("svg");
            }

            // Second: if not found going upward, search inside (go downward)
            if (!container) {
              container = targetElement.querySelector("svg");
            }

            // If still not found, give up
            if (!container || container.tagName.toLowerCase() !== "svg") {
              console.warn("DrawSVG: No SVG container found");
              return;
            }

            // Find relevant SVG elements inside container
            let elems = container.querySelectorAll(selector);
            if (elems.length === 0) {
              console.warn("DrawSVG: no SVG elements found for", selector);
              return;
            }

            // Function to split complex paths
            function splitPaths(paths) {
              let toSplit = gsap.utils.toArray(paths);
              let newPaths = [];
              toSplit.forEach(element => {
                const tag = element.tagName.toLowerCase();
                if (tag === "circle" || tag === "rect" || tag === "ellipse" || tag === "line" || tag === "textpath") {
                  newPaths.push(element);
                  return;
                }
                if (tag === "path" || tag === "polyline" || tag === "polygon") {
                  const rawPath = MotionPathPlugin.getRawPath(element);
                  const parent = element.parentNode;
                  const attributes = Array.from(element.attributes);
                  if (!rawPath || rawPath.length === 0) return;
                  rawPath.forEach(segment => {
                    const newPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
                    attributes.forEach(attr => newPath.setAttribute(attr.name, attr.value));
                    newPath.setAttribute("d", `M${segment[0]},${segment[1]}C${segment.slice(2).join(",")}${segment.closed ? "z" : ""}`);
                    parent.insertBefore(newPath, element);
                    newPaths.push(newPath);
                  });
                  parent.removeChild(element);
                }
              });
              return newPaths;
            }
            const paths = splitPaths(elems);
            const totalLength = paths.reduce((sum, path) => sum + path.getTotalLength(), 0);
            const method = animation.method || "to";
            paths.forEach((path, index) => {
              const pathLength = path.getTotalLength();
              const position = animation.absoluteTime || index * 0.1;
              const properties = animation?.properties?.reduce((acc, prop) => {
                if (prop.type === "custom") {
                  const customArr = prop.value.split(",");
                  customArr.forEach(cItem => {
                    if (cItem !== "") {
                      const [key, value] = cItem.split(":");
                      if (key && value) acc[key.trim()] = value.trim();
                    }
                  });
                } else if (prop.name === "duration") {
                  const pathDuration = parseFloat(prop.value) * (pathLength / totalLength);
                  acc.duration = pathDuration;
                } else if (!prop.isError) {
                  acc[prop.name] = prop.unit ? `${prop.value}${prop.unit}` : prop.value;
                }
                return acc;
              }, {});
              timeline[method](path, properties, position);
            });
          } else {
            const properties = animation?.properties?.reduce((acc, prop) => {
              if (prop.type === "custom") {
                const customArr = prop.value.split(",");
                customArr.forEach(cItem => {
                  if (cItem !== "") {
                    const [key, value] = cItem.split(":");
                    if (key && value) acc[key.trim()] = value.trim();
                  }
                });
              } else if (!prop.isError) {
                acc[prop.name] = prop.unit ? `${prop.value}${prop.unit}` : prop.value;
              }
              return acc;
            }, {});
            let split;
            if (animation?.splitText?.enable) {
              function toBoolean(value) {
                return typeof value === "string" ? value.toLowerCase() === "true" : Boolean(value);
              }
              const config = {};
              animation?.splitText?.type ? config.type = animation?.splitText?.type : "";
              const maskVal = animation?.splitText?.mask;
              if (maskVal === "true" || maskVal === "false") {
                config.mask = toBoolean(maskVal);
              } else if (typeof maskVal === "string") {
                config.mask = maskVal;
              }
              animation?.splitText?.propIndex ? config.propIndex = toBoolean(animation?.splitText?.propIndex) : "";
              animation?.splitText?.autoSplit ? config.autoSplit = toBoolean(animation?.splitText?.autoSplit) : "";
              animation?.splitText?.charsClass ? config.charsClass = animation?.splitText?.charsClass : "";
              animation?.splitText?.wordsClass ? config.wordsClass = animation?.splitText?.wordsClass : "";
              animation?.splitText?.linesClass ? config.linesClass = animation?.splitText?.linesClass : "";
              animation?.splitText?.smartWrap ? config.smartWrap = toBoolean(animation?.splitText?.smartWrap) : "";
              animation?.splitText?.ignore ? config.ignore = animation?.splitText?.ignore : "";
              split = new SplitText(animation.applyAnimation.className, config);
              timeline.split = split;
            }
            const method = animation.method || "to";
            const target = animation?.splitText?.enable && split[animation?.splitText?.type] ? split[animation?.splitText?.type] : animation.applyAnimation.className;
            if (method === "fromTo") {
              timeline[method](target, {
                x: -100
              }, properties, animation.absoluteTime || undefined);
            } else {
              timeline[method](target, properties, animation.absoluteTime || undefined);
            }
          }
        }
      });

      // Scroll Trigger
      if (scrollConfig?.enable && scrollConfig.enable) {
        const scrolTime = timelines[scrollConfig.timeline];
        if (scrolTime && ScrollTrigger) {
          const final_scroll_configs = {
            animation: scrolTime,
            trigger: scrollConfig.trigger
          };
          if (scrollConfig.endTrigger) {
            final_scroll_configs.endTrigger = scrollConfig.endTrigger;
          }
          if (scrollConfig.start || scrollConfig.customStart) {
            final_scroll_configs.start = scrollConfig.start === "custom" ? scrollConfig.customStart : scrollConfig.start;
          }
          if (scrollConfig.end || scrollConfig.customEnd) {
            final_scroll_configs.end = scrollConfig.end === "custom" ? scrollConfig.customEnd : scrollConfig.end;
          }
          if (scrollConfig.scrub || scrollConfig.customScrub) {
            final_scroll_configs.scrub = scrollConfig.scrub === "true" ? true : scrollConfig.scrub === "false" ? false : scrollConfig.customScrub;
          }
          if (scrollConfig.pin || scrollConfig.customPin) {
            final_scroll_configs.pin = scrollConfig.pin === "true" ? true : scrollConfig.pin === "false" ? false : scrollConfig.customPin;
          }
          if (scrollConfig.pinSpacing) {
            final_scroll_configs.pinSpacing = scrollConfig.pinSpacing === "true";
          }
          const extraprops = (0,_animationUtils__WEBPACK_IMPORTED_MODULE_0__.extractNameAndValue)(scrollConfig.properties);
          extraprops.forEach(pinprop => {
            if (pinprop.name === "markers") {
              final_scroll_configs.markers = pinprop.value === "true";
            }
            if (pinprop.name === "anticipate pin") {
              final_scroll_configs.pinAnticipate = parseInt(pinprop.value, 10) || 0;
            }
            if (pinprop.name === "pinned container") {
              final_scroll_configs.pinContainer = pinprop.value || null;
            }
            if (pinprop.name === "pin type") {
              final_scroll_configs.pinType = pinprop.value || "fixed";
            }
            if (pinprop.name === "custom") {
              const ccustomArr = pinprop.value.split(",");
              if (ccustomArr.length) {
                ccustomArr.forEach(cItem => {
                  if (cItem != "") {
                    const SplcItem = cItem.split(":");
                    if (SplcItem.length > 1) {
                      final_scroll_configs[SplcItem[0].trim()] = SplcItem[1].trim();
                    }
                  }
                });
              }
            }
          });
          const st = ScrollTrigger.create(final_scroll_configs);
          createdScrollTriggers.push(st);
        }
      }
    });
  });
  document.addEventListener("aae-reset-animation", () => {
    (0,_animationUtils__WEBPACK_IMPORTED_MODULE_0__.resetAnimations)({
      config,
      timelines,
      createdScrollTriggers
    });
  });
}
customAnimation();
}();
/******/ })()
;
//# sourceMappingURL=customAnimation.js.map