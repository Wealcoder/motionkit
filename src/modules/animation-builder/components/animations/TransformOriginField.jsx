import React, { useEffect, useMemo, useState } from "react";
import ToolTipWrapper from "../common/ToolTipWrapper";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { HugeiconsIcon } from "@hugeicons/react";
import WCFABLabel from "@/components/animations/blocks/WCFABLabel";
import { CancelCircleIcon } from "@hugeicons/core-free-icons/index";
import TransformOriginGrid from "@/components/animations/shared/TransformOriginRadioGrid";
import TransformOriginInputGroup from "@/components/animations/shared/TransformOriginInputGroup";
import WCFABDeleteBtn from "@/components/animations/blocks/WCFABDeleteBtn";
import { parseCssValue } from "@/utils/cssHelper";
import WCFABSettingBtn from "@/components/animations/blocks/WCFABSettingBtn";

const parseTransformOrigin = (input, fallbackUnit = "%") => {
  const raw = (input || "").trim();
  // default
  if (!raw) {
    return { x: `50${fallbackUnit}`, y: `50${fallbackUnit}` };
  }
  // normalize whitespace
  const parts = raw.split(/\s+/);
  const xRaw = parts[0] ?? "50%";
  const yRaw = parts[1] ?? "50%";
  const result = {
    x: normalizeOriginToken(xRaw, fallbackUnit, "x"),
    y: normalizeOriginToken(yRaw, fallbackUnit, "y"),
  };
  return result;
};

// Builds CSS string back
const buildTransformOrigin = ({ x, y }) => {
  const safeX = (x || "").trim();
  const safeY = (y || "").trim();

  return `${safeX} ${safeY}`.trim();
};

// Converts keywords and bare numbers into valid CSS tokens
const normalizeOriginToken = (token, fallbackUnit, axis) => {
  const t = (token || "").toLowerCase().trim();

  // Keywords allowed by CSS
  const keywordsX = { left: "0%", center: "50%", right: "100%" };
  const keywordsY = { top: "0%", center: "50%", bottom: "100%" };

  if (axis === "x" && keywordsX[t]) return keywordsX[t];
  if (axis === "y" && keywordsY[t]) return keywordsY[t];

  // Numeric with unit: 10px, 50%, 1.2rem, 3em, 10vh, etc.
  if (/^-?\d*\.?\d+[a-z%]+$/i.test(t)) return t;

  // Bare number: "10" -> "10px" (fallback unit)
  if (/^-?\d*\.?\d+$/.test(t)) return `${t}${fallbackUnit}`;

  // Unknown token -> fallback to center
  return axis === "x" ? `50${fallbackUnit}` : `50${fallbackUnit}`;
};

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
      <WCFABLabel title={title} tooltipContent={tooltipContent} />

      {/* right side popover and delete button */}
      <div className="flex items-center gap-3">
        <Popover>
          <PopoverTrigger asChild>
            <WCFABSettingBtn />
          </PopoverTrigger>
          <PopoverContent
            align="end"
            className="bg-popover w-[228px] min-h-[160px] p-3 flex flex-col gap-2.5"
          >
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
