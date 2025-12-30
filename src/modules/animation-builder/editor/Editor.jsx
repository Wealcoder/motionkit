import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import Controller from "@/editor/Controller";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import {
  useAnimationControl,
  useDeviceConfig,
  usePageConfig,
} from "../hooks/app.hooks";
import EditorHeader from "./EditorHeader";

const Editor = () => {
  const { setPageConfig } = usePageConfig();
  const { setAllAnimation } = useAnimationControl();
  const { selectedDevice } = useDeviceConfig();
  const [isLoading, setIsLoading] = useState(true);

  function disableIframeLinks() {
    const iframe = document.getElementById(
      "wcf--animation-builder--animation--preview"
    );
    iframe.onload = function () {
      const iframeDocument =
        iframe.contentDocument || iframe.contentWindow.document;

      const links = iframeDocument.querySelectorAll("a");

      links.forEach((link) => {
        link.addEventListener("click", function (event) {
          event.preventDefault();
        });
      });
    };
  }

  window.addEventListener(
    "message",
    (event) => {
      if (event?.data?.type === "wcf-animation-builder") {
        if (event?.data) {
          setAllAnimation(event.data?.animation_config || []);
          setPageConfig(event.data);
          setIsLoading(false);
        }
      }
    },
    false
  );

  useEffect(() => {
    disableIframeLinks();
  }, []);

  const getScreenSize = (value) => {
    let result = WCF_ANIMATION_BUILDER?.device_config.find(
      (el) => el.key === value
    );
    if (result) {
      return result.viewWidth;
    } else {
      return "100%";
    }
  };

  return (
    <div>
      <EditorHeader />
      <ResizablePanelGroup direction="horizontal" className="max-w-full">
        <ResizablePanel
          defaultSize={85}
          className="min-w-[calc(100%-450px)] h-[calc(100vh-53px)] flex justify-center items-center bg-[#EBEBEB]"
        >
          <iframe
            class="wcf--animation-builder-editor-iframe w-full h-full border-0 bg-white"
            id="wcf--animation-builder--animation--preview"
            style={{
              width: getScreenSize(selectedDevice),
            }}
            src={WCF_ANIMATION_BUILDER.iframe_url}
          ></iframe>
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel
          defaultSize={15}
          className={cn("min-w-[280px] max-w-[450px] h-[calc(100vh-53px)]")}
        >
          <Controller isLoading={isLoading} />
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
};

export default Editor;
