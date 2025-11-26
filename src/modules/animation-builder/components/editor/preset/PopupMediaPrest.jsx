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

const PopupMediaPrest = ({ contentStep, updateContentData }) => {
  const { data } = contentStep;

  const [fullConfig, setFullConfig] = useState({
    triggerClass: data?.triggerClass || "",
    triggerType: data?.triggerType || "on_scroll",
    mediaType: data?.mediaType || "video",
    mediaUrl: data?.mediaUrl || "",
    animateFrom: data?.animateFrom || "center",
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

      {/* media type  */}

      <div className="grid grid-cols-2 gap-2 justify-between items-center">
        <div className="flex items-center gap-1">
          <h3 className="text-xs text-text-2 capitalize">Media Type</h3>
          <ToolTipWrapper text={"Select the media type"} />
        </div>
        <div className="flex items-center gap-1.5">
          <div className="flex-1">
            <Select
              value={fullConfig.mediaType}
              onValueChange={(value) =>
                setFullConfig((prev) => ({
                  ...prev,
                  mediaType: value,
                }))
              }
            >
              <SelectTrigger className="min-w-[90px]">
                <SelectValue
                  placeholder="Select media type"
                  className="line-clamp-1"
                />
              </SelectTrigger>
              <SelectContent className="min-w-[90px]">
                <SelectGroup>
                  <SelectItem value="video">Video</SelectItem>
                  <SelectItem value="youtube">Youtube</SelectItem>
                  <SelectItem value="image">Image</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* media URL  */}
      <div className="grid grid-cols-2 gap-2 justify-between items-center">
        <div className="flex items-center gap-1">
          <h3 className="text-xs text-text-2 capitalize">Media URL</h3>
          <ToolTipWrapper text={"Provide Media url"} />
        </div>
        <div className="flex items-center gap-1.5">
          <div className="flex-1">
            <Input
              value={fullConfig?.mediaUrl}
              onChange={(e) => {
                console.log(e.target.value);
                setFullConfig((prev) => ({
                  ...prev,
                  mediaUrl: e.target.value,
                }));
              }}
              placeholder="url"
            />
          </div>
        </div>
      </div>

      {/* animate from  */}

      <div className="grid grid-cols-2 gap-2 justify-between items-center">
        <div className="flex items-center gap-1">
          <h3 className="text-xs text-text-2 capitalize">Animate From</h3>
          <ToolTipWrapper text={"Select animation start from"} />
        </div>
        <div className="flex items-center gap-1.5">
          <div className="flex-1">
            <Select
              value={fullConfig.animateFrom}
              onValueChange={(value) =>
                setFullConfig((prev) => ({
                  ...prev,
                  animateFrom: value,
                }))
              }
            >
              <SelectTrigger className="min-w-[90px]">
                <SelectValue
                  placeholder="Select animate from"
                  className="line-clamp-1"
                />
              </SelectTrigger>
              <SelectContent className="min-w-[90px]">
                <SelectGroup>
                  <SelectItem value="center">Center</SelectItem>
                  <SelectItem value="left">Left</SelectItem>
                  <SelectItem value="right">Right</SelectItem>
                  <SelectItem value="top">Top</SelectItem>
                  <SelectItem value="bottom">Bottom</SelectItem>
                  <SelectItem value="rotate_top_left">
                    Rotate Top Left
                  </SelectItem>
                  <SelectItem value="rotate_top_right">
                    Rotate Top Right
                  </SelectItem>
                  <SelectItem value="rotate_bottom_left">
                    Rotate Bottom Left
                  </SelectItem>
                  <SelectItem value="rotate_bottom_right">
                    Rotate Bottom Right
                  </SelectItem>
                  <SelectItem value="rotate_center">
                    Rotate Center
                  </SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PopupMediaPrest;
