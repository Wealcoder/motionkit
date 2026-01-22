import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import { Clock03Icon } from "@hugeicons/core-free-icons";

const History = () => {
  return (
    <Button className={"wcf-ab-button-icon"}>
      <HugeiconsIcon icon={Clock03Icon} size={16} strokeWidth={2} />
    </Button>
  );
};

export default History;
