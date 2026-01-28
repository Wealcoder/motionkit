const { cva } = require("class-variance-authority");

export const inputVariants = cva(
  "px-[10px] !py-[5px] text-foreground-secondary hover:text-foreground focus:text-foreground !text-xss font-inter font-normal leading-4.25 tracking-normal placeholder:text-xss border-none rounded-5 outline-none ring-0 focus-visible:ring-0 transition-colors cursor-text",
  {
    variants: {
      size: {
        // for gradient picker
        gradient:
          "h-7 min-w-auto max-w-[100px] bg-input-secondary hover:bg-select-secondary focus:bg-select-secondary",
        sm: "h-7 min-w-[100px] max-w-[100px] bg-input hover:bg-input-hover focus:bg-input-focus",
        md: "h-7 min-w-[150px] max-w-[150px] bg-input hover:bg-input-hover focus:bg-input-focus",
        lg: "h-7 w-full bg-input hover:bg-input-hover focus:bg-input-focus",
      },
    },
    defaultVariants: {
      size: "sm",
    },
  },
);
