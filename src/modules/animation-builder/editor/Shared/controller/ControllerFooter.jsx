import { useState } from "react";
import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  FullScreenIcon,
  PlayCircleIcon,
  Settings03Icon,
} from "@hugeicons/core-free-icons";
import DeleteConfirmDialog from "../../../components/common/DeleteConfirmDialog";
import { usePageConfig } from "@/hooks/app.hooks";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { ButtonGroup } from "@/components/ui/button-group";

const ControllerFooter = ({
  contentStep = {},
  allAnimation = [],
  setContentStep = () => {},
  updateAnimation = () => {},
  setAllAnimation = () => {},
}) => {
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
    <div className="flex justify-between items-center">
      <Button className="min-h-9 min-w-[135px] px-4 py-2 bg-button-primary text-15 font-medium leading-5 tracking-normal text-white rounded-5 border-none outline-none">
        <HugeiconsIcon icon={FullScreenIcon} strokeWidth={2} />
        Full Preview
      </Button>
      <div className={"flex justify-between items-center gap-2"}>
        <Button
          onClick={() => showPreview()}
          className="min-h-9 min-w-[184px] px-4 py-2 bg-button-action hover:bg-button-action-hover text-15 font-medium leading-5 tracking-normal text-white rounded-5 border-none outline-none"
        >
          <HugeiconsIcon icon={PlayCircleIcon} strokeWidth={2} />
          Play
        </Button>
        <Button
          size="icon"
          className=" bg-button-primary text-white rounded-5 border-none outline-none"
        >
          <HugeiconsIcon icon={Settings03Icon} strokeWidth={2} />
        </Button>
      </div>
    </div>
  );
};

export default ControllerFooter;

{
  /* <div className="p-3 border-t border-border">
  {activeReset ? (
    <Button variant="play" size="play" onClick={() => resetPreview()}>
     Reply
    </Button>
  ) : (
    <Button variant="play" size="play" onClick={() => showPreview()}>
      <HugeiconsIcon icon={PlayCircleIcon} /> Play
    </Button>
  )}
</div>;
{
  contentStep.step > 1 ? (
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
  );
} */
}
