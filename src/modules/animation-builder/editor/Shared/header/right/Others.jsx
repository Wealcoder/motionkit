import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { HugeiconsIcon } from "@hugeicons/react";
import { MoreVerticalIcon } from "@hugeicons/core-free-icons";
import SwitchField from "@/components/animations/SwitchField";

const Others = () => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button className="wcf-ab-button-icon ">
          <HugeiconsIcon icon={MoreVerticalIcon} size={16} strokeWidth={2} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-56 bg-background text-white shadow-lg mt-[18px]"
        align="end"
      >
        <DropdownMenuGroup>
          <DropdownMenuLabel>
            <SwitchField
              property={{ title: "Zoom Panel On/Off" }}
              value={false}
              onValueChange={(value) => console.log(value)}
            />
          </DropdownMenuLabel>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default Others;
