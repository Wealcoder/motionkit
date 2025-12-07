import { IconPlay } from "@/lib/icons";
import { Button, buttonVariants } from "../ui/button";
import {
  useAnimationControl,
  useContentStep,
  usePageConfig,
} from "@/hooks/app.hooks";
import { toast } from "sonner";
import DeleteConfirmDialog from "../common/DeleteConfirmDialog";
import { cn } from "@/lib/utils";
import { RiResetRightLine } from "react-icons/ri";
import { useState } from "react";
import { generateFreeAnimCSS } from "@/lib/freeAnimHelper";

const EditorFooter = () => {
  const { contentStep, setContentStep } = useContentStep();
  const { updateAnimation, allAnimation, setAllAnimation } =
    useAnimationControl();
  const { pageConfig } = usePageConfig();
  const [activeReset, setActiveReset] = useState(false);
  const params = new URLSearchParams(window.location.search);

  const showPreview = () => {
    setActiveReset(true);
    const iframe = document.getElementById(
      "wcf--animation-builder--animation--preview"
    );
    const win = iframe.contentWindow;
    win.postMessage({ "wcf-animation-config": allAnimation });
  };
  const resetPreview = () => {
    setActiveReset(false);
    const iframe = document.getElementById(
      "wcf--animation-builder--animation--preview"
    );
    if (iframe) {
      const win = iframe.contentWindow;
      win.postMessage({ "wcf-animation-config-reset": true });
    }
  };

  const deleteAllAnimation = async () => {
    try {
      await fetch(pageConfig.ajaxurl, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Accept: "application/json",
        },
        body: new URLSearchParams({
          action: "wcf_anim_builder_configs_delete",
          pageTypeConfigs: JSON.stringify(pageConfig.pageTypeConfigs),
          wcf_nonce: pageConfig.nonce,
        }),
      })
        .then((response) => {
          return response.json();
        })
        .then((return_content) => {
          setAllAnimation([]);
          toast("Animation Delete Successfully");
        });
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <>
      <div className="p-3 border-t border-border">
        {activeReset ? (
          <Button variant="play" size="play" onClick={() => resetPreview()}>
            <RiResetRightLine /> Reply
          </Button>
        ) : (
          <Button variant="play" size="play" onClick={() => showPreview()}>
            <IconPlay /> Play
          </Button>
        )}
      </div>
      {contentStep.step > 1 ? (
        <div className="p-3 pb-4 border-t border-border flex justify-between items-center gap-1.5">
          <div>
            <a
              href={params.get("builder_url")}
              target="_blank"
              className={cn(
                buttonVariants({ variant: "secondary" }),
                "py-[5px] no-underline"
              )}
            >
              Preview
            </a>
          </div>
          <div className="flex items-center gap-1.5">
            <Button
              variant="secondary"
              className="py-[5px]"
              onClick={() =>
                setContentStep(
                  contentStep.step === 1
                    ? { step: 1, data: {} }
                    : { step: contentStep.step - 1, data: {} }
                )
              }
            >
              Go Back
            </Button>
            <Button className="px-4 py-[5px]" onClick={() => updateAnimation()}>
              Save
            </Button>
          </div>
        </div>
      ) : (
        <div className="p-3 pb-4 border-t border-border flex justify-between items-center gap-1.5">
          <div>
            <a
              href={params.get("builder_url")}
              target="_blank"
              className={cn(
                buttonVariants({ variant: "secondary" }),
                "py-[5px] no-underline"
              )}
            >
              Preview
            </a>
          </div>
          <DeleteConfirmDialog
            className="flex justify-center items-center cursor-pointer"
            deleteFn={deleteAllAnimation}
            id={"hi-wcf"}
          >
            <Button className="px-4 py-[5px]">Delete All Animation</Button>
          </DeleteConfirmDialog>
        </div>
      )}
    </>
  );
};

export default EditorFooter;
