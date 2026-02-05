import React, { useEffect, useMemo, useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowHorizontalIcon,
  ArrowVerticalIcon,
  BlurIcon,
  Sun01Icon,
} from "@hugeicons/core-free-icons/index";
import WCFABDeleteBtn from "@/components/animations/blocks/WCFABDeleteBtn";
import WCFABLabel from "@/components/animations/blocks/WCFABLabel";
import AnimationPropsMapping from "@/editor/Shared/controller/animation_handler/AnimationPropsMapping";
import { parseCssValue, toCssValue } from "@/utils/cssHelper";
import WCFABSettingBtn from "@/components/animations/blocks/WCFABSettingBtn";

const DropShadowField = ({
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

  // console.log("drop shadow value:", shadow);

  function mapDropShadowValue(parsed) {
    return {
      dropShadowOffsetX: parsed[0]?.value ?? 0,
      dropShadowOffsetY: parsed[1]?.value ?? 0,
      dropShadowBlur: parsed[2]?.value ?? 0,
      dropShadowSpread: parsed[3]?.value ?? 0,
      color: parsed[4]?.value ?? "transparent",
    };
  }

  // converting box shadow data to css string
  function toDropShadowString(data) {
    // console.log("latest values to send", data);

    const {
      dropShadowOffsetX,
      dropShadowOffsetY,
      dropShadowBlur,
      dropShadowSpread,
      color,
    } = data || {};

    const parts = [];
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
    const mappedData = mapDropShadowValue(parsedValue);
    // console.log("mapped data :", mappedData);
    setShadow(mappedData);
  }, [value]);

  const updateValue = (next = {}) => {
    const nextValue = next.value ?? shadow ?? 0;
    const result = toDropShadowString(nextValue);
    // console.log("outgoing drop value :", result);
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
            className="bg-popover w-[204px] h-[195px] p-3 flex flex-col gap-2.5"
          >
            {/* Offsets */}
            <div className="grid grid-cols-2 gap-2.5">
              {fields?.slice(0, 4).map((item) => item)}
            </div>

            {/* popover color picker */}
            <div className="flex flex-col gap-1.5 [&_input]:!bg-background-sidebar [&_input]:!max-w-[150px] [&_input:hover]:!bg-background-sidebar [&_input:focus-visible]:!bg-background-sidebar">
              <h2 className="text-[11px] font-normal text-[#E4E4E7] m-0 font-inter">
                Color
              </h2>
              {fields?.[4]}
            </div>
          </PopoverContent>
        </Popover>

        {/* delete button */}
        {isCustomAnim && <WCFABDeleteBtn onDelete={onDelete} />}
      </div>
    </div>
  );
};

export default DropShadowField;
