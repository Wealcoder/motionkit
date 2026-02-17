import React from "react";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import {
  CancelCircleIcon,
  Search01FreeIcons,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

const HelpDialogSearchSection = ({ placeholder, value, onChange, onClear }) => {
  return (
    <InputGroup className="w-[568px] h-10 mx-auto bg-[#303033] pl-3 py-1.5 pr-1.5 rounded-[10px]">
      {/* Input */}
      <InputGroupInput
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="px-1.5 bg-transparent outline-none text-[#FAFAFA]"
      />

      {/* Search Icon */}
      <InputGroupAddon className="p-0">
        <HugeiconsIcon
          icon={Search01FreeIcons}
          size={20}
          strokeWidth={1.5}
          className="text-[#E4E4E7]"
        />
      </InputGroupAddon>

      {/* Clear Icon */}

      <InputGroupAddon
        align="inline-end"
        className="p-0 cursor-pointer"
        onClick={onClear}
      >
        <HugeiconsIcon
          icon={CancelCircleIcon}
          size={16}
          strokeWidth={1.2}
          className="text-[#71717A] hover:text-[#FAFAFA]"
        />
      </InputGroupAddon>
    </InputGroup>
  );
};

export default HelpDialogSearchSection;
