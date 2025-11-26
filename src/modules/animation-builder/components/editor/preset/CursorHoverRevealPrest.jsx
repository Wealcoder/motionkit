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

const CursorHoverRevealPreset = ({ contentStep, updateContentData }) => {
  const { data } = contentStep;

  const [fullConfig, setFullConfig] = useState({
    itemClass: data?.itemClass || "",
    viewText: data?.viewText || "",
    textColor: data?.textColor || "#ffffff",
    backgroundColor: data?.backgroundColor || "#000000",
    backgroundWidth: data?.backgroundWidth || "70px",
    backgroundHeight: data?.backgroundHeight || "70px",
    borderType: data?.borderType || "none",
    borderWidth: data?.borderWidth || "",
    borderColor: data?.borderColor || "",
    borderRadius: data?.borderRadius || "50px",
    zIndex: data?.zIndex || "",
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
          <h3 className="text-xs text-text-2 capitalize">Text</h3>
          <ToolTipWrapper text={"Add the view text"} />
        </div>
        <div className="flex items-center gap-1.5">
          <div className="flex-1">
            <Input
              value={fullConfig?.viewText}
              onChange={(e) => {
                setFullConfig((prev) => ({
                  ...prev,
                  viewText: e.target.value,
                }));
              }}
              placeholder="add text"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 justify-between items-center">
        <div className="flex items-center gap-1">
          <h3 className="text-xs text-text-2 capitalize">Text Color</h3>
          <ToolTipWrapper text={"Choose text color"} />
        </div>
        <div className="flex items-center gap-1.5">
          <Input
            type="color"
            className="w-[28px] p-0 px-[2px]"
            value={fullConfig?.textColor}
            onChange={(e) => {
              setFullConfig((prev) => ({
                ...prev,
                textColor: e.target.value,
              }));
            }}
          />
          <Input
            value={fullConfig?.textColor}
            onChange={(e) => {
              setFullConfig((prev) => ({
                ...prev,
                textColor: e.target.value,
              }));
            }}
            placeholder="add value"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 justify-between items-center">
        <div className="flex items-center gap-1">
          <h3 className="text-xs text-text-2 capitalize">Background Color</h3>
          <ToolTipWrapper text={"Choose background color"} />
        </div>
        <div className="flex items-center gap-1.5">
          <Input
            type="color"
            className="w-[28px] p-0 px-[2px]"
            value={fullConfig?.backgroundColor}
            onChange={(e) => {
              setFullConfig((prev) => ({
                ...prev,
                backgroundColor: e.target.value,
              }));
            }}
          />
          <Input
            value={fullConfig?.backgroundColor}
            onChange={(e) => {
              setFullConfig((prev) => ({
                ...prev,
                backgroundColor: e.target.value,
              }));
            }}
            placeholder="add value"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 justify-between items-center">
        <div className="flex items-center gap-1">
          <h3 className="text-xs text-text-2 capitalize">Background Width</h3>
          <ToolTipWrapper text={"Add the background width value"} />
        </div>
        <div className="flex items-center gap-1.5">
          <div className="flex-1">
            <Input
              value={fullConfig?.backgroundWidth}
              onChange={(e) => {
                setFullConfig((prev) => ({
                  ...prev,
                  backgroundWidth: e.target.value,
                }));
              }}
              placeholder="add value"
            />
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2 justify-between items-center">
        <div className="flex items-center gap-1">
          <h3 className="text-xs text-text-2 capitalize">Background Height</h3>
          <ToolTipWrapper text={"Add the background height value"} />
        </div>
        <div className="flex items-center gap-1.5">
          <div className="flex-1">
            <Input
              value={fullConfig?.backgroundHeight}
              onChange={(e) => {
                setFullConfig((prev) => ({
                  ...prev,
                  backgroundHeight: e.target.value,
                }));
              }}
              placeholder="add value"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 justify-between items-center">
        <div className="flex items-center gap-1">
          <h3 className="text-xs text-text-2 capitalize">Border Type</h3>
          <ToolTipWrapper
            text={
              "Choose the style of border animation, such as solid, dashed, or double, to define how the border will appear during the effect."
            }
          />
        </div>
        <div className="flex items-center gap-1.5">
          <div className="flex-1">
            <Select
              value={fullConfig.borderType}
              onValueChange={(value) =>
                setFullConfig((prev) => ({
                  ...prev,
                  borderType: value,
                }))
              }
            >
              <SelectTrigger className="min-w-[90px]">
                <SelectValue placeholder="none" className="line-clamp-1" />
              </SelectTrigger>
              <SelectContent className="min-w-[90px]">
                <SelectGroup>
                  <SelectItem value={"none"}>None</SelectItem>
                  <SelectItem value={"solid"}>Solid</SelectItem>
                  <SelectItem value={"double"}>Double</SelectItem>
                  <SelectItem value={"dotted"}>Dotted</SelectItem>
                  <SelectItem value={"dashed"}>Dashed</SelectItem>
                  <SelectItem value={"groove"}>Groove</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 justify-between items-center">
        <div className="flex items-center gap-1">
          <h3 className="text-xs text-text-2 capitalize">Border Width</h3>
          <ToolTipWrapper text={"Add the border width value"} />
        </div>
        <div className="flex items-center gap-1.5">
          <div className="flex-1">
            <Input
              value={fullConfig?.borderWidth}
              onChange={(e) => {
                setFullConfig((prev) => ({
                  ...prev,
                  borderWidth: e.target.value,
                }));
              }}
              placeholder="add value"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 justify-between items-center">
        <div className="flex items-center gap-1">
          <h3 className="text-xs text-text-2 capitalize">Border Color</h3>
          <ToolTipWrapper text={"Choose border color"} />
        </div>
        <div className="flex items-center gap-1.5">
          <Input
            type="color"
            className="w-[28px] p-0 px-[2px]"
            value={fullConfig?.borderColor}
            onChange={(e) => {
              setFullConfig((prev) => ({
                ...prev,
                borderColor: e.target.value,
              }));
            }}
          />
          <Input
            value={fullConfig?.borderColor}
            onChange={(e) => {
              setFullConfig((prev) => ({
                ...prev,
                borderColor: e.target.value,
              }));
            }}
            placeholder="add value"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 justify-between items-center">
        <div className="flex items-center gap-1">
          <h3 className="text-xs text-text-2 capitalize">Border Radius</h3>
          <ToolTipWrapper text={"Add the border radius value"} />
        </div>
        <div className="flex items-center gap-1.5">
          <div className="flex-1">
            <Input
              value={fullConfig?.borderRadius}
              onChange={(e) => {
                setFullConfig((prev) => ({
                  ...prev,
                  borderRadius: e.target.value,
                }));
              }}
              placeholder="add value"
            />
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

export default CursorHoverRevealPreset;
