import { useMemo } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ScrollArea } from "@/components/ui/scroll-area";
import AnimationPropsMapping from "./AnimationPropsMapping";

const AnimationPropsHanlder = ({
  selectedPresetGroup = "",
  selectedPreset = "",
  contentStep = {},
  updateContentData = () => {},
}) => {
  if (!selectedPreset || !selectedPresetGroup) return;

  const isCustomAnim = contentStep?.data?.type === "custom";

  // collecting preset configuration
  const { config = null, defaultData = null } = useMemo(() => {
    return (
      AAEAnimBuilder.freePresets?.getSingleFreePresets(
        selectedPresetGroup,
        selectedPreset,
      )?.configuration || {}
    );
  }, [selectedPreset, selectedPresetGroup]);

  // validating preset configuration
  if (selectedPreset !== config?.key || !config || !defaultData) {
    console.warn("Preset configuration not found!");
    return null;
  }

  return (
    <ScrollArea className="w-full h-full">
      <div className="flex flex-col gap-3">
        <Accordion
          type="single"
          collapsible
          defaultValue="item-0"
          className="flex flex-col gap-2 bg-background rounded-5"
        >
          {config?.properties?.map((accordion, index) => (
            <SingleAccordion
              key={index}
              accordionItemValue={index}
              defaultData={defaultData}
              accordion={accordion}
              contentStep={contentStep}
              updateContentData={updateContentData}
            />
          ))}
        </Accordion>
      </div>
    </ScrollArea>
  );
};

export default AnimationPropsHanlder;

const SingleAccordion = ({
  accordionItemValue = 0,
  defaultData = {},
  accordion = {},
  contentStep = {},
  updateContentData = () => {},
}) => {
  const { accordionTitle = "", properties = [] } = accordion;
  const hasProperties = properties.length > 0;
  return (
    <AccordionItem
      value={`item-${accordionItemValue}`}
      style={{ borderBottom: "1px solid #202024" }}
    >
      <AccordionTrigger className="wcf-ab-button-general bg-transparent text-[13px] font-semibold hover:no-underline p-0 active:outline-none">
        {accordionTitle}
      </AccordionTrigger>

      {/* mapping each property */}
      {hasProperties && (
        <AccordionContent className="flex flex-col gap-2">
          {properties.map((property, index) => (
            <AnimationPropsMapping
              key={index}
              property={property}
              defaultData={defaultData}
              contentStep={contentStep}
              updateContentData={updateContentData}
            />
          ))}
        </AccordionContent>
      )}
    </AccordionItem>
  );
};
