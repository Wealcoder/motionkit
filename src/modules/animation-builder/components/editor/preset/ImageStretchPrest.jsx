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

const ImageStretchPrest = ({ contentStep, updateContentData }) => {
  const { data } = contentStep;

  const [fullConfig, setFullConfig] = useState({
    containerClass: data?.containerClass || "",
    containerHeight: data?.containerHeight || "200vh",
    itemClass: data?.itemClass || "",
    itemWidth: data?.itemWidth || "100%",
    objectFit: data?.objectFit || "none",
  });

  useEffect(() => {
    const result = { ...contentStep, data: { ...data, ...fullConfig } };
    updateContentData(result);
  }, [fullConfig]);

  return (
    <div className="flex flex-col gap-2 border-b border-border-2 w-full p-3">
      <div className="grid grid-cols-2 gap-2 justify-between items-center">
        <div className="flex items-center gap-1">
          <h3 className="text-xs text-text-2 capitalize">Container Class</h3>
          <ToolTipWrapper text={"Add the wrapper container class name"} />
        </div>
        <div className="flex items-center gap-1.5">
          <div className="flex-1">
            <Input
              value={fullConfig?.containerClass}
              onChange={(e) => {
                setFullConfig((prev) => ({
                  ...prev,
                  containerClass: e.target.value,
                }));
              }}
              placeholder="add value"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 justify-between items-center">
        <div className="flex items-center gap-1">
          <h3 className="text-xs text-text-2 capitalize">Container Height</h3>
          <ToolTipWrapper text={"container height"} />
        </div>
        <div className="flex items-center gap-1.5">
          <div className="flex-1">
            <Input
              value={fullConfig?.containerHeight}
              onChange={(e) => {
                setFullConfig((prev) => ({
                  ...prev,
                  containerHeight: e.target.value,
                }));
              }}
              placeholder="add value"
            />
          </div>
        </div>
      </div>
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
          <h3 className="text-xs text-text-2 capitalize">Item Width</h3>
          <ToolTipWrapper text={"Add Width for item"} />
        </div>
        <div className="flex items-center gap-1.5">
          <div className="flex-1">
            <Input
              value={fullConfig?.itemWidth}
              onChange={(e) => {
                setFullConfig((prev) => ({
                  ...prev,
                  itemWidth: e.target.value,
                }));
              }}
              placeholder="add value"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 justify-between items-center">
        <div className="flex items-center gap-1">
          <h3 className="text-xs text-text-2 capitalize">Object Fit</h3>
          <ToolTipWrapper text={"Select the object fit value"} />
        </div>
        <div className="flex items-center gap-1.5">
          <div className="flex-1">
            <Select
              value={fullConfig.objectFit}
              onValueChange={(value) =>
                setFullConfig((prev) => ({
                  ...prev,
                  objectFit: value,
                }))
              }
            >
              <SelectTrigger className="min-w-[90px]">
                <SelectValue placeholder="Top Top" className="line-clamp-1" />
              </SelectTrigger>
              <SelectContent className="min-w-[90px]">
                <SelectGroup>
                  <SelectItem value="none">None</SelectItem>
                  <SelectItem value="contain">Contain</SelectItem>
                  <SelectItem value="cover">Cover</SelectItem>
                  <SelectItem value="scale-down">Scale Down</SelectItem>
                  <SelectItem value="unset">Unset</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageStretchPrest;
