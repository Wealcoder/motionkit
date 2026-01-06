import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import { InformationCircleIcon } from "@hugeicons/core-free-icons";

const Help = () => {
  return (
    <Button
      className={`h-[36px] w-[36px] bg-button-primary border-none rounded-btn`}
    >
      <HugeiconsIcon
        icon={InformationCircleIcon}
        size={16}
        color="currentColor"
        strokeWidth={2}
      />
    </Button>
  );
};

export default Help;
