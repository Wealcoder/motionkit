import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";

import { useMemo, useRef, useState } from "react";
import WCFABColorPicker from "@/components/animations/blocks/WCFABColorPicker";
import { generateUniqueId } from "@/utils/utils";
import { Select } from "@/components/ui/select";

const DEFAULT_GRADIENT = {
  type: "linear",
  angle: 90,
  stops: [
    {
      id: "s1",
      position: 0,
      color: {
        hex: "#2A7B9B",
        rgba: "rgba(42,123,155,1)",
        hsla: "",
      },
    },
    {
      id: "s2",
      position: 100,
      color: {
        hex: "#EDDD53",
        rgba: "rgba(237,221,83,1)",
        hsla: "",
      },
    },
  ],
  activeStopId: "s1",
};

function generateGradientCSS(gradient) {
  const stops = [...gradient.stops]
    .sort((a, b) => a.position - b.position)
    .map((s) => `${s.color.rgba} ${Math.round(s.position)}%`)
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

  console.log({ gradient });

  const barRef = useRef(null);

  const gradientCSS = useMemo(() => {
    const css = generateGradientCSS(gradient);
    onValueChange?.(css);
    return css;
  }, [gradient]);

  const activeStop = gradient.stops.find((s) => s.id === gradient.activeStopId);

  function handleBarClick(e) {
    const rect = barRef.current.getBoundingClientRect();
    const pos = ((e.clientX - rect.left) / rect.width) * 100;
    setGradient((g) => ({
      ...g,
      stops: [
        ...g.stops,
        {
          id: generateUniqueId(),
          position: Math.min(100, Math.max(0, pos)),
          color: g.stops[g.stops.length - 1].color,
        },
      ],
      activeStopId: g.stops[g.stops.length - 1].id,
    }));
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
        className="max-w-[250px] min-w-full space-y-3"
      >
        {/* TYPE SELECT */}

        <Select
          value={gradient.type}
          onChange={(e) => setGradient((g) => ({ ...g, type: e.target.value }))}
        >
          <option value="linear">Linear</option>
          <option value="radial">Radial</option>
          <option value="conic">Conic</option>
        </Select>

        {/* GRADIENT BAR */}
        <div
          ref={barRef}
          onClick={handleBarClick}
          className="relative h-6 rounded cursor-pointer"
          style={{ background: gradientCSS }}
        >
          {gradient.stops.map((stop) => (
            <div
              key={stop.id}
              onMouseDown={() =>
                setGradient((g) => ({
                  ...g,
                  activeStopId: stop.id,
                }))
              }
              onMouseMove={(e) =>
                gradient.activeStopId === stop.id &&
                e.buttons === 1 &&
                handleDrag(e, stop.id)
              }
              className="absolute top-1/2 w-3 h-3 rounded-full border bg-white cursor-ew-resize"
              style={{
                left: `${stop.position}%`,
                transform: "translate(-50%, -50%)",
              }}
            />
          ))}
        </div>

        {/* ACTIVE STOP CONTROLS */}
        {activeStop && (
          <>
            <div className="text-sm">
              Stop: {Math.round(activeStop.position)}%
            </div>

            <WCFABColorPicker
              value={activeStop.color.hex}
              onValueChange={(color) =>
                setGradient((g) => ({
                  ...g,
                  stops: g.stops.map((s) =>
                    s.id === g.activeStopId ? { ...s, color } : s,
                  ),
                }))
              }
            />
          </>
        )}
      </PopoverContent>
    </Popover>
  );
};

export default WCFABGradientPicker;
