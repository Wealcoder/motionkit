import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import Controller from "@/editor/EditorController";
import { useIframeMessageBridge } from "@/hooks/core/useIframeMessageBridge";
import { cn, getScreenSize } from "@/lib/utils";
import { PlusSignIcon, Remove01Icon } from "@hugeicons/core-free-icons/index";
import { HugeiconsIcon } from "@hugeicons/react";
import { useEffect } from "react";
import { useDeviceConfig, useKernel } from "../hooks/app.hooks";
import EditorHeader from "./EditorHeader";
import { editorConfig } from "@/config/editorConfig";
import { disableIframeLinks } from "@/lib/editor/editor";

const Editor = () => {
  // MAJOR (DO NOT DELETE THIS) : initiating iframe and editor communication
  useIframeMessageBridge();
  // Editor
  const {
    isLoading,
    mainState,
    settings,
    toggleController,
    setEditorZoomLevel,
    resetEditorPreview,
  } = useKernel();
  const { selectedDevice } = useDeviceConfig();
  const device = getScreenSize(selectedDevice) || {};

  console.log({ mainState });

  const handleWheel = (e) => {
    e.preventDefault();
  };

  // controlling editor zoom by zoom indicator on top of the preview pane.
  const handleEditorZoom = (type = "positive", settings = {}) => {
    if (!Object.keys(settings)?.includes("editorZoomLevel")) return;
    const currentZoomLevel = settings?.editorZoomLevel ?? 1;
    if (type === "positive" && currentZoomLevel < editorConfig?.maxZoom) {
      const value = parseFloat((currentZoomLevel + 0.1).toFixed(1));
      setEditorZoomLevel(value);
      return;
    } else if (
      type === "negative" &&
      currentZoomLevel > editorConfig?.minZoom
    ) {
      const value = parseFloat((currentZoomLevel - 0.1).toFixed(1));
      setEditorZoomLevel(value);
      return;
    }
    return;
  };

  useEffect(() => {
    // initialized editor. Do not delete this.
    disableIframeLinks();
    // controlling editor preview pane interaction
    window.addEventListener("wheel", handleWheel, { passive: false });
    return () => {
      window.removeEventListener("wheel", handleWheel);
    };
  }, []);

  return (
    <div className="h-screen max-w-full">
      <ResizablePanelGroup direction="horizontal">
        {/* Left panel */}
        <ResizablePanel className="flex flex-col justify-center items-center bg-[#EBEBEB]">
          <EditorHeader />
          <div
            className=" relative h-full flex justify-center items-start overflow-hidden"
            style={{
              width: "100%",
              margin: "0 auto",
              transition: "all 0.3s ease-out",
            }}
          >
            {/* zoom indicator */}
            <div className="absolute top-2 right-4 z-10 px-4 py-2 min-h-[34px]  grid grid-cols-[50px,1fr] justify-center items-center gap-4 bg-background text-white text-sm font-normal leading-none border-none rounded-5">
              <span>{(settings?.editorZoomLevel * 100).toFixed(0)}%</span>
              <ButtonGroup className={"gap-2"}>
                <Button
                  onClick={() => handleEditorZoom("negative", settings)}
                  size="icon"
                  className={cn(
                    "border-none outline-none !rounded-5 hover:bg-button-primary-hover hover:text-white",
                    settings?.editorZoomLevel === editorConfig?.minZoom
                      ? "!cursor-not-allowed"
                      : "!cursor-pointer"
                  )}
                  disabled={settings?.editorZoomLevel === editorConfig?.minZoom}
                >
                  <HugeiconsIcon
                    icon={Remove01Icon}
                    stroke="currentColor"
                    size={16}
                    strokeWidth={2}
                  />
                </Button>
                <Button
                  onClick={() => handleEditorZoom("positive", settings)}
                  size="icon"
                  className={cn(
                    "border-none outline-none !rounded-5 hover:bg-button-primary-hover hover:text-white",
                    settings?.editorZoomLevel === editorConfig?.maxZoom
                      ? "!cursor-not-allowed"
                      : "!cursor-pointer"
                  )}
                  disabled={settings?.editorZoomLevel === editorConfig?.maxZoom}
                >
                  <HugeiconsIcon
                    icon={PlusSignIcon}
                    size={16}
                    strokeWidth={2}
                  />
                </Button>
                <Button
                  onClick={() => resetEditorPreview()}
                  className="min-h-9 min-w-[63px] border-none outline-none !rounded-5"
                >
                  Reset
                </Button>
              </ButtonGroup>
            </div>
            {/* live site iframe preview */}
            <iframe
              className="wcf--animation-builder-editor-iframe h-full border-0 bg-white"
              id="wcf--animation-builder--animation--preview"
              style={{
                width: device?.key === "desktop" ? "100%" : device?.viewWidth,
                transform: `translateX(${settings?.xPlacement || 0}px) scale(${
                  settings?.editorZoomLevel
                })`,
                transition: "all 0.3s ease-out",
                zIndex: 1,
                borderRadius: "3px",
                boxShadow: "rgba(149, 157, 165, 0.2) 0px 8px 24px",
              }}
              src={WCF_ANIMATION_BUILDER.iframe_url}
            />
          </div>
        </ResizablePanel>
        {/* Handle */}
        <ResizableHandle
          className={"!cursor-pointer"}
          withHandle
          onClick={() => toggleController()}
        />

        {/* Right panel */}
        <ResizablePanel
          defaultSize={0}
          collapsible
          collapsedSize={0}
          className="rounded-l-[10px]"
          style={{
            flexBasis: settings?.isControllerOpen ? "405px" : "5px",
            transition: "flex-basis 0.3s linear",
            maxWidth: "405px",
            overflow: "hidden",
            cursor: "pointer !important",
          }}
        >
          <Controller isLoading={isLoading} />
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
};

export default Editor;
