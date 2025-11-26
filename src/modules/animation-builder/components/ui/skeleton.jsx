import { cn } from "@/lib/utils";

function Skeleton({ className, ...props }) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-dropdown-hover", className)}
      {...props}
    />
  );
}

export { Skeleton };
