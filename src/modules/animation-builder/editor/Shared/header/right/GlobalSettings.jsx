import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import { Globe02Icon } from "@hugeicons/core-free-icons";

const GlobalSettings = () => {
  return (
    <Button
      className={`h-[36px] bg-button-primary font-medium text-[15px] leading-5 tracking-normal border-none text-white rounded-5`}
    >
      <HugeiconsIcon icon={Globe02Icon} size={16} strokeWidth={2} />
      Global Settings
    </Button>
  );
};

export default GlobalSettings;
