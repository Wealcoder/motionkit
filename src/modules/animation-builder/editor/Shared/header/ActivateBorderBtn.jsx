import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import { ViewIcon } from "@hugeicons/core-free-icons";
import { cn } from "../../../lib/utils";

const ActivateBorderBtn = () => {
  return (
    <Button
      className={`h-[36px] w-[36px] bg-button-default border-none rounded-btn`}
      // onClick={() => {
      //   updateActiveStructure(!activeStructure);
      // }}
      // className={cn(
      //   "h-[36px] w-[36px] bg-transparent hover:bg-border-2 border-[1px] border-border-active px-0 py-0 [&_svg]:size-[24px] rounded-[4px]",
      //   activeStructure && "bg-border-2"
      // )}
    >
      <HugeiconsIcon icon={ViewIcon} />
    </Button>
  );
};

export default ActivateBorderBtn;
