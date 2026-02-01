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
  onValueChange = () => {},
  onDisabledUpdate = () => {},
  onDelete = () => {},
}) => {
  const {
    title,
    tooltipContent = "tooltip",
    isRequired = false,
    isCustomAnim = true,
    path = "",
    ...rest
  } = property;

  const [activeMethod, setActiveMethod] = useState("from");
  const [fromToSide, setFromToSide] = useState("from");
  /* UI props */
  const [uiProps, setUiProps] = useState({
    from: [],
    to: [],
    set: [],
    call: [],
  });

  /* GSAP values */
  const [gsapValues, setGsapValues] = useState({
    from: {},
    to: {},
    set: {},
    call: {},
  });

  /* resolve active bucket */
  const getActiveBucket = () => {
    if (activeMethod === "fromTo") return fromToSide;
    return activeMethod;
  };

  /* element add handler */
  const handleAddProperty = (prop) => {
    const bucket = getActiveBucket();

    setUiProps((prev) => {
      if (prev[bucket].find((p) => p.key === prop.key)) return prev;
      return {
        ...prev,
        [bucket]: [...prev[bucket], prop],
      };
    });
  };

  /* handle update value */
  const handleValueChange = (path, nextValue) => {
    const bucket = getActiveBucket();
    setGsapValues((prev) => {
      const next = {
        ...prev,
        [bucket]: {
          ...prev[bucket],
          [path]: nextValue,
        },
      };

      if (activeMethod === "fromTo") {
        const result = {
          method: "fromTo",
          values: {
            from: next.from,
            to: next.to,
          },
        };
        console.log(result);
        onValueChange(result);
      } else {
        const update = {
          method: activeMethod,
          values: next[activeMethod],
        };
        console.log(update);
        onValueChange(update);
      }

      return next;
    });
  };

  // get selected property key
  const getUsedPropertyKeys = () => {
    if (activeMethod === "fromTo") {
      return [
        ...uiProps.from.map((p) => p.key),
        ...uiProps.to.map((p) => p.key),
      ];
    }

    return uiProps[activeMethod].map((p) => p.key);
  };

  const activeBucket = getActiveBucket();
  const activeUiProps = uiProps[activeBucket];
  const activeValues = gsapValues[activeBucket];

  return (
    <div className="flex flex-col gap-3">
      <WCFABLabel title={title} tooltipContent={tooltipContent} />

      {/* main tabs */}
      <Tabs
        value={activeMethod}
        key={`${activeMethod}-${fromToSide}`}
        onValueChange={setActiveMethod}
      >
        <TabsList className="bg-background-topbar w-[257px] h-7 p-0.5 rounded-md gap-0.5 justify-start">
          {METHODS.map((m) => (
            <TabsTrigger
              key={m.key}
              value={m.key}
              className="h-6 px-3 py-[5px] text-[11.5px] font-normal leading-4.5 data-[state=active]:bg-button data-[state=active]:text-[#FAFAFA] hover:bg-button border-none bg-transparent text-foreground-secondary"
            >
              {m.title}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* nested from / to */}
        {activeMethod === "fromTo" && (
          <Tabs value={fromToSide} onValueChange={setFromToSide}>
            <TabsList className="bg-[#202024] w-[257px] h-7 p-0.5 rounded-md gap-0.5 mt-1 justify-between">
              <TabsTrigger
                value="from"
                className="flex-1 h-6 px-3 py-[5px] text-[11.5px] font-normal leading-4.5 data-[state=active]:bg-button data-[state=active]:text-[#FAFAFA] hover:bg-button border-none bg-transparent text-foreground-secondary"
              >
                From
              </TabsTrigger>
              <TabsTrigger
                value="to"
                className="flex-1 h-6 px-3 py-[5px] text-[11.5px] font-normal leading-4.5 data-[state=active]:bg-button data-[state=active]:text-[#FAFAFA] hover:bg-button border-none bg-transparent text-foreground-secondary"
              >
                To
              </TabsTrigger>
            </TabsList>
          </Tabs>
        )}

        {/* added fields */}
        <TabsContent value={activeMethod} className="mt-2 flex flex-col gap-2">
          {activeUiProps.map((prop) => {
            const Field = prop.element;
            return (
              <Field
                key={prop.key}
                property={prop}
                value={activeValues[prop.path]}
                onValueChange={(v) => handleValueChange(prop.path, v)}
              />
            );
          })}
        </TabsContent>
      </Tabs>

      {/* add property popover */}
      <Popover>
        <PopoverTrigger asChild>
          <Button className="bg-[#303033] h-7 rounded-md flex gap-2 border-none text-[#FAFAFA]">
            <HugeiconsIcon icon={AddCircleIcon} className="w-3 h-3" />
            Add
          </Button>
        </PopoverTrigger>

        <PopoverContent className="w-[260px] p-2 bg-button">
          <AddPropertyPopoverModal
            selectedKeys={getUsedPropertyKeys()}
            onSelect={handleAddProperty}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default TweenMethodField;
