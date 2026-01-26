const { cva } = require("class-variance-authority");

export const contentWrapper = cva("flex justify-end items-center gap-2", {
  variants: {
    size: {
      sm: "max-w-[120px]",
      md: "max-w-[150px]",
    },
  },
  defaultVariants: {
    size: "sm",
  },
});
