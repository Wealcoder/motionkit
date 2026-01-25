import React, { useEffect, useState } from "react";
import PopoverInputGroup from "./shared/PopoverInputGroup";
import ToolTipWrapper from "../common/ToolTipWrapper";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  CancelCircleIcon,
  Settings03Icon,
} from "@hugeicons/core-free-icons/index";
import TransformOriginGrid from "./shared/TransformOriginRadioGrid";
import {
  buildTransformOrigin,
  parseCssValue,
  parseTransformOrigin,
} from "@/utils/trnasformOriginHelper";

const TransformOriginField = ({
  property = {},
  value = "",
  onDelete = () => {},
  onDisabledUpdate = () => {},
  onValueChange = () => {},
}) => {
  const properties = [
    {
      key: "x",
      title: "Left",
      path: "transformOriginLeft",
    },
    {
      key: "y",
      title: "Top",
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

  const [origin, setOrigin] = useState({ x: "50%", y: "50%" });
  // console.log(origin)

  const parsedOrigin = {
    x: parseCssValue(origin.x),
    y: parseCssValue(origin.y),
  };
  useEffect(() => {
    if (!value) return;

    const [x = "50%", y = "50%"] = value.split(" ");
    setOrigin({ x, y });
  }, [value]);

  const commitOrigin = (next) => {
    // console.log(next);
    setOrigin(next);
    const originValue = {
      transformOrigin: buildTransformOrigin(next),
    };
    // console.log(originValue)
    onValueChange(originValue);
  };

  const updateField = (side, val) => {
    commitOrigin({
      ...origin,
      [side]: val,
    });
  };

  return (
    <div className="flex items-center justify-between">
      {/* title and tooltip */}
      <div className="flex items-center gap-2">
        <span className="wcf-ab-title">{title}</span>
        {tooltipContent && <ToolTipWrapper text={tooltipContent} />}
      </div>
      {/* right side popover button */}
      <Popover>
        <PopoverTrigger className="w-7 h-7 rounded-md bg-[#303033] p-1 flex items-center justify-center cursor-pointer">
          <HugeiconsIcon
            icon={Settings03Icon}
            color="#A1A1AA"
            strokeWidth={1.5}
            className="w-3.5 h-3.5"
          />
        </PopoverTrigger>
        <PopoverContent className="bg-[#303033] w-[228px] h-[160px] p-3">
          {/* modal title and cancel button */}
          <div className="flex items-center justify-between">
            <h1 className="text-white text-[11px] font-normal leading-4.25 tracking-normal">
              {title}
            </h1>
            <HugeiconsIcon icon={CancelCircleIcon} className="text-[#A1A1AA]" />
          </div>
          <div className="flex items-center gap-4">
            {/* left radio selection grid */}
            <TransformOriginGrid
              value={buildTransformOrigin(origin)}
              onChange={(cssValue) =>
                commitOrigin(parseTransformOrigin(cssValue))
              }
            />

            {/* right input fields */}
            <div className="flex flex-col gap-[9px] w-[80px] h-[109px]">
              {properties.map((field) => {
                // console.log("field.key:", field.key);
                // console.log("origin:", origin);
                // console.log("value:", origin[field.key]);

                const parsed = parsedOrigin[field.key];
                return (
                  <PopoverInputGroup
                    key={field.key}
                    title={field.title}
                    value={parsed.value}
                    unit={parsed.unit}
                    onValueChange={(val) => updateField(field.key, val)}
                  />
                );
              })}
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default TransformOriginField;
