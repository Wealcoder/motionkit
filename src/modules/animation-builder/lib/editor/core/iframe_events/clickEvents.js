import { handleCloseMenuEvent } from "@/lib/editor/contextMenu/contextMenuEventTrigger";
import {
  dispathSelectorClipboardEvent,
  hideClassSelector,
  showClassSelector,
} from "../../classSelectorHelper";

// this is a general registered function which handle click event by data-actions key from iframe to editor

export const handleClickEvent = (event) => {
  const btn = event.target.closest("[data-action]");
  if (!btn) return;
  event.stopPropagation();
  event.preventDefault();

  switch (btn.dataset.action) {
    case "wcf-ab-load-animation":
      console.log("load animation inside editor");
      break;

    case "wcf-ab-create-animation":
      handleCloseMenuEvent();
      showClassSelector();
      break;

    case "wcfanimb-close-btn":
      hideClassSelector();
      break;

    case "wcf-ab-cpc-copy":
    case "wcf-ab-cpid-copy":
    case "wcf-ab-cccs-copy":
    case "wcf-ab-ccid-copy":
    case "wcf-ab-cccl-copy":
      dispathSelectorClipboardEvent(event);
      break;

    default:
      break;
  }
};
