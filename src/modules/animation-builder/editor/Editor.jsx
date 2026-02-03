import { useEffect } from "react";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import EditorController from "./EditorController";
import EditorHeader from "./EditorHeader";
import EditorPreview from "./EditorPreview";
import { useIframeMessageBridge } from "@/lib/editor/core/dispatch_events/useIframeMessageBridge";
import { disableIframeLinks } from "@/lib/editor/editor";

export default function Editor() {
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

  // console.log({ mainState });

  const handleWheel = (e) => {
    e.preventDefault();
  };

  useEffect(() => {
    disableIframeLinks();
    // controlling editor preview pane interaction
    // window.addEventListener("wheel", handleWheel, { passive: false });
    return () => {
      window.removeEventListener("wheel", handleWheel);
    };
  }, []);

  return (
    <SidebarProvider className="overflow-hidden">
      <SidebarInset>
        <EditorHeader />
        <EditorPreview />
      </SidebarInset>
      <EditorController />
    </SidebarProvider>
  );
}
