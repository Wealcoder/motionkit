import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { useAnimationControl } from "@/hooks/app.hooks";
import PageAnimation from "./create/PageAnimation";
import GlobalAnimation from "./create/GlobalAnimation";

// tab content
const tabContent = [
  { title: "Page Animation", value: "page_anim" },
  { title: "Global Animation", value: "global_anim" },
];

const ControllerHeader = ({
  handleAddAnimation = () => {},
  contentStep = {},
  setContentStep = () => {},
}) => {
  const [currentTab, setCurrentTab] = useState("page_anim");
  const { allAnimation, createAnimation } = useAnimationControl();

  // reset content step when switching tab
  const handleSwitchTab = (currentTab) => {
    setCurrentTab((prev) => {
      if (currentTab === prev) return prev;
      // reset to default content step.
      setContentStep({
        step: 1,
        data: {},
      });
      return currentTab;
    });
  };

  return (
    <div>
      {contentStep?.step === 1 && (
        <div className="px-[10px] py-[15px] bg-background rounded-5">
          <Tabs
            defaultValue="page_anim"
            onValueChange={(value) => handleSwitchTab(value)}
          >
            <TabsList>
              {tabContent?.map((content, index) => (
                <TabsTrigger
                  key={index}
                  value={content?.value}
                  className="gap-2 bg-background text-white font-normal text-[15px] leading-5 tracking-normal border-none outline-none"
                >
                  <span
                    className={cn(
                      "size-[14px] rounded-full box-border border-2 border-solid flex items-center justify-center border-background-sidebar",
                      currentTab === content.value
                        ? "bg-[#4CA1B3]"
                        : "bg-background-sidebar "
                    )}
                  />

                  <span>{content?.title}</span>
                </TabsTrigger>
              ))}
            </TabsList>
            <TabsContent value="page_anim">
              <PageAnimation handleAddAnimation={handleAddAnimation} />
            </TabsContent>
            <TabsContent value="global_anim">
              <GlobalAnimation handleAddAnimation={handleAddAnimation} />
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  );
};

export default ControllerHeader;
