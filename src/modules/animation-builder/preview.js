/**
 * This file is used for editor preview only.
 */
import {
  getFullSelector,
  handleMouseOver,
  hidePopup,
  showPopup,
} from "./lib/animationUtils";
import AnimationStructure from "@/components/common/AnimationStructure";
import EditorContextMenu from "./context_menu/EditorContextMenu";
import "./index.css";
import { handleMediaQuery } from "./lib/utils";
import FreeAnimationEventHelperClass from "./lib/FreeAnimation/previewEventHelper";

import ContextMenuHandler from "./context_menu/contextmenu";
import { menuItems } from "./register/context_menu/context_menu_register";
import { handleCloseMenuEvent } from "./lib/contextMenu/contextMenu";
import { eventToKeyCombination } from "./lib/events/keyboardEventUtils";

const storeState = {
  hoverEnabled: false,
  maxZoom: 1.5,
  minZoom: 0.7,
  zoom: 1,
  xplacement: 0,
};

let storeAnimation = {};

// Register context menus
window.AAEAnimPreviewBuilder = {};
AAEAnimPreviewBuilder.contextMenu = new ContextMenuHandler();

window.WCFFreeAnimBuilder = null;
WCFFreeAnimBuilder = new FreeAnimationEventHelperClass();

// zoom and x axis placement event handler
window.addEventListener(
  "wheel",
  (e) => {
    if (e.shiftKey) {
      e.preventDefault();
      e.stopPropagation();
      storeState.xplacement += e.deltaY < 0 ? 10 : -10;
      window.parent.postMessage(
        {
          type: "WCF_AB_WHEEL_EVENT_X_PLACEMENT",
          value: storeState.xplacement,
        },
        "*"
      );
    } else if (e.ctrlKey) {
      e.preventDefault();
      storeState.zoom += e.deltaY < 0 ? 0.1 : -0.1;
      storeState.zoom = Math.min(
        storeState.maxZoom,
        Math.max(storeState.minZoom, Number(storeState.zoom.toFixed(2)))
      );
      window.parent.postMessage(
        {
          type: "WCF_AB_WHEEL_EVENT",
          value: storeState.zoom,
        },
        "*"
      );
    }
  },
  { passive: false }
);

// keyboard event handler
window.addEventListener("keydown", (e) => {
  const pressetKeys = eventToKeyCombination(e);
  window.parent.postMessage(
    {
      type: "WCF_AB_KEYDOWN_EVENT",
      value: pressetKeys,
    },
    "*"
  );
});

// context menus handler
function handleAddContextMenus() {
  menuItems?.forEach((menu) =>
    AAEAnimPreviewBuilder.contextMenu.register(menu)
  );
}
handleAddContextMenus();

function enableHover() {
  if (!storeState.hoverEnabled) {
    document.body.addEventListener("mouseover", handleMouseOver);
    storeState.hoverEnabled = true;
  }
}

function disableHover() {
  if (storeState.hoverEnabled) {
    document.body.removeEventListener("mouseover", handleMouseOver);
    storeState.hoverEnabled = false;
  }
}

function receivePageConfig() {
  window.addEventListener(
    "message",
    (event) => {
      if ("wcf-animation-config" in event.data) {
        disableHover();
        storeAnimation = {};
        let mm;

        if (window.gsap) {
          mm?.revert();
          mm = gsap.matchMedia();
          wcf_anim_preview_object?.device_config?.map((device) => {
            mm.add(device.mediaQuery, () => {
              event.data["wcf-animation-config"]?.[device?.key].forEach(
                (section) => {
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
                }
              );
            });
          });
        }

        wcf_anim_preview_object?.device_config?.map((device) => {
          handleMediaQuery(device.mediaQuery, () => {
            event.data["wcf-animation-config"]?.[device?.key].forEach(
              (section) => {
                if (section.enable) {
                  if (section.type === "free_animation") {
                    storeAnimation[section?.preset] = [
                      ...(storeAnimation[section?.preset] || []),
                      section,
                    ];
                  }
                }
              }
            );
          });
        });
        // GSAP check end
        const cEvent = new CustomEvent("aae-animation-event", {
          detail: storeAnimation,
          bubbles: true,
          cancelable: true,
        });

        document.dispatchEvent(cEvent);
      }

      if ("wcf-animation-config-reset" in event.data) {
        const cEvent = new CustomEvent("aae-reset-animation", {
          detail: "",
          bubbles: true,
          cancelable: true,
        });

        document.dispatchEvent(cEvent);
      }
    },
    false
  );

  setTimeout(() => {
    window.parent.postMessage(wcf_anim_preview_object);
  }, 1000);
}

function runPopup() {
  const closeBtn = document.querySelector(".wcfanimb-close-btn");
  const selectorContent = document.getElementById("wcfanim-popupContent");

  closeBtn.addEventListener("click", () => {
    hidePopup();
    disableHover();
  });

  document
    .getElementById("wcfanim-expendSelector")
    .addEventListener("click", (e) => {
      selectorContent.classList.toggle("close");

      if (selectorContent.classList.contains("close")) {
        document.getElementById("wcfanim-expendSelector").textContent =
          "Expand";
      } else {
        document.getElementById("wcfanim-expendSelector").textContent =
          "Shrink";
      }
    });

  document.body.addEventListener("click", (event) => {
    event.preventDefault();

    const target = event.target;
    if (target.closest(".wcfanimb-skip-selector-full")) {
      return;
    }

    // collecting element classname
    const selector = getFullSelector(target);
    enableHover();

    const isSkip = target.classList.contains("wcfanimb-skip-selector");

    if (!isSkip) {
      showPopup(selector, event.clientX + 10, event.clientY + 10);
      handleCloseMenuEvent(); // closing context menu
    }
  });

  // context menu event handler
  document.body.addEventListener("contextmenu", (event) => {
    event.preventDefault();
    hidePopup();

    const target = event.target;
    if (target.closest(".wcfanimb-skip-selector-full")) return;
    AAEAnimPreviewBuilder.contextMenu.updateContextMenu({
      target,
      x: event.clientX,
      y: event.clientY,
    });
    window.dispatchEvent(new CustomEvent("wcf-open-context-menu"));
  });

  document
    .getElementById("wcfanim-copySelector")
    .addEventListener("click", () => {
      const textElement = document.getElementById("wcfanim-popupContent");
      const textToCopy = textElement.textContent;

      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard
          .writeText(textToCopy)
          .then(() => {
            disableHover();
            hidePopup();
          })
          .catch((err) => {
            console.error("Failed to copy text: ", err);
          });
      } else {
        const tempTextarea = document.createElement("textarea");
        tempTextarea.value = textToCopy;

        tempTextarea.style.position = "fixed";
        tempTextarea.style.top = "-9999px";
        document.body.appendChild(tempTextarea);

        tempTextarea.focus();
        tempTextarea.select();

        try {
          if (document.execCommand("copy")) {
            disableHover();
            hidePopup();
          }
        } catch (err) {
          console.error("Error copying text: ", err);
        }

        document.body.removeChild(tempTextarea);
      }
    });
}

enableHover();
runPopup();
receivePageConfig();

window.addEventListener("load", () => {
  const structure_panel = document.getElementById("wcf-anim-builder-structure");
  const context_menu = document.getElementById("wcf-ab-context-menu-wrapper");
  if (structure_panel) {
    wp.element.render(<AnimationStructure />, structure_panel);
  }
  if (context_menu) {
    wp.element.render(<EditorContextMenu />, context_menu);
  }
});
