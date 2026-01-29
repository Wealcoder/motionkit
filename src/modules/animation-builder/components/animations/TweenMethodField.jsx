import React, { useState } from "react";
import WCFABLabel from "@/components/animations/blocks/WCFABLabel";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import { AddCircleIcon } from "@hugeicons/core-free-icons";
import AddPropertyPopoverModal from "./shared/AddPropertyPopoverModal";

const METHODS = [
  { key: "from", title: "From" },
  { key: "to", title: "To" },
  { key: "fromTo", title: "FromTo" },
  { key: "set", title: "Set" },
  { key: "call", title: "Call" },
];

const TweenMethodField = ({
  property = {},
  value = {},
  onValueChange = () => {},
}) => {
  const {
    title,
    tooltipContent = "Enter the value.",
    isRequired = false,
    isCustomAnim = true,
    min = 0,
    max = 0,
    path = "",
    ...rest
  } = property;

  const [activeMethod, setActiveMethod] = useState("from");

  const [uiProps, setUiProps] = useState({
    from: [],
    to: [],
    set: [],
    call: [],
    fromTo: [],
  });

  const [gsapValues, setGsapValues] = useState({
    from: {},
    to: {},
    fromTo: {},
  });

  /* ───────── add property to active tab */
  const handleAddProperty = (prop) => {
    setUiProps((prev) => {
      if (prev[activeMethod].some((p) => p.key === prop.key)) {
        return prev;
      }
      return {
        ...prev,
        [activeMethod]: [...prev[activeMethod], prop],
      };
    });
  };

  /* ───────── update gsap value */
  const handleValueChange = (path, nextValue) => {
    setGsapValues((prev) => {
      const next = {
        ...prev,
        [activeMethod]: {
          ...prev[activeMethod],
          [path]: nextValue,
        },
      };

      console.log(next);

      onValueChange(next); 
      return next;
    });
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Title */}
      <div className="flex flex-col gap-2">
        <WCFABLabel title={title} tooltipContent={tooltipContent} />

        <Tabs value={activeMethod} onValueChange={setActiveMethod}>
          <TabsList className="bg-[#202024] w-[257px] h-7 p-0.5 rounded-md gap-0.5 justify-start">
            {METHODS.map((m) => (
              <TabsTrigger
                key={m.key}
                value={m.key}
                className="h-6 px-3 py-[5px] text-[11.5px] font-normal leading-4.5 data-[state=active]:bg-[#303033] data-[state=active]:text-[#FAFAFA] hover:bg-[#303033] border-none bg-transparent text-[#A1A1AA]"
              >
                {m.title}
              </TabsTrigger>
            ))}
          </TabsList>
          <TabsContent value={activeMethod} className="flex flex-col gap-2">
            {uiProps[activeMethod].map((prop) => {
              const Field = prop.element;
              return (
                <Field
                  key={prop.key}
                  property={prop}
                  value={gsapValues[activeMethod][prop.path]}
                  onValueChange={(v) => handleValueChange(prop.path, v)}
                />
              );
            })}
          </TabsContent>
        </Tabs>
      </div>

      {/* Add property */}
      <Popover>
        <PopoverTrigger asChild>
          <Button className="bg-[#303033] h-7 rounded-md flex gap-2 border-none text-[#FAFAFA]">
            <HugeiconsIcon icon={AddCircleIcon} className="w-3 h-3" />
            Add
          </Button>
        </PopoverTrigger>

        <PopoverContent className="w-[260px] p-2 bg-[#303033]">
          <AddPropertyPopoverModal onSelect={handleAddProperty} />
        </PopoverContent>
      </Popover>

      {/* Properties */}
    </div>
  );
};

export default TweenMethodField;
