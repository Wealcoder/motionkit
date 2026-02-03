import React, { useEffect, useMemo, useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowHorizontalIcon,
  ArrowVerticalIcon,
  BlurIcon,
  Settings03Icon,
  Sun01Icon,
} from "@hugeicons/core-free-icons/index";
import WCFABDeleteBtn from "@/components/animations/blocks/WCFABDeleteBtn";
import WCFABLabel from "@/components/animations/blocks/WCFABLabel";
import AnimationPropsMapping from "@/editor/Shared/controller/animation_handler/AnimationPropsMapping";
import { parseCssValue, toCssValue } from "@/utils/cssHelper";

const BoxShadowField = ({
  property = {},
  value = "",
  onDisabledUpdate = () => {},
  onValueChange = () => {},
  onDelete = () => {},
}) => {
  const properties = [
    {
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
      fieldType: "block-input",
    },
    {
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
      fieldType: "block-input",
    },
    {
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
      fieldType: "block-input",
    },
    {
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
      fieldType: "block-input",
    },
    {
      title: "Color",
      path: "color",
      fieldType: "block-color",
    },
    {
      title: "Inner Shadow",
      path: "innerShadow",
      fieldType: "switch-field",
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
  const [shadow, setShadow] = useState({});

  // splitting box shadow value by value and unit
  function mapBoxShadowValue(parsed) {
    return {
      innerShadow: parsed[0]?.value === "inset",
      dropShadowOffsetX: parsed[1]?.value ?? 0,
      dropShadowOffsetY: parsed[2]?.value ?? 0,
      dropShadowBlur: parsed[3]?.value ?? 0,
      dropShadowSpread: parsed[4]?.value ?? 0,
      color: parsed[5]?.value ?? "transparent",
    };
  }

  // converting box shadow data to css string
  function toBoxShadowString(data) {
    const {
      innerShadow,
      dropShadowOffsetX,
      dropShadowOffsetY,
      dropShadowBlur,
      dropShadowSpread,
      color,
    } = data || {};

    const parts = [];
    if (innerShadow) parts.push("inset");
    parts.push(
      toCssValue(dropShadowOffsetX, selectedUnit),
      toCssValue(dropShadowOffsetY, selectedUnit),
      toCssValue(dropShadowBlur, selectedUnit),
      toCssValue(dropShadowSpread, selectedUnit),
      color,
    );
    return parts.join(" ");
  }

  useEffect(() => {
    if (!value) return;
    const parsedValue = value
      ?.split(" ")
      ?.map((unit) => parseCssValue(unit, selectedUnit));
    const mappedData = mapBoxShadowValue(parsedValue);
    setShadow(mappedData);
  }, [value]);

  const updateValue = (next = {}) => {
    const nextValue = next.value ?? shadow ?? 0;
    onValueChange(toBoxShadowString(nextValue));
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
            defaultData={shadow}
            contentStep={shadow}
            updateContentData={(value) => {
              setShadow(value?.data);
              updateValue(value?.data);
            }}
          />
        );
      })
      .filter(Boolean);
  }, [properties]);

  // console.log(fields);

  return (
    <div className="flex items-center justify-between">
      {/* title and tooltip */}
      <WCFABLabel title={title} tooltipContent={tooltipContent} />

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
          <PopoverContent
            align="end"
            className="bg-popover w-[204px] h-[233px] p-3 flex flex-col gap-2.5"
          >
            {/* Offsets */}
            <div className="grid grid-cols-2 gap-2.5">
              {fields?.slice(0, 4).map((item) => item)}
            </div>

            {/* Color */}
            <div className="w-full [&>div]:gap-[3px] [&_input]:!max-w-[150px] flex flex-col gap-1.5 [&_input]:!bg-background-sidebar [&_input:hover]:!bg-background-sidebar [&_input:focus-visible]:!bg-background-sidebar">
              <h2 className="text-[11px] text-[#E4E4E7] font-normal leading-[17px] m-0">
                Color
              </h2>{" "}
              {fields?.[4]}
            </div>

            {/* Inner Shadow */}
            <div className="w-full min-h-7">{fields?.[5]}</div>
          </PopoverContent>
        </Popover>

        {/* delete button */}
        {isCustomAnim && <WCFABDeleteBtn onDelete={onDelete} />}
      </div>
    </div>
  );
};

export default BoxShadowField;
