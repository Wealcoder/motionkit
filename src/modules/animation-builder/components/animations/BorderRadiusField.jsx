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

  const selectedUnit = "px";
  const [radius, setRadius] = useState({});

  function mapRadiusValue(parsed) {
    return {
      radiusTopLeft: parsed[0]?.value ?? 0,
      radiusTopRight: parsed[1]?.value ?? 0,
      radiusBottomRight: parsed[2]?.value ?? 0,
      radiusBottomLeft: parsed[3]?.value ?? 0,
    };
  }

  // converting box shadow data to css string
  function toRadiusString(data) {
    const { radiusTopLeft, radiusTopRight, radiusBottomRight, radiusBottomLeft } = data || {};

    const parts = [];
    parts.push(
      toCssValue(radiusTopLeft, selectedUnit),
      toCssValue(radiusTopRight, selectedUnit),
      toCssValue(radiusBottomRight, selectedUnit),
      toCssValue(radiusBottomLeft, selectedUnit),
    );
    return parts.join(" ");
  }

  useEffect(() => {
    if (!value) return;
    const parsedValue = value
      ?.split(" ")
      ?.map((unit) => parseCssValue(unit, selectedUnit));
    const mappedData = mapRadiusValue(parsedValue);
    setRadius(mappedData);
  }, [value]);

  const updateValue = (next = {}) => {
    const nextValue = next.value ?? radius ?? 0;
    const result = toRadiusString(nextValue);
    onValueChange(result);
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
            defaultData={radius}
            contentStep={radius}
            updateContentData={(value) => {
              setRadius(value?.data);
              updateValue(value?.data);
            }}
          />
        );
      })
      .filter(Boolean);
  }, [properties]);

  return (
    <div className="flex items-center justify-between">
      {/* title and tooltip */}
      <WCFABLabel title={title} tooltipContent={tooltipContent} />

      {/* right side input, popover and delete button */}
      <div className="flex items-center gap-2">
         <WCFABCssInput
          property={property}
          value={value}
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

export default BorderRadiusField;
