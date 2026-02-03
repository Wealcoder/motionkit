import React, { useEffect, useMemo, useState } from "react";
import WCFABLabel from "@/components/animations/blocks/WCFABLabel";
import { Settings03Icon } from "@hugeicons/core-free-icons";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import WCFABDeleteBtn from "@/components/animations/blocks/WCFABDeleteBtn";
import { HugeiconsIcon } from "@hugeicons/react";
import { Button } from "@/components/ui/button";
import AnimationPropsMapping from "@/editor/Shared/controller/animation_handler/AnimationPropsMapping";
import { parseCssValue, toCssValue } from "@/utils/cssHelper";

const StrokeField = ({
  property = {},
  value = "",
  onValueChange = () => {},
  onDisabledUpdate = () => {},
  onDelete = () => {},
}) => {
  const properties = [
    {
      path: "strokeWidth",
      fieldType: "block-input-unit-select",
    },
    {
      path: "color",
      fieldType: "block-color",
    },
  ];

  const {
    title = "Stroke",
    tooltipContent = "Stroke Value",
    min = 0,
    max = 0,
    path = "",
    isRequired = false,
    isCustomAnim = true,
    ...rest
  } = property || {};

  const selectedUnit = "px";
  const [stroke, setStroke] = useState({});
  const [isDataValid, setIsDataValid] = useState(false);

  // console.log("incoming stroke values", value);
  console.log("stroke state values", stroke);

  // splitting stroke value by value and unit
  function mapStrokeValue(parsed) {
    // console.log({parsed})
    return {
      strokeWidth: parsed[0]?.value ?? 0,
      color: parsed[1]?.value ?? "transparent",
    };
  }

  // converting stroke data to css string
  function toStrokeString(data) {
    const { strokeWidth, color } = data || {};

    const parts = [];
    parts.push(toCssValue(strokeWidth, selectedUnit), color);
    return parts.join(" ");
  }

  useEffect(() => {
    if (!value) return;
    const parsedValue = value
      ?.split(" ")
      ?.map((unit) => parseCssValue(unit, selectedUnit));
      const mappedData = mapStrokeValue(parsedValue);
      console.log("mapped data :", mappedData);
    setStroke(mappedData);
  }, [value]);

  const updateValue = (next = {}) => {
    // console.log("next value :",next)
    const nextValue = next.value ?? stroke ?? 0;
    const result = toStrokeString(nextValue);
    // console.log("outgoing box value :", result)
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
            defaultData={stroke}
            contentStep={stroke}
            updateContentData={(value) => {
              setStroke(value?.data);
              updateValue(value?.data);
            }}
          />
        );
      })
      .filter(Boolean);
  }, [properties]);

  return (
    <div className="w-64 h-7 p-0.5">
      <div className="h-7 flex justify-between items-center rounded-lg">
        {/* left label + tooltip */}
        <WCFABLabel title={title} tooltipContent={tooltipContent} />

        <div className="w-12 h-7 flex items-center gap-2">
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
              className="max-w-[150px] h-21 bg-[#303033] rounded-md p-2.5 flex flex-col gap-2"
            >
              <div className="[&>div]:!bg-[#18181B] [&>div]:!min-w-[130px] [&>div]:!max-h-7 [&>div:hover]:!bg-[#18181B] [&>div:focus-visible]:!bg-[#18181B] [&_button]:!bg-[#303033]">
                {fields?.[0]}
              </div>
              {/* color picker field */}
              <div className="[&_input]:!bg-background-sidebar [&_input:hover]:!bg-background-sidebar [&_input:focus-visible]:!bg-background-sidebar">
                {fields?.[1]}
              </div>
            </PopoverContent>
          </Popover>
          {/* delete button */}
          {isCustomAnim && <WCFABDeleteBtn onDelete={onDelete} />}
        </div>
      </div>

      {/* required message */}
      {isRequired && isDataValid && (
        <p className="text-white text-sm">Field is Required</p>
      )}
    </div>
  );
};

export default StrokeField;
