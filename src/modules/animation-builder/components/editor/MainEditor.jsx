import { IconPlus2 } from "@/lib/icons";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import EditorBody from "./EditorBody";
import EditorFooter from "./EditorFooter";
import { useAnimationControl, useContentStep } from "@/hooks/app.hooks";
import { ABCustomPresetData } from "@/config/animationPresetData";
import { generateUniqueId } from "../../../../utils/generateUniqueId";
import { Skeleton } from "../ui/skeleton";

const MainEditor = ({ isLoading }) => {
  const { contentStep, setContentStep } = useContentStep();
  const { createAnimation } = useAnimationControl();
  return (
    <div className="bg-background h-full flex flex-col justify-between relative">
      {contentStep.step === 1 && (
        <div className="p-3 border-b border-border">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="play" size="play">
                <IconPlus2 /> Add new animation
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="min-w-[var(--radix-dropdown-menu-trigger-width)]"
              align="start"
            >
              <DropdownMenuItem
                onClick={() => {
                  const sampleData = {
                    id: generateUniqueId(),
                    title: "Animation Title",
                    type: "preset",
                    enable: true,
                  };
                  setContentStep({
                    step: 2,
                    data: sampleData,
                  });
                  createAnimation(sampleData);
                }}
              >
                Preset Animation
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  const sampleData = {
                    ...ABCustomPresetData,
                    id: generateUniqueId(),
                    title: ABCustomPresetData.title,
                  };
                  setContentStep({
                    step: 2,
                    data: sampleData,
                  });
                  createAnimation(sampleData);
                }}
              >
                Custom Animation
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => console.log("hi")}>
                Free Animation Presets
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
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
  );
};

export default MainEditor;
