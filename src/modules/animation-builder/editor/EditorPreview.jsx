import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { editorConfig } from "@/config/editorConfig";
import { useDeviceConfig, useKernel } from "@/hooks/app.hooks";
import { cn, getScreenSize } from "@/lib/utils";
import { PlusSignIcon, Remove01Icon } from "@hugeicons/core-free-icons/index";
import { HugeiconsIcon } from "@hugeicons/react";
import { SearchAddIcon } from "@hugeicons/core-free-icons";
import { useLayoutEffect } from "react";

const EditorPreview = () => {
  const { mainState, settings, setEditorZoomLevel, resetEditorPreview } =
    useKernel();

  console.log(
    "Log | EditorPreview.jsx:15 | EditorPreview | mainState => ",
    mainState?.contentStep,
  );

  const { selectedDevice } = useDeviceConfig();
  const device = getScreenSize(selectedDevice) || {};

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

  return (
    <div className="h-full bg-[#404040] relative min-w-full flex justify-center">
      {/* zoom indicator */}
      <div className="absolute top-2 right-4 z-10 px-3 py-[6px] min-h-[34px] grid grid-cols-[50px,1fr] justify-center items-center gap-4 bg-[#202024] text-white text-sm font-normal leading-none border border-solid border-button rounded-5">
        <Button className="w-full p-0 bg-transparent text-xss text-white leading-5 tracking-normal border-none outline-none">
          <HugeiconsIcon icon={SearchAddIcon} size={14} strokeWidth={2} />
          {(settings?.editorZoomLevel * 100).toFixed(0)}%
        </Button>
        <ButtonGroup className={"gap-2"}>
          <Button
            onClick={() => handleEditorZoom("negative", settings)}
            className={cn(
              "wcf-ab-button-general wcf-ab-button-icon p-[7px]",
              settings?.editorZoomLevel === editorConfig?.minZoom
                ? "!cursor-not-allowed"
                : "!cursor-pointer",
            )}
            disabled={settings?.editorZoomLevel === editorConfig?.minZoom}
          >
            <HugeiconsIcon icon={Remove01Icon} size={16} strokeWidth={2.1} />
          </Button>
          <Button
            onClick={() => handleEditorZoom("positive", settings)}
            size="icon"
            className={cn(
              "wcf-ab-button-general wcf-ab-button-icon p-[7px]",
              settings?.editorZoomLevel === editorConfig?.maxZoom
                ? "!cursor-not-allowed"
                : "!cursor-pointer",
            )}
            disabled={settings?.editorZoomLevel === editorConfig?.maxZoom}
          >
            <HugeiconsIcon icon={PlusSignIcon} size={16} strokeWidth={2.1} />
          </Button>
          <Button
            onClick={() => resetEditorPreview()}
            className="wcf-ab-button-general wcf-ab-button-primary !h-5 py-1 px-3"
          >
            Reset
          </Button>
        </ButtonGroup>
      </div>
      {/* live site preview */}
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
  );
};

export default EditorPreview;
