import React from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TabsContent } from "@/components/ui/tabs";
import ScrollSmother from "@/editor/Shared/header/right/GlobalSettings/ScrollSmother";
import GlobalValue from "@/editor/Shared/header/right/GlobalSettings/GlobalValue";
import ImportExports from "@/editor/Shared/header/right/GlobalSettings/ImportExports";
import PageTransition from "@/editor/Shared/header/right/GlobalSettings/PageTransition";
import { HugeiconsIcon } from "@hugeicons/react";
import { Globe02Icon } from "@hugeicons/core-free-icons";
import { CancelCircleIcon } from "@hugeicons/core-free-icons/index";

const tabs = [
  { key: "scroll_smoother", label: "Scroll Smoother" },
  { key: "import_export", label: "Import / Export" },
  { key: "page_transition", label: "Page Transition" },
  // { key: "global_value", label: "Global Value" }, // todo: hide for future development
];

const GlobalSettingModal = () => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="wcf-ab-button-general wcf-ab-button-primary h-[1.75rem] py-1 !text-xs">
          <HugeiconsIcon icon={Globe02Icon} size={16} strokeWidth={2} />
          Global Settings
        </Button>
      </DialogTrigger>
      <DialogContent
        hideCloseBtn={true}
        className="min-h-[663px] min-w-[573px] max-w-[573px] gap-0 p-0 rounded-5 bg-background-sidebar"
      >
        <Tabs
          defaultValue="scroll_smoother"
          className="grid grid-cols-[179px,393px]"
        >
          {/* Sidebar */}
          <TabsList
            className="h-full flex flex-col justify-start items-start gap-[3px] p-[15px] bg-transparent rounded-none"
            style={{ borderRight: "1px solid var(--foreground-secondary)" }}
          >
            {tabs?.map((tab) => (
              <TabsTrigger
                key={tab.key}
                value={tab.key}
                className={
                  "w-full justify-start py-1.5 px-2 bg-transparent hover:bg-button-hover focus:bg-button-action data-[state=active]:bg-background-topbar text-xs text-foreground font-inter font-normal leading-5 tracking-tighter border-none outline-none focus-within:ring-0 focus-visible:!border-none focus-visible:!outline-none focus-visible:ring-offset-0 focus-visible:ring-0 data-[state=active]:ring-offset-0 data-[state=active]:ring-0 data-[state=active]:border-none data-[state=active]:outline-none cursor-pointer"
                }
              >
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>

          {/* Content */}
          <TabsContent
            value="scroll_smoother"
            className="flex-1 min-w-0 mt-0 p-[15px] overflow-auto"
          >
            <ScrollSmother />
          </TabsContent>
          <TabsContent
            value="global_value"
            className="flex-1 min-w-0 mt-0 m-[15px] overflow-auto"
          >
            <GlobalValue />
          </TabsContent>
          <TabsContent
            value="import_export"
            className="flex-1 min-w-0 mt-0 m-[15px] overflow-auto"
          >
            <ImportExports />
          </TabsContent>
          <TabsContent
            value="page_transition"
            className="flex-1 min-w-0 mt-0 m-[15px] overflow-auto"
          >
            <PageTransition />
          </TabsContent>
        </Tabs>
        <DialogFooter className="absolute right-[15px] bottom-[15px]">
          <DialogClose asChild>
            <Button
              type="button"
              className="w-[72px] h-7 px-2 py-[5px] bg-button hover:bg-button-destructive active:bg-button-destructive-hover !text-foreground font-normal text-xss leading-4.25 tracking-tighter border-none outline-none focus-within:ring-0"
            >
              <HugeiconsIcon icon={CancelCircleIcon} strokeWidth={2} />
              Close
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default GlobalSettingModal;
