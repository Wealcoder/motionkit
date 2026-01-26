const { cva } = require("class-variance-authority");

export const inputVariants = cva(
  "bg-input hover:bg-input-hover focus:bg-input-focus text-foreground-secondary hover:text-foreground focus:text-foreground !text-xss font-inter font-normal leading-4.25 tracking-normal placeholder:text-xss border-none rounded-5 outline-none ring-0 focus-visible:ring-0 transition-colors cursor-text",
  {
    variants: {
      size: {
        sm: "h-7 px-[10px] min-w-[100px] max-w-[100px]",
        md: "h-7 px-2.5 min-w-[150px] max-w-[150px]",
        lg: "h-7 px-3 w-full",
      },
    },
    defaultVariants: {
      size: "sm",
    },
  },
);
