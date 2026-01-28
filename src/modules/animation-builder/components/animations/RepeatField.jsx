import React, { useState } from "react";
import {
  ArrowDataTransferHorizontalIcon,
  InfinityIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Button } from "@/components/ui/button";
import { debounceFn } from "@/utils/utils";
import WCFABLabel from "@/components/animations/blocks/WCFABLabel";
import WCFABDeleteBtn from "@/components/animations/blocks/WCFABDeleteBtn";
import WCFABErrorMessage from "@/components/animations/blocks/WCFABErrorMessage";
import WCFABNumberInput from "@/components/animations/blocks/WCFABNumberInput";

const RepeatField = ({
  property = {},
  value = { repeat: 0, yoyo: false },
  onValueChange = () => {},
  onDisabledUpdate = () => {},
  onDelete = () => {},
}) => {
  // default value
  const {
    title = "Repeat",
    tooltipContent = "Enter the value.",
    isRequired = false,
    isCustomAnim = true,
    min = 0,
    max = 0,
    path = "",
    ...rest
  } = property || {};

  const [inputValue, setInputValue] = useState(value.repeat ?? 0);
  const [isDataValid, setIsDataValid] = useState(false);

  const updateValue = (newValues) => {
    onValueChange({
      ...value,
      ...newValues,
    });
  };

  const handleInput = debounceFn((rewValue) => {
    if (rewValue === "" || rewValue === "-") return;

    let currentValue = Number(rewValue);
    if (isNaN(currentValue)) return;

    if (min !== 0 || max !== 0) {
      if (currentValue < min) currentValue = min;
      if (currentValue > max) currentValue = max;

      setInputValue(currentValue);
      updateValue({
        repeat: currentValue,
        yoyo: false,
      });
      return;
    }

    setInputValue(currentValue);
    updateValue({
      repeat: currentValue,
      yoyo: false,
    });
  }, 150);

  const setInfinity = () => {
    setInputValue(-1);
    updateValue({
      repeat: -1,
      yoyo: false,
    });
  };

  const setShuffle = () => {
    const shuffleValue = Math.max(value.repeat ?? 0, 1);
    setInputValue(shuffleValue);
    updateValue({
      repeat: shuffleValue,
      yoyo: true,
    });
  };

  return (
    <div>
      <div className="w-full flex justify-between items-center">
        <WCFABLabel title={title} tooltipContent={tooltipContent} />

        <div className="flex items-center gap-2">
          <WCFABNumberInput
            property={property}
            value={inputValue}
            onValueChange={(value) => {
              setInputValue(value);
              handleInput(value);
            }}
          />
          {/* Infinity */}
          <Button onClick={setInfinity} className="wcf-ab-button-icon">
            <HugeiconsIcon icon={InfinityIcon} className="text-[#A1A1AA]" />
          </Button>

          {/* Shuffle */}
          <Button onClick={setShuffle} className="wcf-ab-button-icon">
            <HugeiconsIcon
              icon={ArrowDataTransferHorizontalIcon}
              className="text-[#A1A1AA]"
            />
          </Button>

          {/* delete button */}
          {isCustomAnim && <WCFABDeleteBtn onDelete={onDelete} />}
        </div>
      </div>
      {/* required message */}
      {isRequired && isDataValid && (
        <WCFABErrorMessage message={"This field is required"} />
      )}
    </div>
  );
};

export default RepeatField;
