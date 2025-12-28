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
import { useEffect } from "react";
import { handleCopyText } from "@/lib/contextMenu/contextMenuHelper";

const MainEditor = ({ isLoading }) => {
  const { contentStep, setContentStep } = useContentStep();
  const { allAnimation, createAnimation, deleteAnimation } =
    useAnimationControl();

  // context menu helper function to communicate preview iframe with editor using event listener
  const handleMessage = (event) => {
    // create animation
    if (event.data.type === "WCF_AB_CREATE_ANIMATION") {
      const { sampleData, itemClass, contextMenuKey } = event.data.payload;
      if (!sampleData || !sampleData.id || !contextMenuKey) return;
      setContentStep({
        step: 2,
        data: sampleData,
      });
      createAnimation(sampleData);
      // TODO: need to add classname on the animation data.
      return;
    }

    // preview animation
    if (event.data.type === "WCF_AB_PREVIEW_ANIMATION") {
      const { wcfAnimId } = event.data.payload;
      if (!wcfAnimId) return;
      // filter animation by id
      const filteredAnimation = Object.entries(allAnimation).reduce(
        (acc, [key, value]) => {
          const matched = value?.find((anim) => anim.id === wcfAnimId);
          if (matched) {
            acc[key] = [matched];
          }
          return acc;
        },
        {}
      );
      if (Object.keys(filteredAnimation).length === 0) return;
      const iframe = document.getElementById(
        "wcf--animation-builder--animation--preview"
      );
      const win = iframe.contentWindow;
      win.postMessage({ "wcf-animation-config": filteredAnimation });
      return;
    }

    // copy animation
    if (event.data.type === "WCF_AB_COPY_ANIMATION") {
      const { wcfAnimId } = event.data.payload;
      if (!wcfAnimId) return;
      // generate new id for copied animation
      const newUniqueAnimId = generateUniqueId();
      // filter animation by id
      const filteredAnimation = Object.entries(allAnimation).reduce(
        (acc, [key, value]) => {
          const matched = value?.find((anim) => anim.id === wcfAnimId);
          if (matched) {
            matched["id"] = newUniqueAnimId;
            acc[key] = [matched];
          }
          return acc;
        },
        {}
      );
      handleCopyText(JSON.stringify(filteredAnimation));
      return;
    }

    // paste animation
    // TODO: paste can be either add new animation or override existing animation
    if (event.data.type === "WCF_AB_PASTE_ANIMATION") {
      console.log("Implement paste animation functionality");
      // const { wcfAnimId } = event.data.payload;
      // if (!wcfAnimId) return;
      // // generate new id for copied animation
      // const newUniqueAnimId = generateUniqueId();
      // // filter animation by id
      // const filteredAnimation = Object.entries(allAnimation).reduce(
      //   (acc, [key, value]) => {
      //     const matched = value?.find((anim) => anim.id === wcfAnimId);
      //     if (matched) {
      //       matched.id = newUniqueAnimId;
      //       acc[key] = [matched];
      //     }
      //     return acc;
      //   },
      //   {}
      // );
      // handleCopyText(JSON.stringify(filteredAnimation));
      return;
    }

    // delete animation
    if (event.data.type === "WCF_AB_DELETE_ANIMATION") {
      const { wcfAnimId } = event.data.payload;
      if (!wcfAnimId) return;
      deleteAnimation(wcfAnimId);
    }
  };

  // context menu event helper
  useEffect(() => {
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [createAnimation, setContentStep, allAnimation, deleteAnimation]);

  return (
    <div className="bg-background h-full flex flex-col justify-between relative">
      {contentStep?.step === 1 && (
        <div className="p-3 border-b border-border">
          <DropdownMenu>
            <DropdownMenuTrigger asChild id="wcf-n-anim-trigger">
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
                    title: "Free Animation",
                    type: "free_animation",
                    enable: true,
                  };
                  setContentStep({
                    step: 2,
                    data: sampleData,
                  });
                  createAnimation(sampleData);
                }}
              >
                Free Animation Presets
              </DropdownMenuItem>
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
