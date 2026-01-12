import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import { Clock03Icon } from "@hugeicons/core-free-icons";

const History = () => {
  return (
    <Button
      className={`h-[36px] w-[36px] bg-button-primary border-none text-white rounded-5`}
    >
      <HugeiconsIcon icon={Clock03Icon} size={16} strokeWidth={1.5} />
    </Button>
  );
};

export default History;
