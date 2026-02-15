import React, { useEffect, useMemo, useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { HugeiconsIcon } from "@hugeicons/react";
import { DashedLine02Icon } from "@hugeicons/core-free-icons/index";
import WCFABDeleteBtn from "@/components/animations/blocks/WCFABDeleteBtn";
import WCFABLabel from "@/components/animations/blocks/WCFABLabel";
import AnimationPropsMapping from "@/editor/Shared/controller/animation_handler/AnimationPropsMapping";
import { parseCssValue, toCssValue } from "@/utils/cssHelper";
import WCFABCssInput from "@/components/animations/blocks/WCFABCssInput";
import WCFABDashedBtn from "@/components/animations/blocks/WCFABDashedBtn";

const PaddingField = ({
  property = {},
  value = "",
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
      path: "paddingTop",
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
      path: "paddingRight",
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
      path: "paddingBottom",
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
      path: "paddingLeft",
      fieldType: "block-input",
    },
  ];

  const {
    title = "title",
    tooltipContent = "Enter the value.",
    isCustomAnim = true,
  } = property || {};

  // store numbers only + one unit
  const [unit, setUnit] = useState("px");
  const [padding, setPadding] = useState({
    paddingTop: 0,
    paddingRight: 0,
    paddingBottom: 0,
    paddingLeft: 0,
  });

  // normalize 1/2/3/4 values -> 4 sides
  const normalize4 = (vals) => {
    const safe = vals.filter((v) => v !== null && v !== undefined);
    // console.log("safe", safe);

    if (safe.length === 1) return [safe[0], safe[0], safe[0], safe[0]];
    if (safe.length === 2) return [safe[0], safe[1], safe[0], safe[1]];
    if (safe.length === 3) return [safe[0], safe[1], safe[2], safe[1]];
    if (safe.length >= 4) return safe.slice(0, 4);

    return [0, 0, 0, 0];
  };

  // build css string
  const toPaddingString = (data, u) => {
    // console.log(data, u);
    const { paddingTop, paddingRight, paddingBottom, paddingLeft } = data || {};
    return [
      toCssValue(paddingTop ?? 0, u),
      toCssValue(paddingRight ?? 0, u),
      toCssValue(paddingBottom ?? 0, u),
      toCssValue(paddingLeft ?? 0, u),
    ].join(" ");
  };

  // sync incoming value from HOC
  useEffect(() => {
    if (!value) return;

    const parsed = value.split(" ").map((v) => parseCssValue(v, "px"));
    const u = parsed?.[0]?.unit ?? "px";
    setUnit(u);

    const nums = normalize4(parsed.map((p) => p?.value ?? 0));
    setPadding({
      paddingTop: nums[0],
      paddingRight: nums[1],
      paddingBottom: nums[2],
      paddingLeft: nums[3],
    });
  }, [value]);

  // send final string to HOC
  const commit = (nextPadding, nextUnit) => {
    const css = toPaddingString(nextPadding, nextUnit);
    // console.log(css);
    onValueChange(css);
  };

  // build main input display like CSS shorthand
  const getMainValues = () => {
    const t = padding.paddingTop;
    const r = padding.paddingRight;
    const b = padding.paddingBottom;
    const l = padding.paddingLeft;

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
        paddingTop: 0,
        paddingRight: 0,
        paddingBottom: 0,
        paddingLeft: 0,
      };

      setPadding(reset);
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
        paddingTop: 0,
        paddingRight: 0,
        paddingBottom: 0,
        paddingLeft: 0,
      };

      setPadding(reset);
      commit(reset, unit);
      return;
    }

    const nums = normalize4(parts);

    const nextPadding = {
      paddingTop: nums[0],
      paddingRight: nums[1],
      paddingBottom: nums[2],
      paddingLeft: nums[3],
    };

    setPadding(nextPadding);
    commit(nextPadding, unit);
  };

  const handleUnitChange = (u) => {
    setUnit(u);
    commit(padding, u);
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
            defaultData={padding}
            contentStep={padding}
            updateContentData={(value) => {
              const incoming = value?.data ?? {};

              const normalized = {
                paddingTop: Number(incoming.paddingTop) || 0,
                paddingRight: Number(incoming.paddingRight) || 0,
                paddingBottom: Number(incoming.paddingBottom) || 0,
                paddingLeft: Number(incoming.paddingLeft) || 0,
              };

              setPadding(normalized);
              commit(normalized, unit);
            }}
          />
        );
      })
      .filter(Boolean);
  }, [properties, padding, unit]);

  return (
    <div className="flex items-center justify-between">
      <WCFABLabel title={title} tooltipContent={tooltipContent} />

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
            <div className="grid grid-cols-2 gap-2.5">{fields}</div>
          </PopoverContent>
        </Popover>

        {isCustomAnim && <WCFABDeleteBtn onDelete={onDelete} />}
      </div>
    </div>
  );
};

export default PaddingField;
