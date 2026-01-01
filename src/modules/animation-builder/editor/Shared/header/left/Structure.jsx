import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import { KeyframesMultipleIcon } from "@hugeicons/core-free-icons";

const Structure = () => {
  return (
    <Button
      className={`h-[36px] w-[36px] bg-button-default border-none rounded-btn`}
    >
      <HugeiconsIcon
        icon={KeyframesMultipleIcon}
        size={16}
        color="currentColor"
        strokeWidth={1.5}
      />
    </Button>
  );
};

export default Structure;
