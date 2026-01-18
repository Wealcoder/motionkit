import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AnimationPropsMapping from "@/editor/Shared/controller/animation_handler/AnimationPropsMapping";

const TabsField = ({
  property = {},
  value = {},
  onDelete = () => {},
  onDisabledUpdate = () => {},
  onValueChange = (value) => {
    {
    }
  },
  contentStep = {},
  updateContentData = () => {},
}) => {
  const {
    title = "title",
    tooltipContent = "Enter the value.",
    tabsTrigger = [],
    tabsContent = [],
    isRequired = false,
    isCustomAnim = false,
    ...rest
  } = property || {};

  const [activeTab, setActiveTab] = useState(tabsTrigger?.[0]?.value);

  // handle tab click
  const handleTabChange = (tabValue) => {
    setActiveTab(tabValue);

    onValueChange({
      ...value,
      activeTab: tabValue,
    });
  };

  // find matched content
  const matchedTabContent = tabsContent.find((item) => item.key === activeTab);

  const hasProperties = !!matchedTabContent?.fields?.length;

  return (
    <div className="space-y-3 w-87.75">
      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList className="w-full h-9 p-1 grid grid-cols-2 gap-1 overflow-y-auto bg-background-sidebar">
          {tabsTrigger.map((tab) => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className="max-w-[157px] h-7 text-[11.5px] font-normal leading-4.5 px-3 py-1.5 border-none bg-transparent shadow-none text-input-placeholder data-[state=active]:bg-background-card data-[state=active]:text-popover-foreground"
            >
              {tab.title}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={activeTab}>
          {hasProperties && (
            <div className="flex flex-col gap-2">
              {matchedTabContent?.fields?.map((property, index) => (
                <AnimationPropsMapping
                  key={index}
                  property={property}
                  defaultData={value}
                  contentStep={contentStep}
                  updateContentData={updateContentData}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Required */}
      {isRequired && <p className="text-xs text-red-500">Field is required</p>}
    </div>
  );
};

export default TabsField;
