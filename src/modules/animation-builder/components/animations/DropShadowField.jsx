import React, { useEffect, useState } from "react";
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
import PopoverModalInputGroup from "@/components/animations/shared/PopoverModalInputGroup";
import WCFABColorPicker from "@/components/animations/blocks/WCFABColorPicker";
import WCFABDeleteBtn from "@/components/animations/blocks/WCFABDeleteBtn";
import { parseDropShadow } from "@/utils/dropShadowHelper";
import WCFABLabel from "@/components/animations/blocks/WCFABLabel";

const DropShadowField = ({
  property = {},
  value = "",
  onDisabledUpdate = () => {},
  onValueChange = () => {},
  onDelete = () => {},
}) => {
  const buildDropShadow = ({ offsetX, offsetY, blur, spread, color }) => {
    return `drop-shadow(${offsetX}px ${offsetY}px ${blur}px ${spread}px ${color})`;
  };

  const properties = [
    {
      key: "offsetX",
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
    },
    {
      key: "offsetY",
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
    },
    {
      key: "blur",
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
    },
    {
      key: "spread",
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

  const [shadow, setShadow] = useState(() => parseDropShadow(value));

  useEffect(() => {
    if (!value) return;

    setShadow((prev) => {
      const parsed = parseDropShadow(value);
      return JSON.stringify(prev) === JSON.stringify(parsed) ? prev : parsed;
    });
  }, [value]);

  const updateShadow = (next) => {
    setShadow((prev) => {
      const updatedValues = { ...prev, ...next };

      const result = {
        dropShadow: buildDropShadow(updatedValues),
      };

      onValueChange(result);

      return updatedValues;
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
            className="bg-popover w-[204px] h-[195px] p-3 flex flex-col gap-2.5"
          >
            {/* popover input fields */}
            <div className="grid grid-cols-2 gap-2.5">
              {properties.map((field) => (
                <PopoverModalInputGroup
                  key={field.key}
                  title={field.title}
                  icon={field.icon}
                  value={shadow[field.key]}
                  unit="px"
                  onValueChange={(val) => updateShadow({ [field.key]: val })}
                />
              ))}
            </div>

            {/* popover color picker */}
            <div className="flex flex-col gap-1.5 [&_input]:!bg-background-sidebar [&_input]:!max-w-[150px] [&_input:hover]:!bg-background-sidebar [&_input:focus-visible]:!bg-background-sidebar">
              <h2 className="text-[11px] font-normal text-[#E4E4E7] m-0 font-inter">
                Color
              </h2>
              <WCFABColorPicker
                value={shadow.color}
                onValueChange={(val) => updateShadow({ color: val })}
              />
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
