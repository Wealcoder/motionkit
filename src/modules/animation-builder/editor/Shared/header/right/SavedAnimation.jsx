import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import { Bookmark02Icon } from "@hugeicons/core-free-icons";

const SavedAnimation = () => {
  return (
    <Button
      className={`h-[36px] w-[36px] bg-button-primary border-none text-white rounded-5`}
    >
      <HugeiconsIcon icon={Bookmark02Icon} size={16} strokeWidth={2} />
    </Button>
  );
};

export default SavedAnimation;
