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

const GeneralSwashInFreeAnim = ({ contentStep, updateContentData }) => {
  const triggerTypes = [
    { title: "On Scroll", value: "on_scroll" },
    { title: "On Page Load", value: "page_load" },
    { title: "Play With Scroll", value: "play_with_scroll" },
    { title: "Hover", value: "hover" },
    { title: "Click", value: "click" },
  ];

  const { data } = contentStep || {};

  const [fullConfig, setFullConfig] = useState({
    triggerClass: data?.triggerClass || "",
    triggerType: data?.triggerType || "on_scroll",
    itemClass: data?.itemClass || "",
    styles: {
      animationDelay: data?.styles?.animationDelay || "0s",
      animationDuration: data?.styles?.animationDuration || "1s",
      animationIterationCount: data?.styles?.animationIterationCount || "0s",
    },
  });

  useEffect(() => {
    const result = { ...contentStep, data: { ...data, ...fullConfig } };
    updateContentData(result);
  }, [fullConfig]);

  return (
    <div className="flex flex-col gap-2 border-b border-border-2 w-full p-3">
      {/* trigger type  */}
      <div className="grid grid-cols-2 gap-2 justify-between items-center">
        <div className="flex items-center gap-1">
          <h3 className="text-xs text-text-2 capitalize">Trigger Type</h3>
          <ToolTipWrapper text={"Select the trigger type"} />
        </div>
        <div className="flex items-center gap-1.5">
          <div className="flex-1">
            <Select
              value={fullConfig?.triggerType}
              onValueChange={(value) =>
                setFullConfig((prev) => ({
                  ...prev,
                  triggerType: value,
                }))
              }
            >
              <SelectTrigger className="min-w-[90px]">
                <SelectValue
                  placeholder="Select type"
                  className="line-clamp-1"
                />
              </SelectTrigger>
              <SelectContent className="min-w-[90px]">
                <SelectGroup>
                  {triggerTypes?.map((type, index) => (
                    <SelectItem
                      key={index}
                      placeholder="Select type"
                      className="line-clamp-1"
                      value={type?.value}
                    >
                      {type?.title}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* trigger class  */}
      <div className="grid grid-cols-2 gap-2 justify-between items-center">
        <div className="flex items-center gap-1">
          <h3 className="text-xs text-text-2 capitalize">Trigger Class</h3>
          <ToolTipWrapper text={"Add the trigger class name"} />
        </div>
        <div className="flex items-center gap-1.5">
          <div className="flex-1">
            <Input
              value={fullConfig?.triggerClass}
              onChange={(e) => {
                setFullConfig((prev) => ({
                  ...prev,
                  triggerClass: e.target.value,
                }));
              }}
              placeholder="add value"
            />
          </div>
        </div>
      </div>

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
              value={Number(
                fullConfig?.styles?.animationDelay?.replace("s", "")
              )}
              min={0}
              step={1}
              onChange={(e) => {
                const value = Math.max(0, Number(e.target.value || 0));
                setFullConfig((prev) => ({
                  ...prev,
                  styles: {
                    ...prev.styles,
                    animationDelay: `${value}s`,
                  },
                }));
              }}
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
              value={Number(
                fullConfig?.styles?.animationDuration?.replace("s", "")
              )}
              min={0}
              step={1}
              onChange={(e) => {
                const value = Math.max(0, Number(e.target.value || 0));
                setFullConfig((prev) => ({
                  ...prev,
                  styles: {
                    ...prev.styles,
                    animationDuration: `${value}s`,
                  },
                }));
              }}
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
              type="number"
              value={Number(fullConfig?.styles?.animationIterationCount) ?? 0}
              min={0}
              step={1}
              onChange={(e) => {
                const value = Math.max(0, Number(e.target.value || 0));
                setFullConfig((prev) => ({
                  ...prev,
                  styles: {
                    ...prev.styles,
                    animationIterationCount: value,
                  },
                }));
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default GeneralSwashInFreeAnim;
