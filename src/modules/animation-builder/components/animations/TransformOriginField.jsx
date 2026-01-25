import React from "react";
import PopoverInputGroup from "./shared/PopoverInputGroup";
import ToolTipWrapper from "../common/ToolTipWrapper";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  CancelCircleIcon,
  Settings03Icon,
} from "@hugeicons/core-free-icons/index";
import { Key } from "lucide-react";

const TransformOriginField = ({
  property = {},
  value = 0,
  onDelete = () => {},
  onDisabledUpdate = () => {},
  onValueChange = () => {},
}) => {
  const properties = [
    {
      key: "left",
      title: "Left",
      icon: "icon",
      path: "transformOriginLeft",
    },
    {
      Key: "top",
      title: "Top",
      icon: "icon",
      path: "transformOriginTop",
    },
  ];

  const {
    title = "title",
    tooltipContent = "Enter the value.",
    isRequired = false,
    isCustomAnim = false,
    min = 0,
    max = 0,
    path = "",
    ...rest
  } = property || {};

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <span
          className="text-white text-[11px] 
        font-normal leading-5 tracking-normal"
        >
          {title}
        </span>
        {tooltipContent && <ToolTipWrapper text={tooltipContent} />}
      </div>
      <Popover>
        <PopoverTrigger>
          <div className="w-7 h-7 rounded-md bg-[#303033] p-1 flex items-center justify-center cursor-pointer">
            <HugeiconsIcon
              icon={Settings03Icon}
              color="#A1A1AA"
              strokeWidth={1.5}
              className="w-3.5 h-3.5"
            />
          </div>
        </PopoverTrigger>
        <PopoverContent className="bg-[#303033]">
          <div className="flex items-center justify-between">
            <h1
              className="text-white text-[11px] 
        font-normal leading-5 tracking-normal"
            >
              {title}
            </h1>
            <HugeiconsIcon icon={CancelCircleIcon} />
          </div>
          <div className="flex items-center gap-4">
            <div className="w-[108px] h-[108px] bg-[#202024]"></div>
            <div className="flex flex-col gap-2">
              {properties.map((p) => (
                <PopoverInputGroup
                  key={p.key}
                  title={p.title}
                  path={p.path}
                  onValueChange={onValueChange}
                />
              ))}
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default TransformOriginField;
