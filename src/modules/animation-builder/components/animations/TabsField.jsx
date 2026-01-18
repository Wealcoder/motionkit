import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ToolTipWrapper from "@/components/common/ToolTipWrapper";
import AnimationPropsMapping from "@/editor/Shared/controller/animation_handler/AnimationPropsMapping";
import { Delete01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

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

  console.log(matchedTabContent);

  return (
    <div className="p-2 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm text-white">{title}</span>

          {tooltipContent && <ToolTipWrapper text={tooltipContent} />}
        </div>

        {isCustomAnim && (
          <Button size="icon" onClick={onDelete}>
            <HugeiconsIcon icon={Delete01Icon} className="text-[#A1A1AA]" />
          </Button>
        )}
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList className="w-full grid grid-cols-2 overflow-y-auto bg-background-sidebar shadow-none">
          {tabsTrigger.map((tab) => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className="whitespace-nowrap data-[state=active]:bg-background-card"
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
