import ToolTipWrapper from "@/components/common/ToolTipWrapper";
import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";

const CursorHoverMovePreset = ({ contentStep, updateContentData }) => {
  const { data } = contentStep;

  const [fullConfig, setFullConfig] = useState({
    itemClass: data?.itemClass || "",
    moveX: data?.moveX || "",
    moveY: data?.moveY || "",
    duration: data?.duration || "0.6",
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
          <h3 className="text-xs text-text-2 capitalize">Move X</h3>
          <ToolTipWrapper text={"Add move value for x-axis"} />
        </div>
        <div className="flex items-center gap-1.5">
          <div className="flex-1">
            <Input
              value={fullConfig?.moveX}
              onChange={(e) => {
                setFullConfig((prev) => ({
                  ...prev,
                  moveX: e.target.value,
                }));
              }}
              placeholder="add value"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 justify-between items-center">
        <div className="flex items-center gap-1">
          <h3 className="text-xs text-text-2 capitalize">Move Y</h3>
          <ToolTipWrapper text={"Add move value for y-axis"} />
        </div>
        <div className="flex items-center gap-1.5">
          <div className="flex-1">
            <Input
              value={fullConfig?.moveY}
              onChange={(e) => {
                setFullConfig((prev) => ({
                  ...prev,
                  moveY: e.target.value,
                }));
              }}
              placeholder="add value"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 justify-between items-center">
        <div className="flex items-center gap-1">
          <h3 className="text-xs text-text-2 capitalize">Duration</h3>
          <ToolTipWrapper text={"Add move duration"} />
        </div>
        <div className="flex items-center gap-1.5">
          <div className="flex-1">
            <Input
              value={fullConfig?.duration}
              onChange={(e) => {
                setFullConfig((prev) => ({
                  ...prev,
                  duration: e.target.value,
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

export default CursorHoverMovePreset;
