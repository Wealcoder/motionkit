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
}) => {
  const [currentTab, setCurrentTab] = useState("page_anim");
  const { allAnimation, createAnimation } = useAnimationControl();

  return (
    <div className="p-[15px] bg-background-sidebar h-full flex flex-col justify-between relative rounded-l-[10px] border-red-dev">
      {contentStep?.step === 1 && (
        <div className="px-[10px] py-[15px] bg-background rounded-5">
          <Tabs
            defaultValue="page_anim"
            onValueChange={(value) => setCurrentTab(value)}
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
