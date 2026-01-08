/**
 * This file is used for editor preview only.
 */
import AnimationStructure from "@/components/common/AnimationStructure";
import EditorContextMenu from "./context_menu/EditorContextMenu";
import "./index.css";
import {
  handleMouseOver,
  hidePopup,
  showPopup,
} from "./lib/editor/classSelectorHelper";
import FreeAnimationEventHelperClass from "./lib/FreeAnimation/previewEventHelper";
import { handleMediaQuery } from "./lib/utils";
import { copySelectorMap } from "./config/editorConfig";
import ContextMenuHandler from "./context_menu/contextmenu";
import { handleCloseMenuEvent } from "./lib/contextMenu/contextMenu";
import { eventToKeyCombination } from "./lib/events/keyboardEventUtils";
import { menuItems } from "./register/context_menu/context_menu_register";
import { copyToClipboard } from "./utils/copyToClipboard";
import { helpToastEvent } from "./lib/events/toasterEvent";

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
    // closing selector when scroll.
    disableHover();
    hidePopup();
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
  // closing popup when close button clicked.
  closeBtn.addEventListener("click", () => {
    hidePopup();
    disableHover();
  });
  // displaying selector popup
  document.body.addEventListener("click", (event) => {
    event.preventDefault();
    const element = event.target;
    if (element.closest(".wcfanimb-skip-selector-full")) {
      return;
    }
    enableHover();
    const isSkip = element.classList.contains("wcfanimb-skip-selector");
    if (!isSkip) {
      showPopup(element, event.clientX + 10, event.clientY + 10);
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

  // copy to clipboard content.
  document.addEventListener("click", async (e) => {
    const svg = e.target.closest("svg.wcf-ab-selector-action-general");
    if (!svg) return;

    // differentiating for toast message
    const isIdBtnPressed = ["wcf-ab-cpid-copy", "wcf-ab-ccid-copy"]?.includes(
      svg?.id
    );

    const targetContentId = copySelectorMap[svg.id];
    if (!targetContentId) return;

    const contentEl = document.getElementById(targetContentId);
    if (!contentEl) return;

    const textToCopy = contentEl.dataset.selector?.trim();
    if (!textToCopy) return;

    try {
      await copyToClipboard(textToCopy);
      // triggering toast
      helpToastEvent({
        type: "success",
        message: `Successfully copied element ${
          isIdBtnPressed ? "id" : "class"
        }`,
      });
      disableHover();
      hidePopup();
    } catch (err) {
      helpToastEvent({
        type: "error",
        message: `The selected element ${
          isIdBtnPressed ? "id" : "class"
        } not available!`,
      });
      disableHover();
      hidePopup();
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
