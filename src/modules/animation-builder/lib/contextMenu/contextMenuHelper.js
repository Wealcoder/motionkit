import { getClosestAnimId } from "@/lib/editor/classSelectorHelper";
import { generateUniqueId } from "../../../../utils/generateUniqueId";
import { ABCustomPresetData } from "@/config/animationPresetData";
import { handleCloseMenuEvent } from "./contextMenu";

// ##################### Context Menu Helper Functions #####################
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
      console.error("Failed to copy text!");
      handleCloseMenuEvent(); // Close menu on error
    }
    // Clean up by removing the temporary textarea
    document.body.removeChild(tempTextarea);
  }
};

export const handleGenerateSampleData = (contextMenuKey) => {
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
  return sampleData;
};

export const handleFilterAnimation = (allAnimation, wcfAnimId) => {
  if (!allAnimation || !wcfAnimId) return {};
  return Object.entries(allAnimation)?.reduce((acc, [key, value]) => {
    const matched = value?.find((anim) => anim.id === wcfAnimId);
    if (matched) {
      acc[key] = [matched];
    }
    return acc;
  }, {});
};
