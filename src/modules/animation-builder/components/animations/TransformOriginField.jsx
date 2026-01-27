import React, { useEffect, useMemo, useState } from "react";
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
import { Button } from "../ui/button";
import TransformOriginInputGroup from "./shared/TransformOriginInputGroup";
import WCFABDeleteBtn from "./blocks/WCFABDeleteBtn";

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
    isCustomAnim = true,
    min = 0,
    max = 0,
    path = "",
    ...rest
  } = property || {};

  const [origin, setOrigin] = useState(() => parseTransformOrigin(value));
  // console.log(origin);

  // parse "50%" into "value = 50" and "unit = %"
  const parsedOrigin = useMemo(
    () => ({
      x: parseCssValue(origin.x),
      y: parseCssValue(origin.y),
    }),
    [origin],
  );

  // sync incoming value
  useEffect(() => {
    setOrigin(parseTransformOrigin(value));
  }, [value]);

  // helper to update onChangeValue
  const updateOrigin = (next) => {
    // console.log(next)
    setOrigin(next);

    const originValue = {
      transformOrigin: buildTransformOrigin(next),
    };

    console.log(originValue);
    onValueChange(originValue);
  };

  // input value change handler
  const updateField = (side, val) => {
    const { unit } = parsedOrigin[side];

    updateOrigin({
      ...origin,
      [side]: `${val}${unit}`,
    });
  };

  // unit change handler
  const updateUnit = (side, newUnit) => {
    const parsed = parseCssValue(origin[side]);

    updateOrigin({
      ...origin,
      [side]: `${parsed.value}${newUnit}`,
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
          <PopoverContent align="end" className="bg-popover w-[228px] min-h-[160px] p-3 flex flex-col gap-2.5">
            {/* modal title and cancel button */}
            <div className="flex items-center justify-between w-full h-3">
              <h2 className="text-white text-[11px] font-normal leading-4.25 font-inter">
                {title}
              </h2>
              <HugeiconsIcon
                icon={CancelCircleIcon}
                size={15}
                className="text-foreground-secondary w-3 h-3"
              />
            </div>
            <div className="flex items-center gap-4">
              {/* left radio selection grid */}
              <TransformOriginGrid
                value={buildTransformOrigin(origin)}
                onChange={(cssValue) =>
                  updateOrigin(parseTransformOrigin(cssValue))
                }
              />

              {/* right input fields */}
              <div className="flex flex-col gap-[9px] w-[80px] max-h-[109px]">
                {properties.map((field) => {
                  const parsed = parsedOrigin[field.key];
                  return (
                    <TransformOriginInputGroup
                      key={field.key}
                      title={field.title}
                      value={parsed.value}
                      unit={parsed.unit}
                      onValueChange={(val) => updateField(field.key, val)}
                      onUnitChange={(unit) => updateUnit(field.key, unit)}
                    />
                  );
                })}
              </div>
            </div>
          </PopoverContent>
        </Popover>

        {/* delete button */}
        {isCustomAnim && <WCFABDeleteBtn onDelete={onDelete} />}
      </div>
    </div>
  );
};

export default TransformOriginField;
