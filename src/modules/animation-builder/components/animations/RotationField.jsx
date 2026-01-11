import React, { useCallback, useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import Wheeler from "./Wheeler";
import { debounceFn } from "@/utils/utils";
import ToolTipWrapper from "../common/ToolTipWrapper";
import DeleteBtn from "./shared/DeleteBtn";

const RotationField = ({
  label = "Rotate",
  tooltipContent = "Adjust Rotate Value",
  value = 0,
  config = { min: 0, max: 360 },
  isRequired = false,
  onUpdateValue = () => {},
  isValid = () => {},
  onDisabledUpdate = () => {},
  onDelete,
  isCustomAnim = true,
}) => {
  const [inputValue, setInputValue] = useState(value ?? 0);

  const clamp = (num, min, max) => Math.min(max, Math.max(min, num));

  const handleRotationValue = (rawValue) => {
    let currentValue = Number(rawValue);
    if (Number.isNaN(currentValue)) return;

    currentValue = clamp(currentValue, config.min, config.max);
    setInputValue(currentValue);
    onUpdateValue(currentValue);
  };

  // input handler
  const handleInput = debounceFn((value) => {
    handleRotationValue(value);
  }, 150);

  return (
    <div className="p-2">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        {/* label */}
        <div className="flex items-center gap-3 text-[#E4E4E7]">
          <h2 className="text-white text-sm">{label}</h2>
          {tooltipContent && <ToolTipWrapper text={tooltipContent} />}
        </div>

        {/* controls */}
        <div className="flex items-center gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <div className="relative flex items-center justify-center rounded-full bg-[#A1A1AA] shadow-sm w-5 h-5">
                <div className="absolute top-1 h-2 w-0.5 rounded bg-primary" />
              </div>
            </PopoverTrigger>
            <PopoverContent>
              <Wheeler
                min={config?.min}
                max={config?.max}
                value={inputValue}
                onChange={handleInput}
              />
            </PopoverContent>
          </Popover>

          <Input
            type="number"
            value={inputValue}
            min={config?.min}
            max={config?.max}
            className="w-28"
            onChange={(e) => handleInput(e.target.value)}
          />

          <div>{isCustomAnim && <DeleteBtn onDelete={onDelete} />}</div>
        </div>
      </div>

      {isRequired && <p className="text-white text-sm">Field is Required</p>}
    </div>
  );
};

export default RotationField;

const clamp = (n, min, max) => Math.min(max, Math.max(min, n));

const Wheeler = ({ min, max, value, size = 70, onChange = () => {} }) => {
  const wheelRef = useRef(null);
  const isPointerDownRef = useRef(false);

  const valueToAngle = useCallback(
    (v) => ((clamp(v, min, max) - min) / (max - min)) * 360,
    [min, max]
  );

  const angleToValue = useCallback(
    (a) => min + (a / 360) * (max - min),
    [min, max]
  );

  const [angle, setAngle] = useState(() => valueToAngle(value));

  // Keep wheel in sync when parent value changes
  useEffect(() => {
    setAngle(valueToAngle(value));
  }, [value, valueToAngle]);

  // Core: pointer position -> angle -> value
  const updateFromPointer = useCallback(
    (clientX, clientY) => {
      const el = wheelRef.current;
      if (!el) return;

      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;

      const rad = Math.atan2(clientY - cy, clientX - cx);
      const deg = (rad * 180) / Math.PI;

      // Normalize to 0..360
      const normalized = (deg + 360) % 360;

      setAngle(normalized);

      const nextValue = angleToValue(normalized);
      onChange(Math.round(nextValue));
    },
    [angleToValue, onChange]
  );

  const onPointerDown = useCallback(
    (e) => {
      // capture pointer so we keep receiving move events even if pointer leaves the wheel
      e.preventDefault();
      isPointerDownRef.current = true;
      wheelRef.current?.setPointerCapture?.(e.pointerId);

      // IMPORTANT: update immediately on click
      updateFromPointer(e.clientX, e.clientY);
    },
    [updateFromPointer]
  );

  const onPointerMove = useCallback(
    (e) => {
      if (!isPointerDownRef.current) return;
      e.preventDefault();
      updateFromPointer(e.clientX, e.clientY);
    },
    [updateFromPointer]
  );

  const onPointerUp = useCallback((e) => {
    e.preventDefault();
    isPointerDownRef.current = false;
    wheelRef.current?.releasePointerCapture?.(e.pointerId);
  }, []);

  return (
    <div
      ref={wheelRef}
      className="relative flex items-center justify-center rounded-full select-none"
      style={{
        width: size,
        height: size,
        touchAction: "none",
      }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
    >
      {/* Outer ring */}
      <div className="absolute inset-0 rounded-full bg-[#757579] shadow-inner" />

      {/* Inner face */}
      <div className="absolute inset-2.5 rounded-full bg-[#444447]" />

      {/* Needle */}
      <div
        className="absolute left-1/2 top-1/2 h-[32%] w-1 bg-gray-500 cursor-pointer"
        style={{
          transform: `translate(-50%, 0) rotate(${angle - 90}deg)`,
          transformOrigin: "center 0%",
        }}
      />

      {/* Center pivot */}
      <div className="absolute left-1/2 top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gray-500" />
    </div>
  );
};
