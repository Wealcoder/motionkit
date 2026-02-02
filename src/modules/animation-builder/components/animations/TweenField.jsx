import React, { useCallback, useState } from "react";
import { ButtonGroup } from "@/components/ui/button-group";
import { Button } from "@/components/ui/button";
import WCFABLabel from "@/components/animations/blocks/WCFABLabel";
import { cn } from "@/lib/utils";

const METHODS = [
  { key: "from", title: "From" },
  { key: "to", title: "To" },
  { key: "fromTo", title: "FromTo" },
  { key: "set", title: "Set" },
  { key: "call", title: "Call" },
];

const TweenField = ({
  property = {},
  value = "from",
  onValueChange = () => {},
}) => {
  const {
    title = "Method",
    tooltipContent = null,
    size = "sm",
  } = property || {};

  const [currentMethod, setCurrentMethod] = useState(value);

  const handleUpdate = useCallback(
    (method) => {
      if (value === method) return;
      setCurrentMethod(method);
      onValueChange(method);
    },
    [value, onValueChange],
  );

  return (
    <div className="flex flex-col gap-3">
      <WCFABLabel title={title} size={size} tooltipContent={tooltipContent} />
      <ButtonGroup className="w-full inline-flex p-1 justify-between gap-1.5 bg-background-sidebar rounded-5">
        {METHODS?.map((method) => (
          <Button
            className={cn(
              "w-full max-h-[24px] gap-1.5 text-xss text-foreground font-inter font-normal leading-5 tracking-tighter border-none outline-none !rounded-5 cursor-pointer",
              currentMethod === method?.key
                ? "bg-button cursor-not-allowed"
                : "bg-transparent hover:bg-button-hover cursor-pointer",
            )}
            onClick={() => handleUpdate(method?.key)}
            key={method?.key}
          >
            {method?.title ?? ""}
          </Button>
        ))}
      </ButtonGroup>
    </div>
  );
};

export default TweenField;
