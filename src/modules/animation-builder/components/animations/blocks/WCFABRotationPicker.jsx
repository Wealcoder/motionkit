import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { debounceFn } from "@/utils/utils";
import WCFABNumberInput from "@/components/animations/blocks/WCFABNumberInput";

const clamp = (n, min, max) => Math.min(max, Math.max(min, n));

const WCFABRotationPicker = ({
  size = "sm",
  value = 0,
  property = {},
  onValueChange = () => {},
}) => {
  const {
    min = 0,
    max = 360,
    placeholder = "Add Value",
    ...rest
  } = property || {};

  const [inputValue, setInputValue] = useState(value ?? 0);

  const handleInput = useCallback(
    debounceFn((rawValue) => {
      let currentValue = Number(rawValue);
      if (Number.isNaN(currentValue)) return;
      currentValue = clamp(currentValue, min, max);
      setInputValue(currentValue);
      onValueChange(currentValue);
    }, 150),
    [],
  );

  return (
    <div className="flex-1 flex justify-end items-center gap-2">
      <Popover>
        <PopoverTrigger className="!h-[21px] !w-[21px] p-0 m-0 hover:scale-105 bg-transparent border-none outline-none shadow-none focus-within:ring-0 cursor-pointer">
          <Knob />
        </PopoverTrigger>
        <PopoverContent className="w-max p-0 bg-transparent">
          <Wheeler
            min={min}
            max={max}
            value={inputValue}
            onChange={handleInput}
          />
        </PopoverContent>
      </Popover>

      <WCFABNumberInput
        size={size}
        type="number"
        placeholder={placeholder}
        value={inputValue}
        onValueChange={(value) => {
          console.log(value);
          handleInput(value);
        }}
        min={min}
        max={max}
      />
    </div>
  );
};
export default WCFABRotationPicker;

const Wheeler = ({ min, max, value, size = 70, onChange = () => {} }) => {
  const wheelRef = useRef(null);
  const isPointerDownRef = useRef(false);

  const valueToAngle = useCallback(
    (v) => ((clamp(v, min, max) - min) / (max - min)) * 360,
    [min, max],
  );

  const angleToValue = useCallback(
    (a) => min + (a / 360) * (max - min),
    [min, max],
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
    [angleToValue, onChange],
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
    [updateFromPointer],
  );

  const onPointerMove = useCallback(
    (e) => {
      if (!isPointerDownRef.current) return;
      e.preventDefault();
      updateFromPointer(e.clientX, e.clientY);
    },
    [updateFromPointer],
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

const Knob = () => (
  <svg
    width="21"
    height="21"
    viewBox="0 0 21 21"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="group cursor-pointer"
  >
    <path d="M0 11.1152H1.23047V12.3457H0V11.1152Z" fill="#A1A1AA" />
    <path d="M19.7695 11.1152H21V12.3457H19.7695V11.1152Z" fill="#A1A1AA" />
    <path
      d="M4.73828 2.97949L5.80404 2.36416L6.41938 3.42992L5.35362 4.04526L4.73828 2.97949Z"
      fill="#A1A1AA"
    />
    <path
      d="M14.623 3.43213L15.2384 2.36637L16.3041 2.9817L15.6888 4.04747L14.623 3.43213Z"
      fill="#A1A1AA"
    />
    <path
      d="M18.2246 6.58154L19.2904 5.96621L19.9057 7.03197L18.8399 7.64731L18.2246 6.58154Z"
      fill="#A1A1AA"
    />
    <path
      d="M1.0957 16.4258L2.16147 15.8104L2.7768 16.8762L1.71104 17.4915L1.0957 16.4258Z"
      fill="#A1A1AA"
    />
    <path
      d="M18.2266 16.8799L18.8419 15.8141L19.9077 16.4295L19.2923 17.4952L18.2266 16.8799Z"
      fill="#A1A1AA"
    />
    <path
      d="M1.09375 7.03467L1.70909 5.9689L2.77485 6.58424L2.15951 7.65L1.09375 7.03467Z"
      fill="#A1A1AA"
    />
    <path
      d="M9.88477 1.27148H11.1152V2.50195H9.88477V1.27148Z"
      fill="#A1A1AA"
    />

    {/* rotating path */}
    <path
      d="M10.5 3.73242C6.09 3.73242 2.46094 7.32047 2.46094 11.7305C2.46094 16.1405 6.09 19.7285 10.5 19.7285C14.91 19.7285 18.5391 16.1405 18.5391 11.7305C18.5391 7.32047 14.91 3.73242 10.5 3.73242ZM10.5 12.6005L6.58448 8.68494L7.45447 7.81495L11.37 11.7305L10.5 12.6005Z"
      fill="#A1A1AA"
      className="
        origin-center
        transition-transform
        duration-700
        ease-out
        group-hover:rotate-360
      "
    />
  </svg>
);
