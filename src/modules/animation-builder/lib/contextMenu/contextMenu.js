import { getFullSelector } from "@/lib/editor/classSelectorHelper";
import {
  handleCopyText,
  handleGenerateSampleData,
  handleGetAnimId,
} from "./contextMenuHelper";

// ##################### Context Menu Main #####################
const verifyContextCallback = (callback = () => {}) => {
  return (...args) => {
    const [e] = args;
    if (!e) {
      console.error("An error occured while displaying context menu!");
      return;
    }
    callback(...args);
  };
};

// closing context menu event dispatcher
export const handleCloseMenuEvent = () => {
  setTimeout(
    () => window.dispatchEvent(new Event("wcf-close-context-menu")),
    150
  );
};

// ##################### Context Menu Callbacks #####################

// copy class
export const handleContextMenuCopyClass = verifyContextCallback((e) => {
  try {
    const target = e ?? null;
    if (!target) return;
    const textToCopy = getFullSelector(target);
    if (!textToCopy) {
      console.error("An error occured while copying class name.");
    }
    handleCopyText(textToCopy);
  } catch (error) {
    console.error("An error occured while copying class name.", error);
  } finally {
    handleCloseMenuEvent();
  }
});

// copy parent class
export const handleContextMenuCopyParentClass = verifyContextCallback((e) => {
  try {
    const target = e ?? null;
    if (!target || !target.parentElement) return;
    const textToCopy = getFullSelector(target?.parentElement);
    if (!textToCopy) {
      console.error("An error occured while copying class name.");
    }
    handleCopyText(textToCopy);
  } catch (error) {
    console.error("An error occured while copying parent class name.", error);
  } finally {
    handleCloseMenuEvent();
  }
});

// create animation
export const handleAddContextMenu = verifyContextCallback((e, menu) => {
  try {
    const { contextMenuKey } = menu || {};
    if (!contextMenuKey) return;
    // TODO: Need to add classname on the animation item.
    const itemClass = getFullSelector(e);
    const sampleData = handleGenerateSampleData(contextMenuKey);
    window.parent.postMessage(
      {
        type: "WCF_AB_CREATE_ANIMATION",
        payload: { sampleData, itemClass, contextMenuKey },
      },
      "*"
    );
  } catch (error) {
    console.error("An error occured while adding animation.", error);
  } finally {
    handleCloseMenuEvent();
  }
});

// edit animation
export const handleEditAnimContextMenu = verifyContextCallback((e) => {
  try {
    const target = e ?? null;
    if (!target) return;
    // TODO: add wcfAnimId as data attribute to target element for free animation
    const id = handleGetAnimId(target);
    window.parent.postMessage(
      {
        type: "PANEL_ANIMATION_LIST_BUILDER",
        payload: { id: id },
      },
      "*"
    );
  } catch (error) {
    console.error("An error occured while editing animation.", error);
  } finally {
    handleCloseMenuEvent();
  }
});

// preview animation
export const handlePreviewAnimContextMenu = verifyContextCallback((e) => {
  try {
    const target = e ?? null;
    if (!target) return;
    const id = handleGetAnimId(target);
    window.parent.postMessage(
      {
        type: "WCF_AB_PREVIEW_ANIMATION",
        payload: { wcfAnimId: id },
      },
      "*"
    );
  } catch (error) {
    console.error("An error occured while previewing animation.", error);
  } finally {
    handleCloseMenuEvent();
  }
});

// copy animation
export const handleCopyAnimContextMenu = verifyContextCallback((e) => {
  try {
    const target = e ?? null;
    if (!target) return;
    const id = handleGetAnimId(target);
    if (!id) return;
    window.parent.postMessage(
      {
        type: "WCF_AB_COPY_ANIMATION",
        payload: { wcfAnimId: id },
      },
      "*"
    );
  } catch (error) {
    console.error("An error occured while copying animation.", error);
  } finally {
    handleCloseMenuEvent();
  }
});

// paste animation
export const handlePasteAnimContextMenu = verifyContextCallback((e) => {
  try {
    const target = e ?? null;
    if (!target) return;
    const id = handleGetAnimId(target);
    const payload = { wcfAnimId: id };

    // If no animation exists on the element, include the element selector for creating new animation
    if (!id && target.nodeType !== Node.TEXT_NODE) {
      payload.itemClass = getFullSelector(target);
    }

    window.parent.postMessage(
      {
        type: "WCF_AB_PASTE_ANIMATION",
        payload,
      },
      "*"
    );
  } catch (error) {
    console.error("An error occured while pasting animation.", error);
  } finally {
    handleCloseMenuEvent();
  }
});

// delete animation
export const handleDeleteAnimContextMenu = verifyContextCallback((e) => {
  try {
    const target = e ?? null;
    if (!target) return;
    const id = handleGetAnimId(target);
    window.parent.postMessage(
      {
        type: "WCF_AB_DELETE_ANIMATION",
        payload: { wcfAnimId: id },
      },
      "*"
    );
  } catch (error) {
    console.error("An error occured while deleting animation.", error);
  } finally {
    handleCloseMenuEvent();
  }
});

// save animation
export const handleSaveAnimContextMenu = verifyContextCallback((e) => {
  console.log("Save animation - to be implemented");
  return;
});

// Inspect
export const handleInspect = verifyContextCallback((e) => {
  const target = e;
  console.log(target);
});
