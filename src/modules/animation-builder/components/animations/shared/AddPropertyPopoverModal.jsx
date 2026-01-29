import React, { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import animationProperties from "@/utils/animationProperties";
import ToolTipWrapper from "@/components/common/ToolTipWrapper";
import { Search01Icon } from "@hugeicons/core-free-icons/index";
import { HugeiconsIcon } from "@hugeicons/react";

const AddPropertyPopoverModal = ({ selectedKeys = [], onSelect }) => {
  const [search, setSearch] = useState("");

  /* ───────── filter groups + items */
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

        return {
          ...group,
          items,
        };
      })
      .filter((group) => group.items.length > 0);
  }, [search, selectedKeys]);

  return (
    <>
      {/* search */}
      <div className="flex items-center bg-[#202024] mb-2 h-7 rounded-md px-[7px] py-[5px]">
        <HugeiconsIcon icon={Search01Icon} className="text-[#E4E4E7] w-3.5 h-3.5" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search property"
          className="h-7 bg-transparent p-0 pl-1 text-[11.5px] font-normal leading-4.5 border-none  text-[#FAFAFA] placeholder:text-[#A1A1AA]"
        />
      </div>

      {/* list */}
      <div className="max-h-80 overflow-y-auto flex flex-col gap-2.5">
        {filteredGroups.length === 0 && (
          <div className="text-[11px] px-2 py-4 text-center text-[#A1A1AA]">
            No properties found
          </div>
        )}

        {filteredGroups.map((group) => (
          <div key={group.key || "default"} className="flex flex-col gap-2.5">
            {/* group title */}
            {group.key && (
              <label className="text-[13px] uppercase font-medium leading-5 text-white">
                {group.key}
              </label>
            )}

            {/* group items */}
            <div className="flex flex-col gap-0.5">
              {group.items.map((item) => (
                <div
                  key={item.key}
                  onClick={() => onSelect(item)}
                  className="
                    flex items-center gap-3
                    px-2 py-1.5 rounded-md
                    text-[12px] text-left
                    text-[#E4E4E7]
                    hover:bg-[#202024]
                    cursor-pointer
                  "
                >
                  <ToolTipWrapper text={item.title} />
                  <span>{item.title}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default AddPropertyPopoverModal;
