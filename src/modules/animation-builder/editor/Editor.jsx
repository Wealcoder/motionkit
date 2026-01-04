import { Button } from "@/components/ui/button";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import Controller from "@/editor/Controller";
import { getScreenSize } from "@/lib/utils";
import { SearchAddIcon } from "@hugeicons/core-free-icons/index";
import { HugeiconsIcon } from "@hugeicons/react";
import { useEffect, useState } from "react";
import {
  useAnimationControl,
  useDeviceConfig,
  useKernel,
  usePageConfig,
} from "../hooks/app.hooks";
import EditorHeader from "./EditorHeader";
import { disableIframeLinks } from "@/lib/editor";

const Editor = () => {
  const { settings, toggleController, handleEventToKernel } = useKernel();
  const { setPageConfig } = usePageConfig();
  const { setAllAnimation } = useAnimationControl();
  const { selectedDevice } = useDeviceConfig();
  const [isLoading, setIsLoading] = useState(true);
  const device = getScreenSize(selectedDevice) || {};

  // window.addEventListener(
  //   "message",
  //   (event) => {
  //     if (event?.data?.type === "wcf-animation-builder") {
  //       if (event?.data) {
  //         setAllAnimation(event.data?.animation_config || []);
  //         setPageConfig(event.data);
  //         setIsLoading(false);
  //       }
  //     }
  //   },
  //   false
  // );

  const handleWheel = (e) => {
    e.preventDefault();
  };

  useEffect(() => {
    disableIframeLinks();
    // communicating between iframe and editor
    window.addEventListener("message", handleEventToKernel);
    // controlling editor preview pane interaction
    // window.addEventListener("wheel", handleWheel, { passive: false });
    return () => {
      window.removeEventListener("message", handleEventToKernel);
      window.removeEventListener("wheel", handleWheel);
    };
  }, []);

  return (
    <ResizablePanelGroup
      direction="horizontal"
      className="!h-screen max-w-full"
      // blocking browser zoom outside iframe section.
    >
      {/* Left panel */}
      <ResizablePanel
        // defaultSize={85}
        className="flex flex-col justify-center items-center bg-[#EBEBEB] "
      >
        <EditorHeader />
        <div
          className=" relative h-full flex justify-center items-start overflow-hidden"
          style={{
            width: device?.key === "desktop" ? "100%" : device?.viewWidth,
            margin: "0 auto",
            transition: "all 0.3s ease-out",
          }}
        >
          {/* zoom indicator */}
          <Button className="absolute top-2 right-4 z-10 gap-2 px-4 py-2 min-h-[34px] min-w-[100px] bg-background text-white text-sm font-normal leading-none border-none rounded-5 cursor-none pointer-events-none ">
            <HugeiconsIcon
              icon={SearchAddIcon}
              size={16}
              stroke="currentColor"
              strokeWidth={1.5}
            />
            {(settings?.editorZoomLevel * 100).toFixed(0)}%
          </Button>
          {/* live site iframe preview */}
          <iframe
            className="wcf--animation-builder-editor-iframe h-full border-0 bg-white"
            id="wcf--animation-builder--animation--preview"
            style={{
              width: "100%",
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
        defaultSize={0} // disable default side for collapsible funcitonality
        collapsible
        collapsedSize={0}
        className="rounded-l-[10px]"
        style={{
          flexBasis: settings?.isEditorOpen ? "440px" : "5px",
          transition: "flex-basis 0.3s linear",
          maxWidth: "440px",
          overflow: "hidden",
          cursor: "pointer !important",
        }}
      >
        <Controller isLoading={isLoading} />
      </ResizablePanel>
    </ResizablePanelGroup>
  );
};

export default Editor;
