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

const TextInvertPrest = ({ contentStep, updateContentData }) => {
  const { data } = contentStep;

  const [fullConfig, setFullConfig] = useState({
    triggerClass: data?.triggerClass || "",
    itemClass: data?.itemClass || "",
    start: data?.start || "top top",
    startCustom: data?.startCustom || "",
    end: data?.end || "bottom bottom",
    endCustom: data?.endCustom || "",
    markers: data?.markers || "false",
  });

  useEffect(() => {
    const result = { ...contentStep, data: { ...data, ...fullConfig } };
    updateContentData(result);
  }, [fullConfig]);

  return (
    <div className="flex flex-col gap-2 border-b border-border-2 w-full p-3">
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

      {/* start  */}

      <div className="grid grid-cols-2 gap-2 justify-between items-center">
        <div className="flex items-center gap-1">
          <h3 className="text-xs text-text-2 capitalize">Start</h3>
          <ToolTipWrapper text={"Select the start position"} />
        </div>
        <div className="flex items-center gap-1.5">
          <div className="flex-1">
            <Select
              value={fullConfig.start}
              onValueChange={(value) =>
                setFullConfig((prev) => ({
                  ...prev,
                  start: value,
                }))
              }
            >
              <SelectTrigger className="min-w-[90px]">
                <SelectValue
                  placeholder="Select start"
                  className="line-clamp-1"
                />
              </SelectTrigger>
              <SelectContent className="min-w-[90px]">
                <SelectGroup>
                  <SelectItem value="top top">Top Top</SelectItem>
                  <SelectItem value="top center">Top Center</SelectItem>
                  <SelectItem value="top bottom">Top Bottom</SelectItem>
                  <SelectItem value="center top">Center Top</SelectItem>
                  <SelectItem value="center center">Center Center</SelectItem>
                  <SelectItem value="center bottom">Center Bottom</SelectItem>
                  <SelectItem value="bottom top">Bottom Top</SelectItem>
                  <SelectItem value="bottom center">Bottom Center</SelectItem>
                  <SelectItem value="bottom bottom">Bottom Bottom</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* start custom field */}
      {fullConfig.start === "custom" && (
        <div className="grid grid-cols-2 gap-2 justify-between items-center">
          <div className="flex items-center gap-1">
            <h3 className="text-xs text-text-2 capitalize">Custom Start</h3>
            <ToolTipWrapper text={"Add custom start value"} />
          </div>
          <div className="flex items-center gap-1.5">
            <div className="flex-1">
              <Input
                value={fullConfig?.startCustom}
                onChange={(e) => {
                  setFullConfig((prev) => ({
                    ...prev,
                    startCustom: e.target.value,
                  }));
                }}
                placeholder="e.g., 20% 80%"
              />
            </div>
          </div>
        </div>
      )}

      {/* end  */}

      <div className="grid grid-cols-2 gap-2 justify-between items-center">
        <div className="flex items-center gap-1">
          <h3 className="text-xs text-text-2 capitalize">End</h3>
          <ToolTipWrapper text={"Select the end position"} />
        </div>
        <div className="flex items-center gap-1.5">
          <div className="flex-1">
            <Select
              value={fullConfig.end}
              onValueChange={(value) =>
                setFullConfig((prev) => ({
                  ...prev,
                  end: value,
                }))
              }
            >
              <SelectTrigger className="min-w-[90px]">
                <SelectValue
                  placeholder="Select end"
                  className="line-clamp-1"
                />
              </SelectTrigger>
              <SelectContent className="min-w-[90px]">
                <SelectGroup>
                  <SelectItem value="top top">Top Top</SelectItem>
                  <SelectItem value="top center">Top Center</SelectItem>
                  <SelectItem value="top bottom">Top Bottom</SelectItem>
                  <SelectItem value="center top">Center Top</SelectItem>
                  <SelectItem value="center center">Center Center</SelectItem>
                  <SelectItem value="center bottom">Center Bottom</SelectItem>
                  <SelectItem value="bottom top">Bottom Top</SelectItem>
                  <SelectItem value="bottom center">Bottom Center</SelectItem>
                  <SelectItem value="bottom bottom">Bottom Bottom</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* end custom field */}
      {fullConfig.end === "custom" && (
        <div className="grid grid-cols-2 gap-2 justify-between items-center">
          <div className="flex items-center gap-1">
            <h3 className="text-xs text-text-2 capitalize">Custom End</h3>
            <ToolTipWrapper text={"Add custom end value"} />
          </div>
          <div className="flex items-center gap-1.5">
            <div className="flex-1">
              <Input
                value={fullConfig?.endCustom}
                onChange={(e) => {
                  setFullConfig((prev) => ({
                    ...prev,
                    endCustom: e.target.value,
                  }));
                }}
                placeholder="e.g., 80% 20%"
              />
            </div>
          </div>
        </div>
      )}

      {/* markers  */}
      <div className="grid grid-cols-2 gap-2 justify-between items-center">
        <div className="flex items-center gap-1">
          <h3 className="text-xs text-text-2 capitalize">Markers</h3>
          <ToolTipWrapper text={"Select the markers value"} />
        </div>
        <div className="flex items-center gap-1.5">
          <div className="flex-1">
            <Select
              value={fullConfig.markers}
              onValueChange={(value) =>
                setFullConfig((prev) => ({
                  ...prev,
                  markers: value,
                }))
              }
            >
              <SelectTrigger className="min-w-[90px]">
                <SelectValue placeholder="False" className="line-clamp-1" />
              </SelectTrigger>
              <SelectContent className="min-w-[90px]">
                <SelectGroup>
                  <SelectItem value="true">True</SelectItem>
                  <SelectItem value="false">False</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TextInvertPrest;
