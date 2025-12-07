import ToolTipWrapper from "@/components/common/ToolTipWrapper";
import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";

const GeneralSwashInFreeAnim = ({ contentStep, updateContentData }) => {
  const { data } = contentStep;

  const [fullConfig, setFullConfig] = useState({
    itemClass: data?.itemClass || "",
    delay: data?.delay || 0,
    duration: data?.duration || 1,
    repeat: data?.repeat || 0,
  });

  useEffect(() => {
    const result = { ...contentStep, data: { ...data, ...fullConfig } };
    updateContentData(result);
  }, [fullConfig]);

  return (
    <div className="flex flex-col gap-2 border-b border-border-2 w-full p-3">
      {/* item class  */}
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

      {/* delay  */}
      <div className="grid grid-cols-2 gap-2 justify-between items-center">
        <div className="flex items-center gap-1">
          <h3 className="text-xs text-text-2 capitalize">Delay</h3>
          <ToolTipWrapper text={"Animation delay in seconds"} />
        </div>
        <div className="flex items-center gap-1.5">
          <div className="flex-1">
            <Input
              type="number"
              value={fullConfig?.delay}
              onChange={(e) => {
                setFullConfig((prev) => ({
                  ...prev,
                  delay: parseFloat(e.target.value) || 0,
                }));
              }}
              placeholder="0"
              step="0.1"
              min="0"
            />
          </div>
        </div>
      </div>

      {/* duration  */}
      <div className="grid grid-cols-2 gap-2 justify-between items-center">
        <div className="flex items-center gap-1">
          <h3 className="text-xs text-text-2 capitalize">Duration</h3>
          <ToolTipWrapper text={"Animation duration in seconds"} />
        </div>
        <div className="flex items-center gap-1.5">
          <div className="flex-1">
            <Input
              type="number"
              value={fullConfig?.duration}
              onChange={(e) => {
                setFullConfig((prev) => ({
                  ...prev,
                  duration: parseFloat(e.target.value) || 1,
                }));
              }}
              placeholder="1"
              step="0.1"
              min="0"
            />
          </div>
        </div>
      </div>

      {/* repeat */}
      <div className="grid grid-cols-2 gap-2 justify-between items-center">
        <div className="flex items-center gap-1">
          <h3 className="text-xs text-text-2 capitalize">Repeat</h3>
          <ToolTipWrapper text={"Add the class name of the video element"} />
        </div>
        <div className="flex items-center gap-1.5">
          <div className="flex-1">
            <Input
              value={fullConfig?.repeat}
              onChange={(e) => {
                setFullConfig((prev) => ({
                  ...prev,
                  repeat: e.target.value,
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

export default GeneralSwashInFreeAnim;
