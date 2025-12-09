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
import AnimationTimingFunc from "./Shared/AnimationTimingFunc";
import AnimationDelay from "./Shared/AnimationDelay";
import AnimationDuration from "./Shared/AnimationDuration";
import AnimationRepeat from "./Shared/AnimationRepeat";

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
    triggerType: data?.triggerType || "on_scroll",
    itemClass: data?.itemClass || "",
    styles: {
      animationDelay: data?.styles?.animationDelay || "0s",
      animationDuration: data?.styles?.animationDuration || "1s",
      animationIterationCount: data?.styles?.animationIterationCount || "0s",
      animationTimingFunction: data?.styles?.animationTimingFunction || "ease",
    },
    // handle element initial states
    initElementStyle: {
      visibility: "hidden",
      opacity: 0,
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
      <AnimationDelay
        onChange={(value) => {
          setFullConfig((prev) => {
            const newState = { ...prev };
            newState.styles["animationDelay"] = value;
            return newState;
          });
        }}
        value={fullConfig?.styles?.animationDelay}
      />

      {/* duration  */}
      <AnimationDuration
        onChange={(value) => {
          setFullConfig((prev) => {
            const newState = { ...prev };
            newState.styles["animationDuration"] = value;
            return newState;
          });
        }}
        value={fullConfig?.styles?.animationDuration}
      />

      {/* easing */}
      <AnimationTimingFunc
        onChange={(value) => {
          setFullConfig((prev) => {
            const newState = { ...prev };
            newState.styles["animationTimingFunction"] = value;
            return newState;
          });
        }}
        value={fullConfig?.styles?.animationTimingFunction}
      />

      {/* repeat */}
      <AnimationRepeat
        onChange={(value) => {
          setFullConfig((prev) => {
            const newState = { ...prev };
            newState.styles["animationIterationCount"] = value;
            return newState;
          });
        }}
        value={fullConfig?.styles?.animationIterationCount}
      />
    </div>
  );
};

export default GeneralSwashInFreeAnim;
