import ToolTipWrapper from "@/components/common/ToolTipWrapper";
import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";

const ScrollVideoPrest = ({ contentStep, updateContentData }) => {
  const { data } = contentStep;

  const [fullConfig, setFullConfig] = useState({
    containerClass: data?.containerClass || "",
    containerHeight: data?.containerHeight || "",
    itemClass: data?.itemClass || "",
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
          <h3 className="text-xs text-text-2 capitalize">Scrolling Height</h3>
          <ToolTipWrapper
            text={"Set the scroll height – determines scroll duration"}
          />
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
    </div>
  );
};

export default ScrollVideoPrest;
