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

const easeConfig = [
  "power2.out",
  "power2.in",
  "power2.inOut",
  "power3.out",
  "power3.in",
  "power3.inOut",
  "power4.out",
  "power4.in",
  "power4.inOut",
  "back",
  "bounce",
  "circ",
  "elastic",
  "expo",
  "sine",
  "steps",
  "rough",
  "slow",
  "none",
];

const TextRotatePrest = ({ contentStep, updateContentData }) => {
  const { data } = contentStep;

  const [fullConfig, setFullConfig] = useState({
    triggerClass: data?.triggerClass || "",
    triggerType: data?.triggerType || "on_scroll",
    itemClass: data?.itemClass || "",
    start: data?.start || "top top",
    startCustom: data?.startCustom || "",
    end: data?.end || "bottom bottom",
    endCustom: data?.endCustom || "",
    delay: data?.delay || 0,
    duration: data?.duration || 1,
    stagger: data?.stagger || 0.02,
    rotationX: data?.rotationX || "",
    rotationY: data?.rotationY || "",
    transformOrigin: data?.transformOrigin || "top center -50",
    ease: data?.ease || "power2.out",
    markers: data?.markers || "false",
  });

  useEffect(() => {
    const result = { ...contentStep, data: { ...data, ...fullConfig } };
    updateContentData(result);
  }, [fullConfig]);

  const checkOptionEnable = () => {
    if (
      fullConfig.triggerType === "on_scroll" ||
      fullConfig.triggerType === "play_with_scroll"
    ) {
      return true;
    } else {
      return false;
    }
  };

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
              value={fullConfig.triggerType}
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
                  <SelectItem value="on_scroll">On Scroll</SelectItem>
                  <SelectItem value="page_load">On Page Load</SelectItem>
                  <SelectItem value="play_with_scroll">
                    Play With Scroll
                  </SelectItem>
                  <SelectItem value="hover">Hover</SelectItem>
                  <SelectItem value="click">Click</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* trigger class  */}
      {fullConfig.triggerType !== "page_load" ? (
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
      ) : (
        ""
      )}

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

      {/* rotate x value  */}
      <div className="grid grid-cols-2 gap-2 justify-between items-center">
        <div className="flex items-center gap-1">
          <h3 className="text-xs text-text-2 capitalize">Rotate X</h3>
          <ToolTipWrapper text={"Rotate X value"} />
        </div>
        <div className="flex items-center gap-1.5">
          <div className="flex-1">
            <Input
              value={fullConfig?.rotationX}
              onChange={(e) => {
                setFullConfig((prev) => ({
                  ...prev,
                  rotationX: e.target.value,
                }));
              }}
              placeholder="add value"
            />
          </div>
        </div>
      </div>

      {/* rotate y value  */}
      <div className="grid grid-cols-2 gap-2 justify-between items-center">
        <div className="flex items-center gap-1">
          <h3 className="text-xs text-text-2 capitalize">Rotate Y</h3>
          <ToolTipWrapper text={"Rotate Y value"} />
        </div>
        <div className="flex items-center gap-1.5">
          <div className="flex-1">
            <Input
              value={fullConfig?.rotationY}
              onChange={(e) => {
                setFullConfig((prev) => ({
                  ...prev,
                  rotationY: e.target.value,
                }));
              }}
              placeholder="add value"
            />
          </div>
        </div>
      </div>

      {/* transform origin value  */}
      <div className="grid grid-cols-2 gap-2 justify-between items-center">
        <div className="flex items-center gap-1">
          <h3 className="text-xs text-text-2 capitalize">Transform Origin</h3>
          <ToolTipWrapper text={"Transform Origin value"} />
        </div>
        <div className="flex items-center gap-1.5">
          <div className="flex-1">
            <Input
              value={fullConfig?.transformOrigin}
              onChange={(e) => {
                setFullConfig((prev) => ({
                  ...prev,
                  transformOrigin: e.target.value,
                }));
              }}
              placeholder="top center -50"
            />
          </div>
        </div>
      </div>

      {/* start  */}
      {checkOptionEnable() ? (
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
      ) : (
        ""
      )}

      {/* start custom field */}
      {checkOptionEnable() && fullConfig.start === "custom" && (
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
      {checkOptionEnable() ? (
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
      ) : (
        ""
      )}

      {/* end custom field */}
      {checkOptionEnable() && fullConfig.end === "custom" && (
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

      {/* stagger  */}
      <div className="grid grid-cols-2 gap-2 justify-between items-center">
        <div className="flex items-center gap-1">
          <h3 className="text-xs text-text-2 capitalize">Stagger</h3>
          <ToolTipWrapper text={"Stagger delay between elements in seconds"} />
        </div>
        <div className="flex items-center gap-1.5">
          <div className="flex-1">
            <Input
              type="number"
              value={fullConfig?.stagger}
              onChange={(e) => {
                setFullConfig((prev) => ({
                  ...prev,
                  stagger: parseFloat(e.target.value) || 0,
                }));
              }}
              placeholder="0"
              step="0.01"
              min="0"
            />
          </div>
        </div>
      </div>

      {/* ease  */}

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
                  {easeConfig?.map((el) => (
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

export default TextRotatePrest;
