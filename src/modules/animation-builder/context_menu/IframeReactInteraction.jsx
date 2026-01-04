import { useContext, useEffect } from "react";
import { AppContext } from "@/context/app.context";
import { useAnimationControl, useContentStep } from "@/hooks/app.hooks";
import {
  handleCopyText,
  handleFilterAnimation,
} from "@/lib/contextMenu/contextMenuHelper";
import { getResponsiveAndBelow } from "@/lib/utils";
import { generateUniqueId } from "../../../utils/generateUniqueId";

const IframeReactInteraction = ({ children }) => {
  const { setContentStep } = useContentStep();
  const {
    allAnimation,
    createAnimation,
    deleteAnimation,
    updateAnimation,
    setAllAnimation,
  } = useAnimationControl();

  // Get mainState for selectedDevice
  const { mainState } = useContext(AppContext);

  // context menu helper function to communicate preview iframe with editor using event listener
  const handleMessage = (event) => {
    // create animation
    if (event.data.type === "WCF_AB_CREATE_ANIMATION") {
      const { sampleData, itemClass, contextMenuKey } = event.data.payload;
      if (!sampleData || !sampleData.id || !contextMenuKey) return;
      setContentStep({
        step: 2,
        data: sampleData,
      });
      createAnimation(sampleData);
      // TODO: need to add classname on the animation data.
      return;
    }

    // preview animation
    if (event.data.type === "WCF_AB_PREVIEW_ANIMATION") {
      const { wcfAnimId } = event.data.payload;
      if (!wcfAnimId) return;
      // filter animation by id
      const filteredAnimation = handleFilterAnimation(allAnimation, wcfAnimId);
      if (Object.keys(filteredAnimation).length === 0) return;
      const iframe = document.getElementById(
        "wcf--animation-builder--animation--preview"
      );
      const win = iframe.contentWindow;
      win.postMessage({ "wcf-animation-config": filteredAnimation });
      return;
    }

    // copy animation
    if (event.data.type === "WCF_AB_COPY_ANIMATION") {
      const { wcfAnimId } = event.data.payload;
      if (!wcfAnimId) return;
      // generate new id for copied animation
      const newUniqueAnimId = generateUniqueId();
      // filter animation by id
      const filteredAnimation = Object.entries(allAnimation).reduce(
        (acc, [key, value]) => {
          const matched = value?.find((anim) => anim.id === wcfAnimId);
          if (matched) {
            matched["id"] = newUniqueAnimId;
            acc[key] = [matched];
          }
          return acc;
        },
        {}
      );
      // if secure context then use navigator clipboard api otherwise use session storage
      if (navigator.clipboard && window.isSecureContext) {
        handleCopyText(JSON.stringify(filteredAnimation));
      } else {
        handleClipboard({ action: "copy", data: filteredAnimation });
      }
      return;
    }

    // paste animation
    if (event.data.type === "WCF_AB_PASTE_ANIMATION") {
      // process pasted animation
      const processPasteAnimation = (pastedData) => {
        const { wcfAnimId, itemClass } = event.data.payload;
        const responsiveDevices = getResponsiveAndBelow(
          mainState.selectedDevice
        );
        const result = { ...mainState.allAnimation };

        const pastedAnimEntry = Object.entries(pastedData)[0];
        if (!pastedAnimEntry) return;

        const [deviceKey, pastedAnimations] = pastedAnimEntry;
        const pastedAnim = pastedAnimations[0]; // Should be a single animation

        if (!pastedAnim) return;

        // Generate new unique id for the pasted animation
        const newUniqueAnimId = generateUniqueId();
        const newAnimation = { ...pastedAnim, id: newUniqueAnimId };

        if (wcfAnimId) {
          // Replace existing animation for all responsive devices
          responsiveDevices.forEach((device) => {
            if (!result[device]) {
              result[device] = [];
            }
            result[device] = result[device].map((anim) =>
              anim.id === wcfAnimId ? { ...newAnimation } : anim
            );
          });
        } else if (itemClass) {
          // Add new animation with the element class for all responsive devices
          newAnimation.itemClass = itemClass;
          responsiveDevices.forEach((device) => {
            if (!result[device]) {
              result[device] = [];
            }
            result[device] = [...result[device], { ...newAnimation }];
          });
        }

        // Update the animations
        setAllAnimation(result);

        // Save to server
        updateAnimation(result);
      };

      // Get pasted animation data from clipboard (navigator.clipboard works only in secure context i.e. https or localhost) or from session storage
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard
          .readText()
          .then((clipboardText) => {
            try {
              const currentAnim = JSON.parse(clipboardText || "{}");
              processPasteAnimation(currentAnim);
            } catch (error) {
              console.error("Failed to parse clipboard data:", error);
            }
          })
          .catch((error) => {
            console.error("Failed to read clipboard:", error);
          });
      } else {
        const currentAnim = handleClipboard({ action: "paste", data: {} });
        processPasteAnimation(currentAnim);
      }

      return;
    }

    // delete animation
    if (event.data.type === "WCF_AB_DELETE_ANIMATION") {
      const { wcfAnimId } = event.data.payload;
      if (!wcfAnimId) return;
      deleteAnimation(wcfAnimId);
    }
  };

  // handleManageClipboardEvent
  const handleClipboard = ({ action = "copy", data = {} }) => {
    if (action === "copy" && Object.keys(data).length > 0) {
      sessionStorage.setItem("wcf-ab-anim-clipboard", JSON.stringify(data));
      return;
    } else if (action === "paste") {
      try {
        const data = JSON.parse(
          sessionStorage.getItem("wcf-ab-anim-clipboard") || "{}"
        );
        sessionStorage.removeItem("wcf-ab-anim-clipboard");
        return data;
      } catch (err) {
        console.error("Error parsing clipboard data: ", err);
        sessionStorage.removeItem("wcf-ab-anim-clipboard");
        return {};
      }
    }
    return;
  };

  // context menu event helper
  useEffect(() => {
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [createAnimation, setContentStep, allAnimation, deleteAnimation]);

  // returning controller
  return children;
};

export default IframeReactInteraction;
