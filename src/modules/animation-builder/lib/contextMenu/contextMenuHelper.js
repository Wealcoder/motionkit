import { getClosestAnimId, getFullSelector } from "@/lib/animationUtils";
import { generateUniqueId } from "../../../../utils/generateUniqueId";
import { ABCustomPresetData } from "@/config/animationPresetData";

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

// get animation id
export const handleGetAnimId = (element) => {
  let id = null;
  // if target has animation id use it otherwise check closest parent for animation id.
  if (element?.dataset?.wcfAnimId) {
    id = element?.dataset?.wcfAnimId;
  } else {
    id = getClosestAnimId(element);
  }
  return id;
};

// closing context menu event dispatcher
export const handleCloseMenuEvent = () => {
  window.dispatchEvent(new Event("wcf-close-context-menu"));
  return;
};

// copy clipboard helper
export const handleCopyText = (text) => {
  if (navigator.clipboard && window.isSecureContext) {
    // Modern API for copying
    navigator.clipboard
      .writeText(text)
      .then(() => {
        handleCloseMenuEvent();
      })
      .catch((err) => {
        console.error("Failed to copy text: ", err);
        handleCloseMenuEvent();
      });
  } else {
    // Fallback to manual method for older browsers
    const tempTextarea = document.createElement("textarea");
    tempTextarea.value = text;

    // Style the textarea to be offscreen
    tempTextarea.style.position = "fixed";
    tempTextarea.style.top = "-9999px";
    document.body.appendChild(tempTextarea);

    // Select the text inside the textarea
    tempTextarea.focus();
    tempTextarea.select();

    try {
      if (document.execCommand("copy")) {
        handleCloseMenuEvent();
      } else {
        handleCloseMenuEvent();
      }
    } catch (err) {
      console.error("Error copying text: ", err);
      handleCloseMenuEvent(); // Close menu on error
    }
    // Clean up by removing the temporary textarea
    document.body.removeChild(tempTextarea);
  }
};

// copy class
export const handleContextMenuCopyClass = verifyContextCallback((e) => {
  const target = e ?? null;
  if (!target) return;
  const textToCopy = getFullSelector(target);
  if (!textToCopy) {
    console.error("An error occured while copying class name.");
  }
  handleCopyText(textToCopy);
});

// copy parent class
export const handleContextMenuCopyParentClass = verifyContextCallback((e) => {
  const target = e ?? null;
  const textToCopy = getFullSelector(target?.parentElement);
  if (!textToCopy) {
    console.error("An error occured while copying class name.");
  }
  handleCopyText(textToCopy);
});

// create animation
export const handleAddContextMenu = verifyContextCallback((e, menu) => {
  const { contextMenuKey } = menu || {};
  if (!contextMenuKey) return;
  const itemClass = getFullSelector(e); // TODO: Need to add classname on the animation item.
  let sampleData = {};
  switch (contextMenuKey) {
    case "wcf-ab-ca-classic":
      sampleData = {
        id: generateUniqueId(),
        title: "Free Animation",
        type: "free_animation",
        enable: true,
      };
      break;
    case "wcf-ab-ca-preset":
      sampleData = {
        id: generateUniqueId(),
        title: "Animation Title",
        type: "preset",
        enable: true,
      };
      break;
    case "wcf-ab-ca-custom":
      sampleData = {
        ...ABCustomPresetData,
        id: generateUniqueId(),
        title: ABCustomPresetData.title,
      };
      break;
    default:
      return;
  }
  window.parent.postMessage(
    {
      type: "WCF_AB_CREATE_ANIMATION",
      payload: { sampleData, itemClass, contextMenuKey },
    },
    "*"
  );
  handleCloseMenuEvent();
});

// edit animation
export const handleEditAnimContextMenu = verifyContextCallback((e) => {
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
  handleCloseMenuEvent();
});

// preview animation
export const handlePreviewAnimContextMenu = verifyContextCallback((e) => {
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
  handleCloseMenuEvent();
});

// copy animation
export const handleCopyAnimContextMenu = verifyContextCallback((e) => {
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
  handleCloseMenuEvent();
});

// paste animation
export const handlePasteAnimContextMenu = verifyContextCallback((e) => {
  const target = e ?? null;
  if (!target) return;
  const id = handleGetAnimId(target);
  window.parent.postMessage(
    {
      type: "WCF_AB_PASTE_ANIMATION",
      payload: { wcfAnimId: id },
    },
    "*"
  );
  handleCloseMenuEvent();
});

// delete animation
export const handleDeleteAnimContextMenu = verifyContextCallback((e) => {
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
  handleCloseMenuEvent();
});

// save animation
export const handleSaveAnimContextMenu = verifyContextCallback((e) => {
  console.log("Save animation - to be implemented");
  return;
});
