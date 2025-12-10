import ToolTipWrapper from "@/components/common/ToolTipWrapper";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EaseConfig } from "@/config/easeData";
import { useEffect, useState } from "react";


const ImageScalePreset = ({ contentStep, updateContentData }) => {
  const { data } = contentStep;


  const [fullConfig, setFullConfig] = useState({
    containerClass: data?.containerClass || "",
    containerHeight: data?.containerHeight || "",
    itemClass: data?.itemClass || "",
    scale: data?.scale || 0.5,
    transformOrigin: data?.transformOrigin || "center",
    animationStart: data?.animationStart || "top top",
    animationCStart: data?.animationCStart || "",
    animationEnd: data?.animationEnd || "bottom bottom",
    animationCEnd: data?.animationCEnd || "",
    ease: data?.ease || "power2.out",
    playOnScroll: data?.playOnScroll || true
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
          <ToolTipWrapper text={"Add the scroll trigger class name"} />
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
          <ToolTipWrapper text={"Add the scroll height"} />
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
          <h3 className="text-xs text-text-2 capitalize">Scale</h3>
          <ToolTipWrapper text={"Add the class name of the video element"} />
        </div>
        <div className="flex items-center gap-1.5">
          <div className="flex-1">
            <Input
              value={fullConfig?.scale}
              onChange={(e) => {
                setFullConfig((prev) => ({
                  ...prev,
                  scale: Number(e.target.value),
                }));
              }}
              type="number"
              placeholder="add value"
            />
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2 justify-between items-center">
        <div className="flex items-center gap-1">
          <h3 className="text-xs text-text-2 capitalize">Transform Origin</h3>
          <ToolTipWrapper text={"Add the class name of the video element"} />
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
              placeholder="add value"
            />
          </div>
        </div>
      </div>


      <div className="grid grid-cols-2 gap-2 justify-between items-center">
        <div className="flex items-center gap-1">
          <h3 className="text-xs text-text-2 capitalize">Animation Start</h3>
          <ToolTipWrapper text={"Select the direction where the animation will move (Left, Right, Top, or Bottom)"} />
        </div>
        <div className="flex items-center gap-1.5">
          <div className="flex-1 flex flex-col gap-2">
            <Select
              value={fullConfig.animationStart}
              onValueChange={(value) => setFullConfig((prev) => ({
                ...prev,
                animationStart: value,
              }))}
            >
              <SelectTrigger className="min-w-[90px]">
                <SelectValue placeholder="Top Top" className="line-clamp-1" />
              </SelectTrigger>
              <SelectContent className="min-w-[90px]">
                <SelectGroup>
                  <SelectItem value={"top top"}>Top Top</SelectItem>
                  <SelectItem value={"top center"}>Top Center</SelectItem>
                  <SelectItem value={"top bottom"}>Top Bottom</SelectItem>
                  <SelectItem value={"bottom top"}>Bottom Top</SelectItem>
                  <SelectItem value={"bottom center"}>Bottom Center</SelectItem>
                  <SelectItem value={"bottom bottom"}>Bottom Bottom</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
            {fullConfig.animationStart === "custom" ? (
              <Input
                placeholder="top top+=100"
                value={fullConfig.animationCStart}
                onChange={(e) =>
                  setFullConfig((prev) => ({
                    ...prev,
                    animationCStart: e.target.value,
                  }))
                }
              />
            ) : (
              ""
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 justify-between items-center">
        <div className="flex items-center gap-1">
          <h3 className="text-xs text-text-2 capitalize">Animation End</h3>
          <ToolTipWrapper text={"Select the direction where the animation will move (Left, Right, Top, or Bottom)"} />
        </div>
        <div className="flex items-center gap-1.5">
          <div className="flex-1 flex flex-col gap-2">
            <Select
              value={fullConfig.animationEnd}
              onValueChange={(value) => setFullConfig((prev) => ({
                ...prev,
                animationEnd: value,
              }))}
            >
              <SelectTrigger className="min-w-[90px]">
                <SelectValue placeholder="Top Top" className="line-clamp-1" />
              </SelectTrigger>
              <SelectContent className="min-w-[90px]">
                <SelectGroup>
                  <SelectItem value={"top top"}>Top Top</SelectItem>
                  <SelectItem value={"top center"}>Top Center</SelectItem>
                  <SelectItem value={"top bottom"}>Top Bottom</SelectItem>
                  <SelectItem value={"bottom top"}>Bottom Top</SelectItem>
                  <SelectItem value={"bottom center"}>Bottom Center</SelectItem>
                  <SelectItem value={"bottom bottom"}>Bottom Bottom</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
            {fullConfig.animationEnd === "custom" ? (
              <Input
                placeholder="top top+=100"
                value={fullConfig.animationCEnd}
                onChange={(e) =>
                  setFullConfig((prev) => ({
                    ...prev,
                    animationCEnd: e.target.value,
                  }))
                }
              />
            ) : (
              ""
            )}
          </div>
        </div>
      </div>


      <div className="grid grid-cols-2 gap-2 justify-between items-center">
        <div className="flex items-center gap-1">
          <h3 className="text-xs text-text-2 capitalize">Ease</h3>
          <ToolTipWrapper text={"Select the direction where the animation will move (Left, Right, Top, or Bottom)"} />
        </div>
        <div className="flex items-center gap-1.5">
          <div className="flex-1">
            <Select
              value={fullConfig.ease}
              onValueChange={(value) => setFullConfig((prev) => ({
                ...prev,
                ease: value,
              }))}
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

      <div className="grid grid-cols-2 gap-2 justify-between items-center">
        <div className="flex items-center gap-1">
          <h3 className="text-xs text-text-2 capitalize">Play on Scroll</h3>
          <ToolTipWrapper text={"Select the direction where the animation will move (Left, Right, Top, or Bottom)"} />
        </div>
        <div className="flex items-center gap-1.5">
          <div className="flex-1">
            <Select
              value={fullConfig.playOnScroll}
              onValueChange={(value) => setFullConfig((prev) => ({
                ...prev,
                playOnScroll: value,
              }))}
            >
              <SelectTrigger className="min-w-[90px]">
                <SelectValue placeholder="Top Top" className="line-clamp-1" />
              </SelectTrigger>
              <SelectContent className="min-w-[90px]">
                <SelectGroup>
                  <SelectItem value={true}>True</SelectItem>
                  <SelectItem value={false}>False</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

    </div>
  );
};

export default ImageScalePreset;
