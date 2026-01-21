import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { useAnimationControl } from "@/hooks/app.hooks";
import PageAnimation from "./create/PageAnimation";
import GlobalAnimation from "./create/GlobalAnimation";
import { Button } from "@/components/ui/button";

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
  const [snapShot, setSnapShot] = useState({});
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
      <div className="flex justify-between items-center">
        <Button className="wcf-ab-button-general wcf-ab-button-primary py-1">
          Back
        </Button>
        <Button className="wcf-ab-button-general wcf-ab-button-action py-1">
          Save
        </Button>
      </div>
      {contentStep?.step === 1 && (
        <div className="bg-background rounded-5">
          <Tabs
            defaultValue="page_anim"
            onValueChange={(value) => handleSwitchTab(value)}
          >
            <TabsList className="w-full justify-between">
              {tabContent?.map((content, index) => (
                <TabsTrigger
                  key={index}
                  value={content?.value}
                  className="p-0 gap-2 bg-transparent text-[#fafafa] font-normal text-xs leading-5 tracking-normal border-none outline-none"
                >
                  <span
                    className={cn(
                      "size-3 rounded-full",
                      currentTab === content.value
                        ? "bg-[#4CA1B3]"
                        : "bg-[#303033]",
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
