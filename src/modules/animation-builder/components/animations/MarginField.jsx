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

const MarginField = ({
  property = {},
  value = "",
  onDisabledUpdate = () => {},
  onValueChange = () => {},
  onDelete = () => {},
}) => {
  const properties = [
    {
      title: "Top",
      icon: (
        <HugeiconsIcon
          icon={DashedLine02Icon}
          color="currentColor"
          strokeWidth={1}
          className="text-[#E4E4E7] "
        />
      ),
      path: "marginTop",
      fieldType: "block-input",
    },
    {
      title: "Right",
      icon: (
        <HugeiconsIcon
          icon={DashedLine02Icon}
          color="currentColor"
          strokeWidth={1}
          className="text-[#E4E4E7] "
        />
      ),
      path: "marginRight",
      fieldType: "block-input",
    },
    {
      title: "Bottom",
      icon: (
        <HugeiconsIcon
          icon={DashedLine02Icon}
          color="currentColor"
          strokeWidth={1}
          className="text-[#E4E4E7] "
        />
      ),
      path: "marginBottom",
      fieldType: "block-input",
    },
    {
      title: "Left",
      icon: (
        <HugeiconsIcon
          icon={DashedLine02Icon}
          color="currentColor"
          strokeWidth={1}
          className="text-[#E4E4E7] "
        />
      ),
      path: "marginLeft",
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
  const [margin, setMargin] = useState({
    marginTop: 0,
    marginRight: 0,
    marginBottom: 0,
    marginLeft: 0,
  });

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
  const toMarginString = (data, u) => {
    const { marginTop, marginRight, marginBottom, marginLeft } = data || {};
    return [
      toCssValue(marginTop ?? 0, u),
      toCssValue(marginRight ?? 0, u),
      toCssValue(marginBottom ?? 0, u),
      toCssValue(marginLeft ?? 0, u),
    ].join(" ");
  };

  // sync incoming value from HOC
  useEffect(() => {
    if (!value) return;

    const parsed = value.split(" ").map((v) => parseCssValue(v, "px"));
    const u = parsed?.[0]?.unit ?? "px";
    setUnit(u);

    const nums = normalize4(parsed.map((p) => p?.value ?? 0));
    setMargin({
      marginTop: nums[0],
      marginRight: nums[1],
      marginBottom: nums[2],
      marginLeft: nums[3],
    });
  }, [value]);

  // send final string to HOC
  const commit = (nextMargin, nextUnit) => {
    const css = toMarginString(nextMargin, nextUnit);
    console.log(css);
    onValueChange(css);
  };

  // build main input display like CSS shorthand
  const getMainValues = () => {
    const t = margin.marginTop;
    const r = margin.marginRight;
    const b = margin.marginBottom;
    const l = margin.marginLeft;

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
        marginTop: 0,
        marginRight: 0,
        marginBottom: 0,
        marginLeft: 0,
      };

      setMargin(reset);
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
        marginTop: 0,
        marginRight: 0,
        marginBottom: 0,
        marginLeft: 0,
      };

      setMargin(reset);
      commit(reset, unit);
      return;
    }

    const nums = normalize4(parts);

    const nextMargin = {
      marginTop: nums[0],
      marginRight: nums[1],
      marginBottom: nums[2],
      marginLeft: nums[3],
    };

    setMargin(nextMargin);
    commit(nextMargin, unit);
  };

  const handleUnitChange = (u) => {
    setUnit(u);
    commit(margin, u);
  };

  // modal fields via HOC (numbers + static unit)
  const fields = useMemo(() => {
    return properties
      .map((p, index) => {
        const propWithUnit = { ...p, unit, size: "lg" };

        return (
          <AnimationPropsMapping
            key={`${p.path}${index}`}
            property={propWithUnit}
            defaultData={margin}
            contentStep={margin}
            updateContentData={(value) => {
              const incoming = value?.data ?? {};

              const normalized = {
                marginTop: Number(incoming.marginTop) || 0,
                marginRight: Number(incoming.marginRight) || 0,
                marginBottom: Number(incoming.marginBottom) || 0,
                marginLeft: Number(incoming.marginLeft) || 0,
              };

              setMargin(normalized);
              commit(normalized, unit);
            }}
          />
        );
      })
      .filter(Boolean);
  }, [properties, margin, unit]);

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

export default MarginField;
