import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import { LogoutSquare02Icon } from "@hugeicons/core-free-icons";
import { cn } from "../../../lib/utils";

const ExitBuilder = () => {
  return (
    <Button
      className={`h-[36px] bg-button-default font-medium text-[14px] leading-5 tracking-normal border-none rounded-btn`}
    >
      <HugeiconsIcon icon={LogoutSquare02Icon} />
      Exit Builder
    </Button>
  );
};

export default ExitBuilder;
