import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import { KeyframesMultipleIcon } from "@hugeicons/core-free-icons";

const Structure = () => {
  return (
    <Button className={"wcf-ab-button-icon"}>
      <HugeiconsIcon icon={KeyframesMultipleIcon} size={16} strokeWidth={1.7} />
    </Button>
  );
};

export default Structure;
