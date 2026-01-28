import React, { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import animationProperties from "@/utils/animationProperties";
import ToolTipWrapper from "@/components/common/ToolTipWrapper";

const AddPropertyPopoverModal = ({ selectedKeys = [], onSelect }) => {
  const [search, setSearch] = useState("");

  // flatten grouped config → single list
  const allItems = useMemo(() => {
    return animationProperties.flatMap((group) =>
      group.items.map((item) => ({
        ...item,
        group: group.key,
      })),
    );
  }, []);

  // search + exclude already selected
  const filteredItems = useMemo(() => {
    const q = search.toLowerCase();
    return allItems.filter(
      (item) =>
        !selectedKeys.includes(item.key) &&
        (item.title.toLowerCase().includes(q) ||
          item.key.toLowerCase().includes(q)),
    );
  }, [allItems, search, selectedKeys]);

  return (
    <>
      {/* search */}
      <Input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search property"
        className="mb-2 h-7 text-[11.5px] font-normal leading-4.5 border-none bg-[#202024] text-white placeholder:text-[#A1A1AA]"
      />

      {/* list */}
      <div className="max-h-80 overflow-y-auto space-y-2">
        <div className="flex flex-col gap-1">
          {filteredItems.length === 0 && (
            <div className="text-[11px] px-2 py-4 text-center">
              No properties found
            </div>
          )}

          {filteredItems.map((item) => (
            <div
              key={item.key}
              onClick={() => onSelect(item)}
              className="flex items-center gap-3 px-2 py-1.5 rounded-md text-[11px] text-left hover:bg-[#202024] text-[#E4E4E7]"
            >
              <ToolTipWrapper text={"tooltip"}/>
              <span>{item.title}</span>
              
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default AddPropertyPopoverModal;
