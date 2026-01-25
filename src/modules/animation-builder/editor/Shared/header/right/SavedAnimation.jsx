import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import { Bookmark02Icon } from "@hugeicons/core-free-icons";

const SavedAnimation = () => {
  return (
    <Button className={"wcf-ab-button-icon"}>
      <HugeiconsIcon icon={Bookmark02Icon} size={16} strokeWidth={2} />
    </Button>
  );
};

export default SavedAnimation;
