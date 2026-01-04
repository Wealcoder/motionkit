import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import IframeReactInteraction from "@/context_menu/IframeReactInteraction";
import { useAnimationControl, useContentStep } from "@/hooks/app.hooks";
import { generateUniqueId } from "../../../utils/generateUniqueId";
import EditorBody from "../components/editor/EditorBody";
import EditorFooter from "../components/editor/EditorFooter";
import { Skeleton } from "../components/ui/skeleton";
import { useState } from "react";
import { cn } from "@/lib/utils";
import PresetAnimation from "./Shared/controller/PresetAnimation";

// tab content
const tabContent = [
  { title: "Page Animation", value: "page_anim" },
  { title: "Global Animation", value: "global_anim" },
];

const Controller = ({ isLoading }) => {
  const [currentTab, setCurrentTab] = useState("page_anim");
  const { contentStep, setContentStep } = useContentStep();
  const { createAnimation } = useAnimationControl();

  // creating new animation
  const handleAddAnimation = (preset) => {
    const { config: { type = null } = {} } = preset || {};
    if (!type) return;
    const uniqueId = generateUniqueId();
    preset.config.id = uniqueId;
    setContentStep({
      step: 2,
      data: preset,
    });
    createAnimation(preset);
  };

  return (
    // IframeReactInteraction: this high order react component helps to manage context menu interaction with controller
    <IframeReactInteraction>
      <div className="p-[15px] bg-background-sidebar h-full flex flex-col justify-between relative rounded-l-[10px]">
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
                <PresetAnimation handleAddAnimation={handleAddAnimation} />
              </TabsContent>
              <TabsContent value="global_anim">
                <p>Global Animation Tab Content</p>
              </TabsContent>
            </Tabs>
          </div>
        )}

        <div className="flex-1">
          {isLoading ? (
            <div className="space-y-2 p-4">
              <Skeleton className="h-4 w-[250px]" />
              <Skeleton className="h-4 w-[200px]" />
            </div>
          ) : (
            <EditorBody contentStep={contentStep} />
          )}
        </div>
        <EditorFooter />
      </div>
    </IframeReactInteraction>
  );
};

export default Controller;
