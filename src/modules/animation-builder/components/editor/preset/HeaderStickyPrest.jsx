import ToolTipWrapper from "@/components/common/ToolTipWrapper";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EaseConfig } from "@/config/easeData";
import { useEffect, useState } from "react";

const HeaderStickyPrest = ({ contentStep, updateContentData }) => {
  const { data } = contentStep;

  const [fullConfig, setFullConfig] = useState({
    itemClass: data?.itemClass || "",
    endClass: data?.endClass || "",
    startPosition: data?.startPosition || "300",
    zIndex: data?.zIndex || "",
    styleClass: data?.styleClass || "",
    upScroll: data?.upScroll || false,
    ease: data?.ease || "power2.out",
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
          <h3 className="text-xs text-text-2 capitalize">End Class</h3>
          <ToolTipWrapper text={"Add the end class name"} />
        </div>
        <div className="flex items-center gap-1.5">
          <div className="flex-1">
            <Input
              value={fullConfig?.endClass}
              onChange={(e) => {
                setFullConfig((prev) => ({
                  ...prev,
                  endClass: e.target.value,
                }));
              }}
              placeholder="add value"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 justify-between items-center">
        <div className="flex items-center gap-1">
          <h3 className="text-xs text-text-2 capitalize">Start Position</h3>
          <ToolTipWrapper text={"start position"} />
        </div>
        <div className="flex items-center gap-1.5">
          <div className="flex-1">
            <Input
              value={fullConfig?.startPosition}
              onChange={(e) => {
                setFullConfig((prev) => ({
                  ...prev,
                  startPosition: e.target.value,
                }));
              }}
              placeholder="add value"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 justify-between items-center">
        <div className="flex items-center gap-1">
          <h3 className="text-xs text-text-2 capitalize">Z-Index</h3>
          <ToolTipWrapper text={"Add z-index value"} />
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

      <div className="grid grid-cols-2 gap-2 justify-between items-center">
        <div className="flex items-center gap-1">
          <h3 className="text-xs text-text-2 capitalize">Style Class</h3>
          <ToolTipWrapper text={"Add only style class name"} />
        </div>
        <div className="flex items-center gap-1.5">
          <div className="flex-1">
            <Input
              value={fullConfig?.styleClass}
              onChange={(e) => {
                setFullConfig((prev) => ({
                  ...prev,
                  styleClass: e.target.value,
                }));
              }}
              placeholder="add value"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 justify-between items-center">
        <div className="flex items-center gap-1">
          <h3 className="text-xs text-text-2 capitalize">Up Scroll Sticky</h3>
          <ToolTipWrapper text={"Show sticky when scroll up"} />
        </div>
        <div className="flex items-center gap-1.5">
          <div className="flex-1">
            <Switch
              checked={fullConfig?.upScroll}
              onCheckedChange={(value) => {
                setFullConfig((prev) => ({
                  ...prev,
                  upScroll: value,
                }));
              }}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 justify-between items-center">
        <div className="flex items-center gap-1">
          <h3 className="text-xs text-text-2 capitalize">Ease</h3>
          <ToolTipWrapper
            text={
              "Select the direction where the animation will move (Left, Right, Top, or Bottom)"
            }
          />
        </div>
        <div className="flex items-center gap-1.5">
          <div className="flex-1">
            <Select
              value={fullConfig.ease}
              onValueChange={(value) =>
                setFullConfig((prev) => ({
                  ...prev,
                  ease: value,
                }))
              }
            >
              <SelectTrigger className="min-w-[90px]">
                <SelectValue placeholder="Top Top" className="line-clamp-1" />
              </SelectTrigger>
              <SelectContent className="min-w-[90px]">
                <SelectGroup>
                  {EaseConfig?.map((el) => (
                    <SelectItem key={el} value={el}>
                      {el}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeaderStickyPrest;
