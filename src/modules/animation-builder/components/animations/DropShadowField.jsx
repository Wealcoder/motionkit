import React, { useEffect, useState } from "react";
import ToolTipWrapper from "../common/ToolTipWrapper";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Button } from "../ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowHorizontalIcon,
  ArrowVerticalIcon,
  BlurIcon,
  Settings03Icon,
  Sun01Icon,
} from "@hugeicons/core-free-icons/index";
import PopoverModalInputGroup from "./shared/PopoverModalInputGroup";
import WCFABColorPicker from "./blocks/WCFABColorPicker";
import WCFABDeleteBtn from "./blocks/WCFABDeleteBtn";
import { parseCssValue } from "@/utils/trnasformOriginHelper";

const DEFAULT_SHADOW = {
  offsetX: 10,
  offsetY: 50,
  blur: 40,
  spread: 20,
  color: "#000000",
};

export const parseDropShadow = (cssValue) => {
  if (!cssValue) return { ...DEFAULT_SHADOW };

  const match = cssValue.match(/drop-shadow\((.*)\)/);
  if (!match) return { ...DEFAULT_SHADOW };

  const parts = match[1].split(/\s+(?![^(]*\))/);

  return {
    offsetX: parseCssValue(parts[0]).value,
    offsetY: parseCssValue(parts[1]).value,
    blur: parseCssValue(parts[2]).value,
    spread: parseCssValue(parts[3]).value,
    color: parts.slice(4).join(" ") || DEFAULT_SHADOW.color,
  };
};

export const buildDropShadow = ({ offsetX, offsetY, blur, spread, color }) => {
  return `drop-shadow(${offsetX}px ${offsetY}px ${blur}px ${spread}px ${color})`;
};

const DropShadowField = ({
  property = {},
  value = "",
  onDisabledUpdate = () => {},
  onValueChange = () => {},
  onDelete = () => {},
}) => {
  const properties = [
    {
      key: "offsetX",
      title: "Offset X",
      icon: (
        <HugeiconsIcon
          icon={ArrowHorizontalIcon}
          color="currentColor"
          strokeWidth={1}
          className="text-[#E4E4E7] "
        />
      ),
      path: "dropShadowOffsetX",
    },
    {
      key: "offsetY",
      title: "Offset Y",
      icon: (
        <HugeiconsIcon
          icon={ArrowVerticalIcon}
          color="currentColor"
          strokeWidth={1}
          className="text-[#E4E4E7] "
        />
      ),
      path: "dropShadowOffsetY",
    },
    {
      key: "blur",
      title: "Blur",
      icon: (
        <HugeiconsIcon
          icon={BlurIcon}
          color="currentColor"
          strokeWidth={1}
          className="text-[#E4E4E7] "
        />
      ),
      path: "dropShadowBlur",
    },
    {
      key: "spread",
      title: "Spread",
      icon: (
        <HugeiconsIcon
          icon={Sun01Icon}
          color="currentColor"
          strokeWidth={1}
          className="text-[#E4E4E7] "
        />
      ),
      path: "dropShadowSpread",
    },
  ];

  const {
    title = "title",
    tooltipContent = "Enter the value.",
    isRequired = false,
    isCustomAnim = true,
    min = 0,
    max = 0,
    path = "",
    ...rest
  } = property || {};

  const [shadow, setShadow] = useState(() => parseDropShadow(value));

  useEffect(() => {
    if (!value) return;

    setShadow((prev) => {
      const parsed = parseDropShadow(value);
      return JSON.stringify(prev) === JSON.stringify(parsed) ? prev : parsed;
    });
  }, [value]);

  const updateShadow = (next) => {
    setShadow((prev) => {
      const updated = { ...prev, ...next };

      const result = {
        dropShadow: buildDropShadow(updated),
      };

      console.log("drop shadow value",result)
      onValueChange(result);

      return updated;
    });
  };

  return (
    <div className="flex items-center justify-between">
      {/* title and tooltip */}
      <div className="flex items-center gap-2">
        <span className="wcf-ab-title">{title}</span>
        {tooltipContent && <ToolTipWrapper text={tooltipContent} />}
      </div>

      {/* right side popover and delete button */}
      <div className="flex items-center gap-3">
        <Popover>
          <PopoverTrigger asChild>
            <Button className="wcf-ab-button-icon">
              <HugeiconsIcon
                icon={Settings03Icon}
                color="#A1A1AA"
                strokeWidth={1.5}
                className="w-3.5 h-3.5 text-white"
              />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="bg-popover w-[204px] h-[195px] p-3 mr-5 flex flex-col gap-2.5">
            {/* right input fields */}
            <div className="grid grid-cols-2 gap-2.5">
              {properties.map((field) => {
                // console.log(field.key, "value : ",shadow[field.key])
                
                return (
                  <PopoverModalInputGroup
                    key={field.key}
                    title={field.title}
                    icon={field.icon}
                    value={shadow[field.key]}
                    unit="px"
                    onValueChange={(val) => updateShadow({ [field.key]: val })}
                  />
                );
              })}
            </div>

            <div className="flex flex-col gap-1.5 [&_input]:!bg-background-sidebar [&_input]:!max-w-[150px] [&_input:hover]:!bg-background-sidebar [&_input:focus-visible]:!bg-background-sidebar">
              <h2 className="text-[11px] font-normal text-[#E4E4E7] m-0 font-inter">
                Color
              </h2>
              <WCFABColorPicker
                value={shadow.color}
                onValueChange={onValueChange}
              />
            </div>
          </PopoverContent>
        </Popover>

        {/* delete button */}
        {isCustomAnim && <WCFABDeleteBtn onDelete={onDelete} />}
      </div>
    </div>
  );
};

export default DropShadowField;
