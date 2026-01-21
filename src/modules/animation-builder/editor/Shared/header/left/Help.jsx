import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import { InformationCircleIcon } from "@hugeicons/core-free-icons";

const Help = () => {
  return (
    <Button className={"wcf-ab-button-icon"}>
      <HugeiconsIcon icon={InformationCircleIcon} size={16} strokeWidth={2} />
    </Button>
  );
};

export default Help;
