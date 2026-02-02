import { useRef, useState, useMemo } from "react";
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { HugeiconsIcon } from "@hugeicons/react";
import { KeyframesMultipleIcon } from "@hugeicons/core-free-icons";

const ANIMATION_GROUPS = [
  {
    group: "Container",
    animations: [
      { id: "fade", name: "Fade Animation" },
      { id: "rotate", name: "Rotate Animation" },
    ],
  },
  {
    group: "Container",
    animations: [
      { id: "scale", name: "Scale Animation" },
      { id: "stroke", name: "Stroke Animation" },
      { id: "radius", name: "Radius Animation" },
      { id: "padding", name: "Padding Animation" },
    ],
  },
];

const Structure = () => {
  const ref = useRef(null);

  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [search, setSearch] = useState("");

  const start = useRef({ x: 0, y: 0 });

  const onMouseDown = (e) => {
    setDragging(true);
    start.current = {
      x: e.clientX - pos.x,
      y: e.clientY - pos.y,
    };
  };

  const onMouseMove = (e) => {
    if (!dragging) return;
    setPos({
      x: e.clientX - start.current.x,
      y: e.clientY - start.current.y,
    });
  };

  const onMouseUp = () => setDragging(false);

  // 🔍 Search logic
  const filteredGroups = useMemo(() => {
    if (!search) return ANIMATION_GROUPS;

    const query = search.toLowerCase();

    return ANIMATION_GROUPS.map((group) => ({
      ...group,
      animations: group.animations.filter((anim) =>
        anim.name.toLowerCase().includes(query),
      ),
    })).filter((group) => group.animations.length > 0);
  }, [search]);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button className="wcf-ab-button-icon">
          <HugeiconsIcon
            icon={KeyframesMultipleIcon}
            size={16}
            strokeWidth={1.7}
          />
        </Button>
      </PopoverTrigger>

      {/* structure wrapper */}
      <PopoverContent
        ref={ref}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        className="w-[330px] max-h-[390px] px-[15px] gap-[31px] bg-background-topbar rounded-5"
        style={{
          transform: `translate(${pos.x}px, ${pos.y}px)`,
        }}
      >
        <PopoverHeader>
          <PopoverTitle>Title</PopoverTitle>
          <PopoverDescription>Description text here.</PopoverDescription>
        </PopoverHeader>
        {/* Search */}
        <Input
          placeholder="Search animation or page"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="mb-3"
        />

        {/* Animation List */}
        <div className="space-y-4 text-sm">
          {filteredGroups.map((group, i) => (
            <div key={i}>
              <div className="text-muted-foreground text-xs mb-2">
                {group.group}
              </div>

              <ul className="space-y-1 pl-3 border-l border-border">
                {group.animations.map((anim) => (
                  <li
                    key={anim.id}
                    className="cursor-pointer hover:text-primary transition"
                  >
                    {anim.name}
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {filteredGroups.length === 0 && (
            <div className="text-xs text-muted-foreground text-center">
              No animations found
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default Structure;
