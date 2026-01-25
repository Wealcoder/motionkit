import React, { useState } from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

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

export default function TestRadioGrid() {
  const [val, setVal] = useState("50% 50%");

  return (
    <div className="p-6">
      <div className="mb-3 text-white text-sm">Selected: {val}</div>

      <RadioGroup
        value={val}
        onValueChange={(v) => {
          console.log("radio changed:", v);
          setVal(v);
        }}
        className="grid grid-cols-3 gap-3 p-3 bg-[#18181B] rounded-md w-fit"
      >
        {GRID.map((item) => {
          const v = `${item.x} ${item.y}`;

          return (
            <label
              key={item.id}
              className="
                w-10 h-10
                rounded-md
                bg-[#27272A]
                hover:bg-[#303033]
                flex items-center justify-center
                cursor-pointer
              "
            >
              <RadioGroupItem
                value={v}
                className="
                  w-3 h-3 rounded-full
                  border border-[#A1A1AA]
                  data-[state=checked]:border-[#3B82F6]
                  data-[state=checked]:bg-[#3B82F6]
                "
              />
            </label>
          );
        })}
      </RadioGroup>
    </div>
  );
}
