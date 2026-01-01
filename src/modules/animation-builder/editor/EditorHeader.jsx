import Brand from "./Shared/header/left/Brand";
import Structure from "./Shared/header/left/Structure";
import ActivateBorderBtn from "./Shared/header/left/ActivateBorderBtn";
import History from "./Shared/header/left/History";
import Help from "./Shared/header/left/Help";
import Others from "./Shared/header/right/Others";
import ResponsiveControl from "./Shared/header/center/ResponsiveControl";
import Search from "./Shared/header/right/Search";
import DraftAnimation from "./Shared/header/right/DraftAnimation";
import SavedAnimation from "./Shared/header/right/SavedAnimation";
import GlobalSettings from "./Shared/header/right/GlobalSettings";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { cn } from "@/lib/utils";
import { useAnimationControl, useDeviceConfig } from "@/hooks/app.hooks";

import { useEffect, useState } from "react";

const EditorHeader = () => {
  const [activeStructure, setActiveStructure] = useState(true);
  const { updateAnimation } = useAnimationControl();

  const previewUrl = new URL(WCF_ANIMATION_BUILDER.iframe_url);
  previewUrl.searchParams.delete("action");

  useEffect(() => {
    const structure = localStorage.getItem("aae_selected_structure");
    if (structure) {
      const parsed = structure === "true";
      setActiveStructure(parsed);
      updateActiveStructure(parsed);
    }
    const border = localStorage.getItem("aae_selected_border");
    if (border) {
      const parsed = border === "true";
    }
  }, []);

  useEffect(() => {
    const handleMessage = (event) => {
      if (event.data?.type === "PANEL_STRUCTURE") {
        setActiveStructure(event.data?.payload?.value);
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  const updateActiveStructure = (value) => {
    const iframe = document.getElementById(
      "wcf--animation-builder--animation--preview"
    );
    setActiveStructure(value);
    localStorage.setItem("aae_selected_structure", value);
    if (iframe) {
      const win = iframe.contentWindow;
      win.postMessage({ aae_show_structure: value });
    }
  };

  return (
    <div className="max-h-[66px] w-full grid grid-cols-3 bg-background px-[18px] py-[9px] z-[999999]">
      {/* left side */}
      <div className="flex justify-start items-center gap-10">
        <Brand />
        {/* left side controller */}
        <div className="flex justify-between items-center gap-2">
          <Structure />
          <ActivateBorderBtn />
          <History />
          <Help />
        </div>
      </div>
      {/* center */}
      <div className="flex justify-center items-center gap-2">
        <ResponsiveControl />
      </div>
      {/* right side */}
      <div className="flex justify-end items-center gap-2">
        <Search />
        <DraftAnimation />
        <SavedAnimation />
        <GlobalSettings />
        <Others />
      </div>
      {/* <div className="flex items-center gap-2">




      <div className="flex items-center gap-4">
        <div
          dangerouslySetInnerHTML={{
            __html: AAEAnimBuilder.hooks.applyFilters("top_bar_button", ""),
          }}
        ></div>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="h-4 w-4 bg-transparent hover:bg-transparent [&_svg]:size-3">
              <IconCross />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader className={"hidden"}>
              <DialogTitle></DialogTitle>
              <DialogDescription></DialogDescription>
            </DialogHeader>
            <div>
              <p className="text-sm">Do you want to close this</p>
            </div>
            <DialogFooter>
              <a
                href={previewUrl}
                className={cn(
                  buttonVariants({ variant: "secondary" }),
                  "no-underline"
                )}
                onClick={() => updateAnimation()}
              >
                Save & Close
              </a>

              <DialogClose asChild>
                <a
                  href={previewUrl}
                  className={cn(buttonVariants(), "no-underline")}
                >
                  Discard Change
                </a>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div> */}
    </div>
  );
};

export default EditorHeader;
