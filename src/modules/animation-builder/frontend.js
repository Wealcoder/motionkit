/**
 * This file is used for frontend live preview.
 */

import FreeAnimationEventHelperClass from "./lib/FreeAnimation/previewEventHelper";
import { handleMediaQuery } from "./lib/utils";
const storeAnimation = {};
window.WCFFreeAnimBuilder = null;
WCFFreeAnimBuilder = new FreeAnimationEventHelperClass();

function playAnimation() {
  try {
    if (
      wcfanimb !== undefined &&
      Object.keys(wcfanimb?.animation_config)?.length
    ) {
      window.addEventListener("load", () => {
        setTimeout(() => {
          ScrollTrigger.refresh();
          let mm;

          mm?.revert?.();
          mm = gsap.matchMedia();

          wcfanimb?.device_config?.map((device) => {
            mm.add(device.mediaQuery, () => {
              wcfanimb?.animation_config?.[device?.key].forEach((section) => {
                if (section.enable) {
                  if (section.type === "preset") {
                    storeAnimation[section?.preset] = [
                      ...(storeAnimation[section?.preset] || []),
                      section,
                    ];
                  } else if (section.type === "custom") {
                    storeAnimation["custom"] = [
                      ...(storeAnimation["custom"] || []),
                      section,
                    ];
                  }
                }
              });
            });
          });

          wcfanimb?.device_config?.map((device) => {
            handleMediaQuery(device.mediaQuery, () => {
              wcfanimb?.animation_config?.[device?.key].forEach((section) => {
                if (section.enable) {
                  if (section.type === "free_animation") {
                    storeAnimation[section?.preset] = [
                      ...(storeAnimation[section?.preset] || []),
                      section,
                    ];
                  }
                }
              });
            });
          });

          const event = new CustomEvent("aae-animation-event", {
            detail: storeAnimation, // payload
            bubbles: true, // can bubble up the DOM
            cancelable: true, // can be prevented
          });

          document.dispatchEvent(event);
        }, 100);
      });
    }
  } catch (err) {
    console.error("PlayAnimation Error", { err });
  }
}

playAnimation();
