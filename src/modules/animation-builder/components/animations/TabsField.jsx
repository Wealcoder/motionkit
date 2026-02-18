import { useEffect, useRef, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AnimationPropsMapping from "@/editor/Shared/controller/animation_handler/AnimationPropsMapping";

const TabsFields = ({
  property = {},
  value = {},
  onDelete = () => {},
  onDisabledUpdate = () => {},
  onValueChange = (value) => {},
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

  const tabsRef = useRef(null);

  useEffect(() => {
    const el = tabsRef.current;
    if (!el) return;

    const onWheel = (e) => {
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
        e.preventDefault();
        el.scrollLeft += e.deltaY;
      }
    };

    el.addEventListener("wheel", onWheel, { passive: false });

    return () => {
      el.removeEventListener("wheel", onWheel);
    };
  }, []);

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
        <div
          ref={tabsRef}
          className="w-full overflow-x-auto overflow-y-hidden scrollbar-none"
        >
          <TabsList className="w-full h-7 p-0.5 gap-1 bg-background-topbar">
            {tabsTrigger?.map((tab) => (
              <TabsTrigger
                key={tab?.value}
                value={tab?.value}
                className="max-w-[150px] h-6 bg-transparent text-xss text-foreground-secondary font-normal leading-4.25 px-3 py-[5px] border-none rounded-5 shadow-none data-[state=active]:bg-button data-[state=active]:text-foreground"
              >
                {tab?.title}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

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

export default TabsFields;
