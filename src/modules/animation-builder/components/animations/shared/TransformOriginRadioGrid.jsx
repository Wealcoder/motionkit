import React from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { parseCssValue } from "@/utils/trnasformOriginHelper";
import { cn } from "@/lib/utils";
const GRID = [
  { id: "tl", x: "0%", y: "0%" },
  { id: "tc", x: "50%", y: "0%" },
  { id: "tr", x: "100%", y: "0%" },
  { id: "cl", x: "0%", y: "50%" },
  { id: "cc", x: "50%", y: "50%" },
  { id: "cr", x: "100%", y: "50%" },
  { id: "bl", x: "0%", y: "100%" },
  { id: "bc", x: "50%", y: "100%" },
  { id: "br", x: "100%", y: "100%" },
];

const SNAP_POINTS = [0, 50, 100];

const nearestSnap = (val) => {
  let nearest = SNAP_POINTS[0];
  let minDiff = Math.abs(val - nearest);

  for (const p of SNAP_POINTS) {
    const diff = Math.abs(val - p);
    if (diff < minDiff) {
      minDiff = diff;
      nearest = p;
    }
  }
  return nearest;
};

const resolveGridValue = (cssValue) => {
  if (!cssValue) return "50% 50%";

  const [xRaw, yRaw] = cssValue.split(" ");

  const x = parseCssValue(xRaw).value;
  const y = parseCssValue(yRaw).value;

  const snappedX = nearestSnap(x);
  const snappedY = nearestSnap(y);

  return `${snappedX}% ${snappedY}%`;
};

const TransformOriginGrid = ({ value, onChange }) => {
  const activeGridValue = resolveGridValue(value);

  return (
    <RadioGroup
      value={activeGridValue}
      onValueChange={onChange}
      className="w-[108px] h-[108px] grid grid-cols-3 items-center justify-center gap-8 bg-[#18181B] p-3 rounded-md"
    >
      {GRID.map((item) => {
        const cssValue = `${item.x} ${item.y}`;

        return (
          <RadioGroupItem
            key={item.id}
            value={cssValue}
            className={cn(
              "border-none h-1.5 w-1.5 rounded-full !p-0 bg-[#A1A1AA] data-[state=checked]:scale-150 data-[state=checked]:bg-[#2C76E6] [&_svg]:hidden focus-visible:ring-0"
            )}
          />
        );
      })}
    </RadioGroup>
  );
};

export default TransformOriginGrid;
