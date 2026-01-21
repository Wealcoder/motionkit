import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import { LicenseDraftIcon } from "@hugeicons/core-free-icons/index";

const DraftAnimation = () => {
  return (
    <Button className={"wcf-ab-button-icon"}>
      <HugeiconsIcon icon={LicenseDraftIcon} size={16} strokeWidth={2} />
    </Button>
  );
};

export default DraftAnimation;
