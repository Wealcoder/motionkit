import React, { useMemo, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import ToolTipWrapper from "@/components/common/ToolTipWrapper";
import { Search01Icon } from "@hugeicons/core-free-icons/index";
import {
  Popover,
  PopoverContent,
  PopoverAnchor,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import { AddCircleIcon } from "@hugeicons/core-free-icons";
import animationProperties from "@/config/animationProperties";

const AddPropertyPopover = ({ selectedKeys = [], onSelect, title }) => {
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const anchorRef = useRef(null);


  const hasProperty = selectedKeys.length > 0;

  // popover buttons click handler
  const openAt = (e) => {
    anchorRef.current = e.currentTarget;
    setOpen(true);
  };

  // property map handlers
  const filteredGroups = useMemo(() => {
    const q = search.toLowerCase();

    return animationProperties
      .map((group) => {
        const items = group.items.filter(
          (item) =>
            !selectedKeys.includes(item.key) &&
            (item.title.toLowerCase().includes(q) ||
              item.key.toLowerCase().includes(q)),
        );
        return { ...group, items };
      })
      .filter((group) => group.items.length > 0);
  }, [search, selectedKeys]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <div className="flex flex-col gap-2 relative">
        {/* Row 1: Title + plus icon */}
        <div className="h-5 flex items-center justify-between">
          <h1 className="wcf-ab-title !text-[#E4E4E7] m-0">{title}</h1>

          <Button
            className="bg-transparent border-none text-[#FAFAFA] cursor-pointer"
            onClick={openAt}
          >
            <HugeiconsIcon icon={AddCircleIcon} className="w-3 h-3" />
          </Button>
        </div>

        {/* Row 2: Add button */}
        {!hasProperty && (
          <Button
            className="bg-[#303033] h-7 rounded-md flex gap-2 border-none text-[#FAFAFA] cursor-pointer"
            onClick={openAt}
          >
            <HugeiconsIcon icon={AddCircleIcon} className="w-3 h-3" />
            Add
          </Button>
        )}

        {/* single anchor */}
        <PopoverAnchor
          virtualRef={anchorRef}
          className="absolute top-0 right-0 h-0 w-0"
        />

        {/* Popover content */}
        <PopoverContent
          align="end"
          className="w-[260px] p-2 bg-button"
        >
          {/* Search */}
          <div className="flex items-center bg-background-topbar mb-2 h-7 rounded-md px-[7px] py-[5px]">
            <HugeiconsIcon
              icon={Search01Icon}
              className="text-[#E4E4E7] w-3.5 h-3.5"
            />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search property"
              className="h-7 bg-transparent p-0 pl-1 text-[11.5px] border-none text-[#FAFAFA]"
            />
          </div>

          {/* property list */}
          <div className="max-h-80 overflow-y-auto flex flex-col gap-2.5">
            {filteredGroups.length === 0 && (
              <div className="text-[11px] px-2 py-4 text-center text-foreground-secondary">
                No properties found
              </div>
            )}

            {filteredGroups.map((group) => (
              <div key={group.key || "default"} className="flex flex-col gap-2">
                {group.key && (
                  <label className="text-[13px] uppercase font-medium text-white">
                    {group.key}
                  </label>
                )}

                {group.items.map((item) => (
                  <div
                    key={item.key}
                    onClick={() => {
                      onSelect(item);
                      setOpen(false);
                    }}
                    className="flex items-center gap-3 px-2 py-1.5 rounded-md text-[12px] text-[#E4E4E7] hover:bg-background-topbar cursor-pointer"
                  >
                    <ToolTipWrapper text={item.title} />
                    <span>{item.title}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </PopoverContent>
      </div>
    </Popover>
  );
};

export default AddPropertyPopover;
