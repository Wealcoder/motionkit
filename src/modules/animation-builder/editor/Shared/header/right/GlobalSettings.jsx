import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import { Globe02Icon } from "@hugeicons/core-free-icons";

const GlobalSettings = () => {
  return (
    <Button className="wcf-ab-button-general wcf-ab-button-primary h-[1.75rem] py-1 !text-xs">
      <HugeiconsIcon icon={Globe02Icon} size={16} strokeWidth={2} />
      Global Settings
    </Button>
  );
};

export default GlobalSettings;
