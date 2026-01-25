import React, { useState, useCallback, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { debounceFn } from "@/utils/utils";
import ToolTipWrapper from "@/components/common/ToolTipWrapper";
import DeleteBtn from "@/components/animations/shared/DeleteBtn";

const TextField = ({
  property = {},
  value = "",
  onDelete = () => {},
  onDisabledUpdate = () => {},
  onValueChange = () => {},
}) => {
  const {
    title = "title",
    tooltipContent = "Enter the value.",
    isRequired = false,
    isCustomAnim = false,
    ...rest
  } = property || {};

  const [currentValue, setCurrentValue] = useState(value ?? "");
  const [isDataValid, setIsDataValid] = useState(false);

  const handleDebouncedChange = useCallback(
    debounceFn((val) => {
      onValueChange(val);
    }, 150),
    [onValueChange],
  );

  useEffect(() => {
    return () => {
      if (handleDebouncedChange.cancel) handleDebouncedChange.cancel();
    };
  }, [handleDebouncedChange]);

  return (
    <div>
      <div className="flex flex-col justify-between gap-3 rounded-lg sm:flex-row sm:items-center">
        {/* left title + tooltip */}
        <div className="flex items-center gap-[6px]">
          <span className="wcf-ab-title">{title}</span>
          {tooltipContent && <ToolTipWrapper text={tooltipContent} />}
        </div>

        {/* right input + delete button */}
        <div className="flex-1 flex justify-end items-center gap-3">
          <Input
            placeholder=".start_trigger"
            className="wcf-ab-dynamic-field-input"
            value={currentValue}
            type="text"
            onChange={(e) => {
              const val = e.target.value;
              setCurrentValue(val);
              handleDebouncedChange(val);
            }}
          />
          {isCustomAnim && <DeleteBtn onDelete={onDelete} />}
        </div>
      </div>

      {/* required message */}
      {isRequired && isDataValid && (
        <p className="text-white text-message">Field is Required</p>
      )}
    </div>
  );
};

export default TextField;
