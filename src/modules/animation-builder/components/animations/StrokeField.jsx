import React, { useEffect, useMemo, useState } from "react";
import WCFABLabel from "@/components/animations/blocks/WCFABLabel";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import WCFABDeleteBtn from "@/components/animations/blocks/WCFABDeleteBtn";
import AnimationPropsMapping from "@/editor/Shared/controller/animation_handler/AnimationPropsMapping";
import { parseCssValue, toCssValue } from "@/utils/cssHelper";
import WCFABSettingBtn from "@/components/animations/blocks/WCFABSettingBtn";

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

  const [stroke, setStroke] = useState({});
  const [isDataValid, setIsDataValid] = useState(false);

  // console.log("incoming value:", value);
  // console.log("local stroke state:", stroke);

  // splitting stroke value by value and unit
  function mapStrokeValue(parsed) {
    return {
      strokeWidth: parsed[0]
        ? toCssValue(parsed[0].value, parsed[0].unit)
        : "0px",
      color: parsed[1]?.value ?? "transparent",
    };
  }

  // converting stroke data to css string
  function toStrokeString(data) {
    // console.log("changed data", data);
    const { strokeWidth, color } = data || {};

    const parts = [];
    parts.push(toCssValue(strokeWidth, color));
    return parts.join(" ");
  }

  useEffect(() => {
    if (!value) return;
    const parsedValue = value?.split(" ")?.map((unit) => parseCssValue(unit));
    const mappedData = mapStrokeValue(parsedValue);
    setStroke(mappedData);
  }, [value]);

  const updateValue = (next = {}) => {
    // console.log(next.strokeWidth)
    const nextValue = next ?? stroke ?? 0;
    // console.log("next value", nextValue);
    const result = toStrokeString(nextValue);
    // console.log("final value", result);

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
              const nextValue = value?.data ?? {};
              // console.log("nextValue", nextValue)

              setStroke((prev) => {
                const merged = {
                  ...prev,
                  ...nextValue,
                };
                // console.log("merged value", merged);

                updateValue(merged);
                return merged;
              });
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
              <WCFABSettingBtn />
            </PopoverTrigger>
            <PopoverContent
              align="end"
              className="max-w-[150px] h-21 bg-[#303033] rounded-md p-2.5 flex flex-col gap-2"
            >
              <div className="[&>div]:!bg-[#18181B] [&>div]:!min-w-[130px] [&>div]:!max-h-7 [&>div:hover]:!bg-[#18181B] [&>div:focus-visible]:!bg-[#18181B] [&_button]:!bg-[#303033]">
                {fields?.[0]}
              </div>
              {/* color picker field */}
              <div className="[&_input]:!bg-background-sidebar [&_input]:!max-w-[102px] [&_input:hover]:!bg-background-sidebar [&_input:focus-visible]:!bg-background-sidebar">
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
