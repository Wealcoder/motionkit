import React, { useEffect, useMemo, useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import { DashedLine02Icon } from "@hugeicons/core-free-icons/index";
import WCFABDeleteBtn from "@/components/animations/blocks/WCFABDeleteBtn";
import WCFABLabel from "@/components/animations/blocks/WCFABLabel";
import AnimationPropsMapping from "@/editor/Shared/controller/animation_handler/AnimationPropsMapping";
import { parseCssValue, toCssValue } from "@/utils/cssHelper";
import WCFABCssInput from "@/components/animations/blocks/WCFABCssInput";
import WCFABDashedBtn from "@/components/animations/blocks/WCFABDashedBtn";

const BorderRadiusField = ({
  property = {},
  value = "",
  onDisabledUpdate = () => {},
  onValueChange = () => {},
  onDelete = () => {},
}) => {
  const properties = [
    {
      title: "TopLeft",
      icon: (
        <HugeiconsIcon
          icon={DashedLine02Icon}
          color="currentColor"
          strokeWidth={1}
          className="text-[#E4E4E7] "
        />
      ),
      path: "radiusTopLeft",
      fieldType: "block-input",
    },
    {
      title: "TopRight",
      icon: (
        <HugeiconsIcon
          icon={DashedLine02Icon}
          color="currentColor"
          strokeWidth={1}
          className="text-[#E4E4E7] "
        />
      ),
      path: "radiusTopRight",
      fieldType: "block-input",
    },
    {
      title: "BottomRight",
      icon: (
        <HugeiconsIcon
          icon={DashedLine02Icon}
          color="currentColor"
          strokeWidth={1}
          className="text-[#E4E4E7] "
        />
      ),
      path: "radiusBottomRight",
      fieldType: "block-input",
    },
    {
      title: "BottomLeft",
      icon: (
        <HugeiconsIcon
          icon={DashedLine02Icon}
          color="currentColor"
          strokeWidth={1}
          className="text-[#E4E4E7] "
        />
      ),
      path: "radiusBottomLeft",
      fieldType: "block-input",
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

  // store numbers only + one unit
  const [unit, setUnit] = useState("px");
  const [radius, setRadius] = useState({
    radiusTopLeft: 0,
    radiusTopRight: 0,
    radiusBottomRight: 0,
    radiusBottomLeft: 0,
  });

  // console.log("state value", radius);

  // normalize 1/2/3/4 values -> 4 sides
  const normalize4 = (vals) => {
    const safe = vals.filter((v) => v !== null && v !== undefined);

    if (safe.length === 1) return [safe[0], safe[0], safe[0], safe[0]];
    if (safe.length === 2) return [safe[0], safe[1], safe[0], safe[1]];
    if (safe.length === 3) return [safe[0], safe[1], safe[2], safe[1]];
    if (safe.length >= 4) return safe.slice(0, 4);

    return [0, 0, 0, 0];
  };

  // build css string
  const toRadiusString = (data, u) => {
    const {
      radiusTopLeft,
      radiusTopRight,
      radiusBottomRight,
      radiusBottomLeft,
    } = data || {};
    return [
      toCssValue(radiusTopLeft ?? 0, u),
      toCssValue(radiusTopRight ?? 0, u),
      toCssValue(radiusBottomRight ?? 0, u),
      toCssValue(radiusBottomLeft ?? 0, u),
    ].join(" ");
  };

  // sync incoming value from HOC
  useEffect(() => {
    if (!value) return;

    const parsed = value.split(" ").map((v) => parseCssValue(v, "px"));
    const u = parsed?.[0]?.unit ?? "px";
    setUnit(u);

    const nums = normalize4(parsed.map((p) => p?.value ?? 0));
    setRadius({
      radiusTopLeft: nums[0],
      radiusTopRight: nums[1],
      radiusBottomRight: nums[2],
      radiusBottomLeft: nums[3],
    });
  }, [value]);

  // send final string to HOC
  const commit = (nextRadius, nextUnit) => {
    const css = toRadiusString(nextRadius, nextUnit);
    console.log(css);
    onValueChange(css);
  };

  // build main input display like CSS shorthand
  const getMainValues = () => {
    const t = radius.radiusTopLeft;
    const r = radius.radiusTopRight;
    const b = radius.radiusBottomRight;
    const l = radius.radiusBottomLeft;

    // 1
    if (t === r && r === b && b === l) return `${t}`;
    // 2
    if (t === b && r === l) return `${t}, ${r}`;
    // 3
    if (t === b) return `${t}, ${r}, ${l}`;
    // 4
    if (r === l) return `${t}, ${r}, ${b}`;
    // 5
    return `${t}, ${r}, ${b}, ${l}`;
  };

  // main input change (string: "3 5 7 9" OR "3,5,7,9")
  const handleMainChange = (raw) => {
    const cleaned = String(raw ?? "").trim();

    // If empty → reset everything
    if (!cleaned) {
      const reset = {
        radiusTopLeft: 0,
        radiusTopRight: 0,
        radiusBottomRight: 0,
        radiusBottomLeft: 0,
      };

      setRadius(reset);
      commit(reset, unit);
      return;
    }

    const parts = cleaned
      .split(/[,\s]+/)
      .filter(Boolean)
      .map((n) => Number(n))
      .filter((n) => !Number.isNaN(n));

    if (parts.length === 0) {
      const reset = {
        radiusTopLeft: 0,
        radiusTopRight: 0,
        radiusBottomRight: 0,
        radiusBottomLeft: 0,
      };

      setRadius(reset);
      commit(reset, unit);
      return;
    }

    const nums = normalize4(parts);

    const nextRadius = {
      radiusTopLeft: nums[0],
      radiusTopRight: nums[1],
      radiusBottomRight: nums[2],
      radiusBottomLeft: nums[3],
    };

    setRadius(nextRadius);
    commit(nextRadius, unit);
  };

  const handleUnitChange = (u) => {
    setUnit(u);
    commit(radius, u);
  };

  // modal fields via HOC (numbers + static unit)
  const fields = useMemo(() => {
    return properties
      .map((property, index) => {
        const { path = "", fieldType = null } = property || {};
        if (!path || !fieldType) return null;
        const propWithUnit = { ...property, unit, size: "lg" };

        return (
          <AnimationPropsMapping
            key={`${path}${index}`}
            property={propWithUnit}
            defaultData={radius}
            contentStep={radius}
            updateContentData={(value) => {
              // console.log("value", value);
              const incoming = value?.data ?? {};

              const normalized = {
                radiusTopLeft: Number(incoming.radiusTopLeft) || 0,
                radiusTopRight: Number(incoming.radiusTopRight) || 0,
                radiusBottomRight: Number(incoming.radiusBottomRight) || 0,
                radiusBottomLeft: Number(incoming.radiusBottomLeft) || 0,
              };

              setRadius(normalized);
              commit(normalized, unit);
            }}
          />
        );
      })
      .filter(Boolean);
  }, [properties, radius, unit]);

  return (
    <div className="flex items-center justify-between">
      {/* title and tooltip */}
      <WCFABLabel title={title} tooltipContent={tooltipContent} />

      {/* right side input, popover and delete button */}
      <div className="flex items-center gap-2">
        <WCFABCssInput
          property={property}
          value={getMainValues()}
          unit={unit}
          allowMulti={true}
          onValueChange={handleMainChange}
          onUnitChange={handleUnitChange}
        />
        <Popover>
          <PopoverTrigger asChild>
            <WCFABDashedBtn />
          </PopoverTrigger>
          <PopoverContent
            align="end"
            className="bg-popover w-[204px] h-[134px] p-3 flex flex-col gap-2.5"
          >
            {/* Offsets */}
            <div className="grid grid-cols-2 gap-2.5">
              {fields?.map((item) => item)}
            </div>
          </PopoverContent>
        </Popover>

        {/* delete button */}
        {isCustomAnim && <WCFABDeleteBtn onDelete={onDelete} />}
      </div>
    </div>
  );
};

export default BorderRadiusField;
