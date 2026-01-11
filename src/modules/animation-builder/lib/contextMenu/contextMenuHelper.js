import { getClosestAnimId } from "@/lib/editor/classSelectorHelper";
import { generateUniqueId } from "../../../../utils/generateUniqueId";
import { ABCustomPresetData } from "@/config/animationPresetData";
import { handleCloseMenuEvent } from "./contextMenuEventTrigger";
import { copyToClipboard } from "@/utils/copyToClipboard";
import { helpToastEvent } from "../events/toasterEvent";

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
export const handleCopyText = async (textToCopy) => {
  try {
    await copyToClipboard(textToCopy);
    helpToastEvent({
      type: "success",
      message: `Successfully copied element class`,
    });
  } catch (_) {
    console.warn("Unable to copy element class!");
  } finally {
    handleCloseMenuEvent();
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
