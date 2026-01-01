import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import { Globe02Icon } from "@hugeicons/core-free-icons";

const GlobalSettings = () => {
  return (
    <Button
      className={`h-[36px] bg-button-default font-medium text-[15px] leading-5 tracking-normal border-none rounded-btn`}
    >
      <HugeiconsIcon
        icon={Globe02Icon}
        size={16}
        color="currentColor"
        strokeWidth={1.5}
      />
      Global Settings
    </Button>
  );
};

export default GlobalSettings;
