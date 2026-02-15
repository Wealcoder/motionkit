import { useEffect, useMemo, useRef, useState } from "react";
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

const btnStyle =
  "!h-[28px] !w-[28px] px-3 py-3 bg-background-topbar hover:bg-button-hover focus:bg-button-action active:bg-button-action !text-foreground-secondary hover:!text-foreground focus:!text-foreground active:!text-foreground text-button-icon-size border-none outline-none focus-within:ring-0 rounded-5 cursor-pointer";

/* FIXED: color normalizers */
function rgbaToHex(rgba) {
  const m = rgba.match(
    /rgba?\(\s*(\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\s*\)/,
  );
  if (!m) return "#000000FF";

  const r = Number(m[1]).toString(16).padStart(2, "0");
  const g = Number(m[2]).toString(16).padStart(2, "0");
  const b = Number(m[3]).toString(16).padStart(2, "0");
  const a = Math.round(Number(m[4] ?? 1) * 255)
    .toString(16)
    .padStart(2, "0");

  return `#${r}${g}${b}${a}`.toUpperCase();
}

// ALWAYS return #RRGGBBAA
function normalizeHex(color) {
  if (!color) return "#000000FF";

  if (typeof color === "string") {
    if (color.startsWith("#")) {
      const hex = color.toUpperCase();

      // #RGB not supported in UI — fallback
      if (hex.length === 4) return "#000000FF";

      // #RRGGBB -> #RRGGBBFF
      if (hex.length === 7) return `${hex}FF`;

      // #RRGGBBAA (keep only 8 digits)
      if (hex.length >= 9) return hex.slice(0, 9);

      return "#000000FF";
    }

    if (color.startsWith("rgb")) {
      return rgbaToHex(color);
    }
  }

  if (typeof color === "object" && color.hex) {
    const hex = String(color.hex).toUpperCase();
    if (hex.length === 7) return `${hex}FF`;
    if (hex.length >= 9) return hex.slice(0, 9);
    return "#000000FF";
  }

  return "#000000FF";
}

/* FIXED: hex -> rgba includes alpha  */
function hex8ToRgba(hex8) {
  const safe = normalizeHex(hex8); // #RRGGBBAA
  const r = parseInt(safe.slice(1, 3), 16);
  const g = parseInt(safe.slice(3, 5), 16);
  const b = parseInt(safe.slice(5, 7), 16);
  const a = parseInt(safe.slice(7, 9), 16) / 255;

  // keep nice decimals
  const alpha = Math.round(a * 100) / 100;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/* gradient parser */
function parseGradientCSS(input) {
  if (!input || typeof input !== "string") return null;

  const match = input.match(/^(linear|radial|conic)-gradient\s*\((.+)\)$/i);
  if (!match) return null;

  const [, typeRaw, body] = match;
  const type = typeRaw.toLowerCase();

  // split commas but ignore commas inside rgba(...)
  const parts = body.split(/,(?![^(]*\))/).map((p) => p.trim());

  let angle = 90;
  let startIndex = 0;

  if (type === "linear") {
    if (parts[0].includes("deg")) {
      angle = parseFloat(parts[0]);
      startIndex = 1;
    }
  } else if (type === "conic") {
    const fromMatch = parts[0].match(/from\s+([\d.]+)deg/i);
    if (fromMatch) {
      angle = Number(fromMatch[1]);
      startIndex = 1;
    }
  } else {
    startIndex = 0;
  }

  const stops = parts
    .slice(startIndex)
    .map((stop) => {
      const m = stop.match(/(rgba?\([^)]+\)|#[0-9a-fA-F]{6,8})\s+([\d.]+)%/);
      if (!m) return null;

      return {
        id: generateUniqueId(),
        color: normalizeHex(m[1]),
        position: Number(m[2]),
      };
    })
    .filter(Boolean);

  if (stops.length < 2) return null;

  return {
    type,
    angle,
    stops,
    activeStopId: stops[0].id,
  };
}

const gradienttype = [
  { title: "Linear", value: "linear" },
  { title: "Radial", value: "radial" },
  { title: "Conic", value: "conic" },
];

const DEFAULT_GRADIENT = {
  type: "linear",
  angle: 90,
  stops: [
    { id: "s1", position: 0, color: "#2A7B9BFF" },
    { id: "s2", position: 100, color: "#EDDD53FF" },
  ],
  activeStopId: "s1",
};

function generateGradientCSS(gradient) {
  const stops = [...gradient.stops]
    .sort((a, b) => a.position - b.position)
    .map((s) => `${hex8ToRgba(s.color)} ${Math.round(s.position)}%`)
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
  return `linear-gradient(90deg, ${stops})`;
}

const WCFABGradientPicker = ({
  property = {},
  value = "",
  onValueChange = () => {},
}) => {
  const { size = "sm" } = property || {};

  const [gradient, setGradient] = useState(DEFAULT_GRADIENT);
  const [inputValue, setInputValue] = useState(value ?? "");
  const [isEditing, setIsEditing] = useState(false);

  const barRef = useRef(null);
  const isDraggingRef = useRef(false);
  const draggingStopIdRef = useRef(null);
  const rafRef = useRef(null);

  // derived css from picker state
  const gradientCSS = useMemo(() => generateGradientCSS(gradient), [gradient]);

  // sync external value -> picker + input
  useEffect(() => {
    if (!value) return;

    setInputValue(value);

    const parsed = parseGradientCSS(value);
    if (parsed) setGradient(parsed);
  }, [value]);

  // picker -> parent (and keep input synced unless user is typing)
  useEffect(() => {
    if (!isEditing) {
      setInputValue(gradientCSS);
    }
    onValueChange(gradientCSS);
  }, [gradientCSS]);

  // handler to control gradient bar smooth dragging
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!draggingStopIdRef.current || !barRef.current) return;

      if (rafRef.current) cancelAnimationFrame(rafRef.current);

      rafRef.current = requestAnimationFrame(() => {
        const rect = barRef.current.getBoundingClientRect();
        const pos = ((e.clientX - rect.left) / rect.width) * 100;

        setGradient((g) => ({
          ...g,
          stops: g.stops.map((s) =>
            s.id === draggingStopIdRef.current
              ? { ...s, position: Math.min(100, Math.max(0, pos)) }
              : s,
          ),
        }));
      });
    };

    const handleMouseUp = () => {
      draggingStopIdRef.current = null;

      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);

  // gradient bar click to add stop handler
  function handleBarClick(e) {
    if (isDraggingRef.current) return;
    if (e.target.dataset.stop === "true") return;

    const rect = barRef.current.getBoundingClientRect();
    const pos = ((e.clientX - rect.left) / rect.width) * 100;

    setGradient((g) => {
      const newStop = {
        id: generateUniqueId(),
        position: Math.min(100, Math.max(0, pos)),
        color: normalizeHex(g.stops[g.stops.length - 1].color),
      };

      return {
        ...g,
        stops: [...g.stops, newStop],
        activeStopId: newStop.id,
      };
    });
  }

  //gradient bar drag handler
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

  // add stop button click handler
  const addStop = () => {
    setGradient((g) => {
      const last = g.stops[g.stops.length - 1];

      const newStop = {
        id: generateUniqueId(),
        position: Math.min(100, (last?.position ?? 0) + 10),
        color: normalizeHex(last?.color),
      };

      return {
        ...g,
        stops: [...g.stops, newStop],
        activeStopId: newStop.id,
      };
    });
  };

  const updateStopPosition = (id, value) => {
    setGradient((g) => ({
      ...g,
      stops: g.stops.map((s) =>
        s.id === id ? { ...s, position: Math.min(100, Math.max(0, value)) } : s,
      ),
    }));
  };

  const updateStopColor = (id, color) => {
    setGradient((g) => ({
      ...g,
      stops: g.stops.map((s) =>
        s.id === id ? { ...s, color: normalizeHex(color) } : s,
      ),
    }));
  };

  const removeStop = (id) => {
    setGradient((g) => {
      if (g.stops.length <= 2) return g;

      const filtered = g.stops.filter((s) => s.id !== id);

      return {
        ...g,
        stops: filtered,
        activeStopId: g.activeStopId === id ? filtered[0]?.id : g.activeStopId,
      };
    });
  };

  // manual input: only commit on blur (avoids loops + keeps alpha correct)
  const commitManualInput = () => {
    setIsEditing(false);

    const parsed = parseGradientCSS(inputValue);
    if (!parsed) {
      // invalid input -> revert to current picker css
      setInputValue(gradientCSS);
      return;
    }
    setGradient(parsed);
  };

  return (
    <div className="flex justify-center items-center gap-1.5">
      <Popover>
        <PopoverTrigger asChild>
          <button
            className="h-[21px] w-[21px] p-0 m-0 hover:scale-105 rounded-full border-2 border-solid border-button cursor-pointer"
            style={{ background: gradientCSS }}
          />
        </PopoverTrigger>

        <PopoverContent
          align="end"
          className="max-w-[260px] p-2 min-w-full rounded-5 space-y-3"
        >
          {/* TYPE SELECT */}
          <Select
            value={gradient.type}
            onValueChange={(value) =>
              setGradient((g) => ({ ...g, type: value }))
            }
          >
            <SelectTrigger className="h-7 px-[10px] w-[120px] max-w-[120px] !bg-select-hover text-foreground !text-xss font-medium leading-18 border-none outline-none !rounded-5 cursor-pointer">
              <SelectValue placeholder="Linear" />
            </SelectTrigger>
            <SelectContent className="z-50 min-w-0  max-h-[140px] p-[3px] bg-select-secondary text-foreground rounded-5 border-none shadow-md overflow-hidden w-[--radix-select-trigger-width] max-w-full">
              <SelectGroup>
                <SelectLabel>Select One</SelectLabel>
                {gradienttype?.map((type) => (
                  <SelectItem
                    key={type.value}
                    value={type.value}
                    className="relative flex items-center w-full rounded-5 px-2 py-[2px] cursor-pointer outline-none transition-colors hover:bg-select-hover data-[highlighted]:bg-select-hover data-[state=checked]:bg-select-hover text-xss"
                  >
                    {type.title}
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
              className="relative h-1.5 rounded-5 cursor-pointer"
              style={{ background: gradientCSS }}
            >
              {gradient.stops.map((stop) => (
                <div
                  key={stop.id}
                  data-stop="true"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();

                    draggingStopIdRef.current = stop.id;

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
              <Button className={btnStyle} onClick={addStop} type="button">
                <HugeiconsIcon icon={Add01Icon} />
              </Button>
            </div>

            <div className="flex flex-col gap-2 max-h-52 overflow-y-auto scrollbar-none">
              {gradient.stops.map((data) => (
                <div
                  key={data.id}
                  onClick={() =>
                    setGradient((g) => ({ ...g, activeStopId: data.id }))
                  }
                  className={cn("grid grid-cols-[auto_1fr_auto] gap-2")}
                >
                  <WCFABNumberInput
                    property={{ min: 0, max: 100, size: "gradient" }}
                    value={Math.floor(data.position) ?? 0}
                    onValueChange={(value) =>
                      updateStopPosition(data.id, Number(value))
                    }
                  />

                  <WCFABColorPicker
                    property={{ size: "gradient" }}
                    value={data.color} // <-- now includes alpha (#RRGGBBAA)
                    onValueChange={(color) => updateStopColor(data.id, color)}
                  />

                  <Button
                    className={cn(btnStyle, "justify-self-end")}
                    onClick={() => removeStop(data.id)}
                    type="button"
                  >
                    <HugeiconsIcon icon={MinusSignIcon} />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </PopoverContent>
      </Popover>

      <Input
        value={inputValue}
        onFocus={() => setIsEditing(true)}
        onChange={(e) => setInputValue(e.target.value)}
        onBlur={commitManualInput}
        className={cn(inputVariants({ size }))}
        placeholder="linear-gradient(...)"
      />
    </div>
  );
};

export default WCFABGradientPicker;
