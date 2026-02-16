import React, { useMemo, useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import HelpDialogHeader from "@/components/common/HelpDialogHeader";

import { PlusSignIcon } from "@hugeicons/core-free-icons/index";
import { HugeiconsIcon } from "@hugeicons/react";
import { Kbd } from "@/components/ui/kbd";
import HelpDialogSearchSection from "@/components/common/HelpDialogSearchSection";

export const keyboardShortcutGroups = [
  {
    title: "Action",
    items: [
      { label: "Undo", keys: ["Ctrl", "Z"] },
      { label: "Redo", keys: ["Ctrl", "Shift", "Z"] },
      { label: "Copy", keys: ["Ctrl", "C"] },
      { label: "Paste", keys: ["Ctrl", "V"] },
      { label: "Paste Style", keys: ["Ctrl", "Shift", "V"] },
      { label: "Delete", keys: ["Del"] },
      { label: "Duplicate", keys: ["Ctrl", "D"] },
      { label: "Save", keys: ["Ctrl", "S"] },
    ],
  },
  {
    title: "Panels",
    items: [
      { label: "Finder", keys: ["Ctrl", "Z"] },
      { label: "Show/Hide Panel", keys: ["Ctrl", "P"] },
      { label: "Structure", keys: ["Ctrl", "I"] },
      { label: "Paste Style", keys: ["Ctrl", "Shift", "V"] },
      { label: "History", keys: ["Ctrl", "Shift", "H"] },
    ],
  },
  {
    title: "Go To",
    items: [
      { label: "Responsive Mode", keys: ["Ctrl", "Shift", "M"] },
      { label: "Keyboard Shortcut", keys: ["Shift", "?"] },
      { label: "Quit", keys: ["Esc"] },
    ],
  },
];

const KeyboardShortcutModal = ({ open, onClose }) => {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredGroups = useMemo(() => {
    if (!searchQuery.trim()) return keyboardShortcutGroups;

    return keyboardShortcutGroups
      .map((group) => ({
        ...group,
        items: group.items.filter((item) =>
          item.label.toLowerCase().includes(searchQuery.toLowerCase()),
        ),
      }))
      .filter((group) => group.items.length > 0);
  }, [searchQuery]);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-[1019px] min-h-[613px] max-h-[613px] bg-[#18181B] p-0 [&>button]:hidden !grid-cols-none!grid-rows-none !block">
        {/* dialog header */}
        <HelpDialogHeader title="Keyboards Shortcuts" />

        {/* search section */}
        <HelpDialogSearchSection
          placeholder="Search shortcuts"
          value={searchQuery}
          onChange={setSearchQuery}
          onClear={() => setSearchQuery("")}
        />

        {/* keyboard shortcuts */}
        <div className="w-full max-h-[400px] overflow-y-auto px-8 py-6">
          <div className="grid grid-cols-3 gap-[60px]">
            {filteredGroups.map((group, index) => (
              <div className="flex flex-col ">
                {/* Group Title */}
                <div key={index} className="w-[257px] flex flex-col gap-[13px]">
                  <div className="w-[237px] mx-auto">
                    <h3 className="text-sm font-semibold text-[#FAFAFA] m-0">
                      {group.title}
                    </h3>
                  </div>

                  {/* Items */}
                  <div className="flex flex-col gap-2.5">
                    {group.items.map((item, i) => (
                      <div key={i} className="max-w-[257px]">
                        <div className="max-w-[237px] min-h-6 mx-auto flex items-center justify-between pb-2.5">
                          <span className="text-xs text-[#E4E4E7] font-normal leading-5 tracking-normal">
                            {item.label}
                          </span>

                          <div className="flex items-center gap-0.5">
                            {item.keys.map((key, k) => (
                              <div
                                key={k}
                                className="flex items-center gap-0.5"
                              >
                                <Kbd className="bg-[#303033] text-[#FAFAFA] border-none rounded-md px-1.5 py-[2px] text-xs">
                                  {key}
                                </Kbd>

                                {/* + symbol between keys */}
                                {k !== item.keys.length - 1 && (
                                  <HugeiconsIcon
                                    icon={PlusSignIcon}
                                    size={12}
                                    color="currentColor"
                                    strokeWidth={1}
                                    className="text-[#71717A] text-xs"
                                  />
                                )}
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Divider — only if NOT last item */}
                        {i !== group.items.length - 1 && (
                          <div className="w-full h-[1px] bg-[#303033]" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        {filteredGroups.length === 0 && (
          <p className="text-center text-[#71717A] mt-6">No results found.</p>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default KeyboardShortcutModal;
