import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import { Delete01Icon } from "@hugeicons/core-free-icons";
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";

const deleteBtnVariants = cva(
  "bg-transparent text-foreground-secondary hover:text-button-destructive-hover hover:scale-105 border-none outline-none rounded-5 transition-colors duration-200 ease-in-out cursor-pointer",
  {
    variants: {
      size: {
        sm: "h-2 w-2",
        md: "h-2 w-2",
        lg: "h-5 w-5",
      },
    },
    defaultVariants: {
      size: "sm",
    },
  },
);

const WCFABDeleteBtn = ({ size = "", onDelete = () => {} }) => {
  return (
    <Button
      onClick={() => onDelete()}
      className={cn(deleteBtnVariants({ size }))}
    >
      <HugeiconsIcon icon={Delete01Icon} size={11} strokeWidth={1.2} />
    </Button>
  );
};

export default WCFABDeleteBtn;
