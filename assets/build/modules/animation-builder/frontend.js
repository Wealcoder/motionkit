/******/ (function() { // webpackBootstrap
/*!***************************************************!*\
  !*** ./src/modules/animation-builder/frontend.js ***!
  \***************************************************/
const storeAnimation = {};
function playAnimation() {
  try {
    if (wcfanimb !== undefined && Object.keys(wcfanimb?.animation_config)?.length) {
      window.addEventListener("load", () => {
        setTimeout(() => {
          ScrollTrigger.refresh();
          let mm;
          mm?.revert?.();
          mm = gsap.matchMedia();
          wcfanimb?.device_config?.map(device => {
            mm.add(device.mediaQuery, () => {
              wcfanimb?.animation_config?.[device?.key].forEach(section => {
                if (section.enable) {
                  if (section.type === "preset") {
                    storeAnimation[section?.preset] = [...(storeAnimation[section?.preset] || []), section];
                  } else {
                    storeAnimation["custom"] = [...(storeAnimation["custom"] || []), section];
                  }
                }
              });
            });
          });
          const event = new CustomEvent("aae-animation-event", {
            detail: storeAnimation,
            // payload
            bubbles: true,
            // can bubble up the DOM
            cancelable: true // can be prevented
          });
          document.dispatchEvent(event);
        }, 100);
      });
    }
  } catch (err) {}
}
playAnimation();
/******/ })()
;
//# sourceMappingURL=frontend.js.map