import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";

const errorMessageVariants = cva("text-xs font-medium", {
  variants: {
    variant: {
      error: "text-red-500",
      warning: "text-yellow-500",
      info: "text-blue-500",
    },
  },
  defaultVariants: {
    variant: "error",
  },
});

const WCFABErrorMessage = ({
  message,
  variant = "error",
  isHoverable = false,
}) => {
  if (!message) return null;

  // Normalize message shape
  const title = typeof message === "string" ? message : message.title;
  const content = typeof message === "string" ? message : message.message;

  const text = (
    <span className={cn(errorMessageVariants({ variant }))}>{title}</span>
  );

  if (!isHoverable) {
    return <p>{text}</p>;
  }

  return (
    <HoverCard>
      <HoverCardTrigger className="cursor-help">{text}</HoverCardTrigger>
      <HoverCardContent className="max-w-xs text-sm">
        {content}
      </HoverCardContent>
    </HoverCard>
  );
};

export default WCFABErrorMessage;
