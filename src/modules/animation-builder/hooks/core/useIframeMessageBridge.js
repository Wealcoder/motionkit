// useIframeMessageBridge.ts
import { useEffect, useCallback } from "react";
import { useAnimationControl, useKernel, usePageConfig } from "../app.hooks";
import { validateKeyCombination } from "@/lib/events/keyboardEventUtils";
import { handleSetOrResetAnimation } from "@/lib/animations/animations";
import { generateToast } from "@/lib/editor/editor";

// This hook use to manage events actions through editor kernel context or animation context. For helper methods please follow lib directory.

export const useIframeMessageBridge = () => {
  const {
    setIsEditorLoading,
    setEditorZoomLevel,
    setEditorXPlacement,
    toggleController,
  } = useKernel();
  const { setAllAnimation } = useAnimationControl();
  const { setPageConfig } = usePageConfig();

  // listing
  const keyboardActions = {
    toggleController,
  };

  // Main message event handler
  const handleMessage = useCallback(
    (e) => {
      if (e.origin !== window.location.origin) return;
      const data = e.data || {};
      const { type } = data;

      if (!type) return;
      switch (type) {
        case "WCF-AB-TOAST-TRIGGER":
          const toasttype = data.toastType ?? "info";
          const message = data.message ?? "";
          generateToast(toasttype, message);
          break;

        case "WCF_AB_WHEEL_EVENT":
          setEditorZoomLevel(data?.value ?? "");
          break;

        case "WCF_AB_WHEEL_EVENT_X_PLACEMENT":
          setEditorXPlacement(data?.value ?? 0);
          break;

        case "WCF_AB_KEYDOWN_EVENT":
          validateKeyCombination(data?.value ?? "", keyboardActions);
          break;

        case "wcf-animation-builder":
          handleSetOrResetAnimation(data, (value) => {
            setAllAnimation(value?.animation_config);
            setPageConfig(value?.data);
            setIsEditorLoading(false);
          });
          break;
        default:
          break;
      }
    },
    [setEditorZoomLevel, setEditorXPlacement, toggleController]
  );

  useEffect(() => {
    // communicating between iframe and editor
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [handleMessage]);
};
