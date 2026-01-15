import AnimationStructure from "@/components/common/AnimationStructure";
import EditorContextMenu from "@/editor/Shared/context_menu/EditorContextMenu";
import "./index.css";
import {
  handleMouseOver,
  initOverlayRoot,
} from "@/lib/editor/classSelectorHelper";
import FreeAnimationEventHelperClass from "@/lib/FreeAnimation/previewEventHelper";
import { handleMediaQuery } from "@/lib/utils";
import ContextMenuHandler from "@/lib/registerContextMenu";
import { handleIframeKeyboardEvent } from "@/lib/editor/core/iframe_events/keyboardEvents";
import { handleIframeZoom } from "@/lib/editor/core/iframe_events/zoomEvent";
import {
  dispathContextMenu,
  registerContextMenu,
} from "@/lib/editor/contextMenu/contextMenu";
import { handleClickEvent } from "@/lib/editor/core/iframe_events/clickEvents";

let storeAnimation = {};

// Register context menus
window.AAEAnimPreviewBuilder = {};
AAEAnimPreviewBuilder.contextMenu = new ContextMenuHandler();
window.WCFFreeAnimBuilder = null;
WCFFreeAnimBuilder = new FreeAnimationEventHelperClass();

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

// intialized iframe events
function init() {
  // context menus handler
  registerContextMenu();

  // zoom and x axis placement event handler
  window.addEventListener("wheel", handleIframeZoom, {
    passive: false,
  });

  // keyboard event handler
  window.addEventListener("keydown", handleIframeKeyboardEvent);

  // displaying element selector
  document.body.addEventListener("mouseover", handleMouseOver);

  // handling element selector button actions
  document.addEventListener("click", handleClickEvent);

  // event for context menu
  document.addEventListener("contextmenu", dispathContextMenu);

  receivePageConfig();
}

window.addEventListener("load", (e) => {
  // mounting overlay root ,overlay modal root and iframe and editor kernel communications
  initOverlayRoot(e);
  init();

  const structure_panel = document.getElementById("wcf-anim-builder-structure");
  const context_menu = document.getElementById("wcf-ab-context-menu-wrapper");
  if (structure_panel) {
    wp.element.render(<AnimationStructure />, structure_panel);
  }
  if (context_menu) {
    wp.element.render(<EditorContextMenu />, context_menu);
  }
});
