import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useMemo } from "react";
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
        {config?.properties?.map((accordion, index) => (
          <SingleAccordion
            key={index}
            defaultData={defaultData}
            accordion={accordion}
            isCustomAnim={isCustomAnim}
            contentStep={contentStep}
            updateContentData={updateContentData}
          />
        ))}
      </div>
    </ScrollArea>
  );
};

export default AnimationPropsHanlder;

const SingleAccordion = ({
  defaultData = {},
  accordion = {},
  isCustomAnim = false,
  contentStep = {},
  updateContentData = () => {},
}) => {
  const { title = "", properties = [] } = accordion;
  const hasProperties = properties.length > 0;
  const accordionValue = isCustomAnim ? undefined : "item-1";

  return (
    <Accordion
      type="single"
      collapsible={isCustomAnim}
      value={accordionValue}
      className="flex flex-col gap-2 bg-background rounded-5"
    >
      <AccordionItem value="item-1">
        <AccordionTrigger>
          <span className="text-white text-[13px] font-semibold leading-5 tracking-normal">
            {title}
          </span>
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
    </Accordion>
  );
};
