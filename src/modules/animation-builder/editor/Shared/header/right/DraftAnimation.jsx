import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import { LicenseDraftIcon } from "@hugeicons/core-free-icons/index";

const DraftAnimation = () => {
  return (
    <Button
      className={`h-[36px] w-[36px] bg-button-default border-none rounded-btn`}
    >
      <HugeiconsIcon
        icon={LicenseDraftIcon}
        size={16}
        color="currentColor"
        strokeWidth={1.5}
      />
    </Button>
  );
};

export default DraftAnimation;
