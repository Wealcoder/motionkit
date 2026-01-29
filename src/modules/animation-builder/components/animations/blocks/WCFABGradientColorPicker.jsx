import { useMemo, useRef, useState } from "react";

import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/selectDC";

import WCFABColorPicker from "@/components/animations/blocks/WCFABColorPicker";

import { generateUniqueId } from "@/utils/utils";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import { Add01Icon, MinusSignIcon } from "@hugeicons/core-free-icons/index";
import { Input } from "@/components/ui/input";
import { inputVariants } from "@/components/animations/blocks/shared/style";
import WCFABNumberInput from "./WCFABNumberInput";

const gradienttype = [
  { title: "Linear", value: "linear" },
  { title: "Radial", value: "radial" },
  { title: "Conic", value: "conic" },
];

const DEFAULT_GRADIENT = {
  type: "linear",
  angle: 90,
  stops: [
    {
      id: "s1",
      position: 0,
      color: "#2A7B9BFF",
    },
    {
      id: "s2",
      position: 100,
      color: "#EDDD53FF",
    },
  ],

  activeStopId: "s1",
};

const btnStyle =
  "!h-[28px] !w-[28px] px-3 py-3 bg-background-topbar hover:bg-button-hover focus:bg-button-action active:bg-button-action !text-foreground-secondary  hover:!text-foreground focus:!text-foreground active:!text-foreground text-button-icon-size border-none outline-none focus-within:ring-0 rounded-5 cursor-pointer";

function hexToRgba(hex, alpha = 1) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function generateGradientCSS(gradient) {
  const stops = [...gradient.stops]
    .sort((a, b) => a.position - b.position)
    .map((s) => `${hexToRgba(s.color)} ${Math.round(s.position)}%`)
    .join(", ");

  if (gradient.type === "linear") {
    return `linear-gradient(${gradient.angle}deg, ${stops})`;
  }

  if (gradient.type === "radial") {
    return `radial-gradient(circle, ${stops})`;
  }

  if (gradient.type === "conic") {
    return `conic-gradient(from ${gradient.angle}deg, ${stops})`;
  }
}

const WCFABGradientPicker = ({
  property = {},
  value = "",
  onValueChange = () => {},
}) => {
  const [gradient, setGradient] = useState(DEFAULT_GRADIENT);

  // console.log({ gradient });

  const barRef = useRef(null);
  const isDraggingRef = useRef(false);

  const gradientCSS = useMemo(() => {
    const css = generateGradientCSS(gradient);
    onValueChange?.(css);
    return css;
  }, [gradient]);

  const activeStop = gradient.stops.find((s) => s.id === gradient.activeStopId);

  function handleBarClick(e) {
    if (isDraggingRef.current) return;
    if (e.target.dataset.stop === "true") return;

    const rect = barRef.current.getBoundingClientRect();
    const pos = ((e.clientX - rect.left) / rect.width) * 100;

    setGradient((g) => {
      const newStop = {
        id: generateUniqueId(),
        position: Math.min(100, Math.max(0, pos)),
        color: g.stops[g.stops.length - 1].color,
      };

      return {
        ...g,
        stops: [...g.stops, newStop],
        activeStopId: newStop.id,
      };
    });
  }

  function handleDrag(e, id) {
    const rect = barRef.current.getBoundingClientRect();
    const pos = ((e.clientX - rect.left) / rect.width) * 100;

    setGradient((g) => ({
      ...g,
      stops: g.stops.map((s) =>
        s.id === id ? { ...s, position: Math.min(100, Math.max(0, pos)) } : s,
      ),
    }));
  }

  // ADD NEW STOP
  const addStop = () => {
    setGradient((g) => {
      const last = g.stops[g.stops.length - 1];

      const newStop = {
        id: generateUniqueId(),
        position: Math.min(100, (last?.position ?? 0) + 10),
        color: last?.color ?? {
          hex: "#ffffff",
          rgba: "rgba(255,255,255,1)",
          hsla: "",
        },
      };

      return {
        ...g,
        stops: [...g.stops, newStop],
        activeStopId: newStop.id,
      };
    });
  };

  // UPDATE STOP POSITION
  const updateStopPosition = (id, value) => {
    setGradient((g) => ({
      ...g,
      stops: g.stops.map((s) =>
        s.id === id ? { ...s, position: Math.min(100, Math.max(0, value)) } : s,
      ),
    }));
  };

  // UPDATE STOP COLOR
  const updateStopColor = (id, hex) => {
    setGradient((g) => ({
      ...g,
      stops: g.stops.map((s) => (s.id === id ? { ...s, color: hex } : s)),
    }));
  };

  // REMOVE STOP
  const removeStop = (id) => {
    setGradient((g) => {
      if (g.stops.length <= 2) return g; // keep minimum 2

      const filtered = g.stops.filter((s) => s.id !== id);

      return {
        ...g,
        stops: filtered,
        activeStopId: g.activeStopId === id ? filtered[0]?.id : g.activeStopId,
      };
    });
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          className="w-9 h-9 rounded border"
          style={{ background: gradientCSS }}
        />
      </PopoverTrigger>

      <PopoverContent
        align="end"
        className="max-w-[260px] p-2 min-w-full rounded-5 space-y-3"
      >
        {/* TYPE SELECT */}
        <Select
          onValueChange={(value) => setGradient((g) => ({ ...g, type: value }))}
        >
          <SelectTrigger className="h-7 px-[10px] w-[120px] max-w-[120px] !bg-select-hover text-foreground !text-xss font-medium leading-18 border-none outline-none !rounded-5 cursor-pointer">
            <SelectValue placeholder="Linear" />
          </SelectTrigger>
          <SelectContent className="z-50 min-w-0  max-h-[140px] p-[3px] bg-select-secondary text-foreground rounded-5 border-none shadow-md overflow-hidden w-[--radix-select-trigger-width] max-w-full">
            <SelectGroup>
              <SelectLabel>Select One</SelectLabel>
              {gradienttype?.map((type) => (
                <SelectItem
                  value={type?.value}
                  className="relative flex items-center w-full rounded-5 px-2 py-[2px] cursor-pointer outline-none transition-colors hover:bg-select-hover data-[highlighted]:bg-select-hover data-[state=checked]:bg-select-hover text-xss"
                >
                  {type?.title}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>

        {/* GRADIENT BAR */}
        <div className="p-2">
          <div
            ref={barRef}
            onClick={handleBarClick}
            className="relative h-1.5 rounded-5 cursor-pointer "
            style={{ background: gradientCSS }}
          >
            {gradient.stops.map((stop) => (
              <div
                key={stop.id}
                data-stop="true"
                onMouseDown={(e) => {
                  e.stopPropagation();
                  isDraggingRef.current = true;

                  setGradient((g) => ({
                    ...g,
                    activeStopId: stop.id,
                  }));
                }}
                onMouseMove={(e) =>
                  gradient.activeStopId === stop.id &&
                  e.buttons === 1 &&
                  handleDrag(e, stop.id)
                }
                onMouseUp={() => {
                  isDraggingRef.current = false;
                }}
                className={cn(
                  "absolute top-1/2 h-2.5 w-2.5 rounded-full border border-white cursor-ew-resize",
                  gradient.activeStopId === stop.id
                    ? "ring-2 ring-white"
                    : "ring-2 ring-black",
                )}
                style={{
                  left: `${stop.position}%`,
                  transform: "translate(-50%, -50%)",
                  background: stop.color,
                }}
              />
            ))}
          </div>
        </div>

        {/* ACTIVE STOP CONTROLS */}
        <div>
          <div className="flex justify-between items-center">
            <p className="text-foreground text-sm font-inter font-semibold leading-5 tracking-normal">
              Stops
            </p>
            <Button className={btnStyle} onClick={addStop}>
              <HugeiconsIcon icon={Add01Icon} />
            </Button>
          </div>

          <div className="flex flex-col gap-2 max-h-52 overflow-y-auto overflow-x- scrollbar-none">
            {gradient?.stops?.map((data) => {
              return (
                <div
                  onClick={() =>
                    setGradient((g) => ({ ...g, activeStopId: data.id }))
                  }
                  className={cn(
                    "grid grid-cols-[auto_1fr_auto] gap-2 justify-between",
                  )}
                >
                  <WCFABNumberInput
                    property={{
                      min: 0,
                      max: 100,
                      size: "gradient",
                    }}
                    value={Math.floor(data.position) ?? 0}
                    onValueChange={(value) =>
                      updateStopPosition(data.id, Number(value))
                    }
                  />

                  <WCFABColorPicker
                    property={{ size: "gradient" }}
                    value={data?.color?.hex}
                    onValueChange={(color) => updateStopColor(data.id, color)}
                  />

                  <Button
                    className={cn(btnStyle, "justify-self-end")}
                    onClick={() => removeStop(data.id)}
                  >
                    <HugeiconsIcon icon={MinusSignIcon} />
                  </Button>
                </div>
              );
            })}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default WCFABGradientPicker;
