import { getFullSelector } from "@/lib/animationUtils";

const verifyContextCallback = (callback = () => {}) => {
  return (...args) => {
    const [e] = args;
    if (!e) {
      console.error("Animation builder context menu event not found!");
      return;
    }
    callback(...args);
  };
};

const handleCopyText = (text, handleCloseMenu) => {
  if (navigator.clipboard && window.isSecureContext) {
    // Modern API for copying
    navigator.clipboard
      .writeText(text)
      .then(() => {
        // handleCloseMenu();
      })
      .catch((err) => {
        console.error("Failed to copy text: ", err);
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
        // handleCloseMenu();
      }
    } catch (err) {
      console.error("Error copying text: ", err);
    }
    // Clean up by removing the temporary textarea
    document.body.removeChild(tempTextarea);
  }
};

export const handleContextMenuCopyClass = verifyContextCallback((e) => {
  const { target } = e || {};
  if (!target) return;
  const textToCopy = getFullSelector(target);
  if (!textToCopy) {
    console.error("An error occured while copying class name.");
  }
  handleCopyText(textToCopy);
});

export const handleContextMenuCopyParentClass = verifyContextCallback((e) => {
  const { target } = e || {};
  if (!target) return;
  const textToCopy = getFullSelector(target?.parentElement);
  if (!textToCopy) {
    console.error("An error occured while copying class name.");
  }
  // handleCopyText(textToCopy);
  window.alert(textToCopy);
});

export const handleAddContextMenu = verifyContextCallback((e) => {
  console.log(handleAddContextMenu);
});

export const handleEditAnimContextMenu = verifyContextCallback((e) => {
  const { target } = e || {};
  const id = target?.dataset?.wcfAnimId || null;
  window.parent.postMessage(
    {
      type: "PANEL_ANIMATION_LIST_BUILDER",
      payload: { id: id },
    },
    "*"
  );
});
