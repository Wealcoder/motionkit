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
    isRequired = false,
    isCustomAnim = true,
    min = 0,
    max = 0,
    path = "",
    ...rest
  } = property || {};

  const [padding, setPadding] = useState({});

  function mapPaddingValue(parsed) {
    return {
      paddingTop: parsed[0] ?? { value: 0, unit: "px" },
      paddingRight: parsed[1] ?? parsed[0] ?? { value: 0, unit: "px" },
      paddingBottom: parsed[2] ?? parsed[0] ?? { value: 0, unit: "px" },
      paddingLeft: parsed[3] ??
        parsed[1] ??
        parsed[0] ?? { value: 0, unit: "px" },
    };
  }

  // converting box shadow data to css string
  function toPaddingString(data) {
    const { paddingTop, paddingRight, paddingBottom, paddingLeft } = data || {};

    return [
      toCssValue(paddingTop?.value, paddingTop?.unit),
      toCssValue(paddingRight?.value, paddingRight?.unit),
      toCssValue(paddingBottom?.value, paddingBottom?.unit),
      toCssValue(paddingLeft?.value, paddingLeft?.unit),
    ].join(" ");
  }

  useEffect(() => {
    if (!value) return;

    const parsedValue = value.split(" ").map((unit) => parseCssValue(unit));

    const mappedData = mapPaddingValue(parsedValue);
    setPadding(mappedData);
  }, [value]);

  const updateValue = (next = {}) => {
    const nextValue = next.value ?? padding ?? 0;
    const result = toPaddingString(nextValue);
    onValueChange(result);
  };

  const getMainPaddingValue = (paddingState) => {
    if (!paddingState?.paddingTop) return "";

    const values = [
      paddingState.paddingTop,
      paddingState.paddingRight,
      paddingState.paddingBottom,
      paddingState.paddingLeft,
    ];

    const unit = values[0].unit;

    const sameUnit = values.every((v) => v.unit === unit);
    if (!sameUnit) return "";

    return {
      values: values.map((v) => v.value).join(","),
      unit,
    };
  };

  // mapping page transition fields
  const fields = useMemo(() => {
    return properties
      ?.map((property, index) => {
        const { path = "", fieldType = null } = property || {};
        if (!path || !fieldType) return null;
        // choosing dynamic properties field rendering styles.
        property.size = "lg";

        return (
          <AnimationPropsMapping
            key={`${path}${index}`}
            property={property}
            defaultData={padding}
            contentStep={padding}
            updateContentData={(value) => {
              setPadding(value?.data);
              updateValue(value?.data);
            }}
          />
        );
      })
      .filter(Boolean);
  }, [properties]);

  const mainPadding = getMainPaddingValue(padding);

  console.log("main padding", mainPadding);

  return (
    <div className="flex items-center justify-between">
      {/* title and tooltip */}
      <WCFABLabel title={title} tooltipContent={tooltipContent} />

      {/* right side input, popover and delete button */}
      <div className="flex items-center gap-2">
        <WCFABCssInput
          property={property}
          value={mainPadding?.values ?? ""}
          unit={mainPadding?.unit ?? "px"}
          onValueChange={onValueChange}
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

export default PaddingField;
