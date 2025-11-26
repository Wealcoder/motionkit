import ToolTipWrapper from "@/components/common/ToolTipWrapper";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEffect, useState } from "react";

const ImageHoverRevealPreset = ({ contentStep, updateContentData }) => {
  const { data } = contentStep;

  const [fullConfig, setFullConfig] = useState({
    itemClass: data?.itemClass || "",
    imageUrl: data?.imageUrl || "",
    imageWidth: data?.imageWidth || "300px",
    imageHeight: data?.imageHeight || "400px",
    zIndex: data?.zIndex || "",
    animationPosition: data?.animationPosition || "center",
  });

  useEffect(() => {
    const result = { ...contentStep, data: { ...data, ...fullConfig } };
    updateContentData(result);
  }, [fullConfig]);

  return (
    <div className="flex flex-col gap-2 border-b border-border-2 w-full p-3">
      <div className="grid grid-cols-2 gap-2 justify-between items-center">
        <div className="flex items-center gap-1">
          <h3 className="text-xs text-text-2 capitalize">Item Class</h3>
          <ToolTipWrapper text={"Add the class name of the video element"} />
        </div>
        <div className="flex items-center gap-1.5">
          <div className="flex-1">
            <Input
              value={fullConfig?.itemClass}
              onChange={(e) => {
                setFullConfig((prev) => ({
                  ...prev,
                  itemClass: e.target.value,
                }));
              }}
              placeholder="add value"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 justify-between items-center">
        <div className="flex items-center gap-1">
          <h3 className="text-xs text-text-2 capitalize">Image URL</h3>
          <ToolTipWrapper text={"Add the image url"} />
        </div>
        <div className="flex items-center gap-1.5">
          <div className="flex-1">
            <Input
              value={fullConfig?.imageUrl}
              onChange={(e) => {
                setFullConfig((prev) => ({
                  ...prev,
                  imageUrl: e.target.value,
                }));
              }}
              placeholder="add url"
            />
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2 justify-between items-center">
        <div className="flex items-center gap-1">
          <h3 className="text-xs text-text-2 capitalize">Image Width</h3>
          <ToolTipWrapper text={"Add the image width value"} />
        </div>
        <div className="flex items-center gap-1.5">
          <div className="flex-1">
            <Input
              value={fullConfig?.imageWidth}
              onChange={(e) => {
                setFullConfig((prev) => ({
                  ...prev,
                  imageWidth: e.target.value,
                }));
              }}
              placeholder="add value"
            />
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2 justify-between items-center">
        <div className="flex items-center gap-1">
          <h3 className="text-xs text-text-2 capitalize">Image Height</h3>
          <ToolTipWrapper text={"Add the image height value"} />
        </div>
        <div className="flex items-center gap-1.5">
          <div className="flex-1">
            <Input
              value={fullConfig?.imageHeight}
              onChange={(e) => {
                setFullConfig((prev) => ({
                  ...prev,
                  imageHeight: e.target.value,
                }));
              }}
              placeholder="add value"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 justify-between items-center">
        <div className="flex items-center gap-1">
          <h3 className="text-xs text-text-2 capitalize">Animation Position</h3>
          <ToolTipWrapper
            text={
              "Select the direction where the animation will move (Left, Right, Top, or Bottom)"
            }
          />
        </div>
        <div className="flex items-center gap-1.5">
          <div className="flex-1">
            <Select
              value={fullConfig.animationPosition}
              onValueChange={(value) =>
                setFullConfig((prev) => ({
                  ...prev,
                  animationPosition: value,
                }))
              }
            >
              <SelectTrigger className="min-w-[90px]">
                <SelectValue placeholder="Left" className="line-clamp-1" />
              </SelectTrigger>
              <SelectContent className="min-w-[90px]">
                <SelectGroup>
                  <SelectItem value={"left"}>Left</SelectItem>
                  <SelectItem value={"right"}>Right</SelectItem>
                  <SelectItem value={"top"}>Top</SelectItem>
                  <SelectItem value={"bottom"}>Bottom</SelectItem>
                  <SelectItem value={"center"}>Center</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 justify-between items-center">
        <div className="flex items-center gap-1">
          <h3 className="text-xs text-text-2 capitalize">Z-index</h3>
          <ToolTipWrapper text={"Add the z-index value"} />
        </div>
        <div className="flex items-center gap-1.5">
          <div className="flex-1">
            <Input
              value={fullConfig?.zIndex}
              onChange={(e) => {
                setFullConfig((prev) => ({
                  ...prev,
                  zIndex: e.target.value,
                }));
              }}
              placeholder="add value"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageHoverRevealPreset;
