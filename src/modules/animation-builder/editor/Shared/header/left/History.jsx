import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import { Clock03Icon } from "@hugeicons/core-free-icons";

const History = () => {
  return (
    <Button
      className={`h-[36px] w-[36px] bg-button-primary border-none rounded-btn`}
    >
      <HugeiconsIcon
        icon={Clock03Icon}
        size={16}
        color="currentColor"
        strokeWidth={1.5}
      />
    </Button>
  );
};

export default History;
