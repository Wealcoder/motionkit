import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import { LicenseDraftIcon } from "@hugeicons/core-free-icons/index";

const DraftAnimation = () => {
  return (
    <Button
      className={`h-[36px] w-[36px] bg-button-primary border-none rounded-btn`}
    >
      <HugeiconsIcon
        icon={LicenseDraftIcon}
        size={16}
        color="currentColor"
        strokeWidth={2}
      />
    </Button>
  );
};

export default DraftAnimation;
