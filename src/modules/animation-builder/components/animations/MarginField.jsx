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

  const selectedUnit = "px";
  const [margin, setMargin] = useState({});

  function mapMarginValue(parsed) {
    return {
      marginTop: parsed[0]?.value ?? 0,
      marginRight: parsed[1]?.value ?? 0,
      marginBottom: parsed[2]?.value ?? 0,
      marginLeft: parsed[3]?.value ?? 0,
    };
  }

  // converting box shadow data to css string
  function toMarginString(data) {
    const { marginTop, marginRight, marginBottom, marginLeft } = data || {};

    const parts = [];
    parts.push(
      toCssValue(marginTop, selectedUnit),
      toCssValue(marginRight, selectedUnit),
      toCssValue(marginBottom, selectedUnit),
      toCssValue(marginLeft, selectedUnit),
    );
    return parts.join(" ");
  }

  useEffect(() => {
    if (!value) return;
    const parsedValue = value
      ?.split(" ")
      ?.map((unit) => parseCssValue(unit, selectedUnit));
    const mappedData = mapMarginValue(parsedValue);
    setMargin(mappedData);
  }, [value]);

  const updateValue = (next = {}) => {
    const nextValue = next.value ?? margin ?? 0;
    const result = toMarginString(nextValue);
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
            defaultData={margin}
            contentStep={margin}
            updateContentData={(value) => {
              setMargin(value?.data);
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
            <Button className="wcf-ab-button-icon">
              <HugeiconsIcon
                icon={DashedLine02Icon}
                color="#A1A1AA"
                strokeWidth={1.5}
                className="w-3.5 h-3.5 text-white"
              />
            </Button>
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
