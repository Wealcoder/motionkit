import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import { InformationCircleIcon } from "@hugeicons/core-free-icons";

const Help = () => {
  return (
    <Button
      className={`h-[36px] w-[36px] bg-button-primary border-none rounded-btn`}
      // onClick={() => {
      //   updateActiveStructure(!activeStructure);
      // }}
      // className={cn(
      //   "h-[36px] w-[36px] bg-transparent hover:bg-border-2 border-[1px] border-border-active px-0 py-0 [&_svg]:size-[24px] rounded-[4px]",
      //   activeStructure && "bg-border-2"
      // )}
    >
      <HugeiconsIcon
        icon={InformationCircleIcon}
        size={16}
        color="currentColor"
        strokeWidth={1.5}
      />
    </Button>
  );
};

export default Help;
