import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

import { HugeiconsIcon } from "@hugeicons/react";
import { Globe02Icon } from "@hugeicons/core-free-icons";
import GlobalSettingModal from "@/editor/Shared/header/right/GlobalSettings/GlobalSettings";
import { CancelCircleIcon } from "@hugeicons/core-free-icons/index";

const GlobalSettingsTrigger = () => {
  return (
    <AlertDialog open={true}>
      <AlertDialogTrigger asChild>
        <Button className="wcf-ab-button-general wcf-ab-button-primary h-[1.75rem] py-1 !text-xs">
          <HugeiconsIcon icon={Globe02Icon} size={16} strokeWidth={2} />
          Global Settings
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="min-h-[663px] min-w-[573px] max-w-[573px] flex flex-col gap-0 p-0 rounded-5 bg-background-sidebar">
        <GlobalSettingModal />
        <AlertDialogFooter className={"px-[15px] pb-[15px]"}>
          <AlertDialogAction className="min-w-[72px] bg-button hover:bg-button-destructive active:bg-button-destructive-hover !text-foreground font-normal text-xss leading-4.25 tracking-tighter border-none outline-none focus-within:ring-0">
            <HugeiconsIcon icon={CancelCircleIcon} strokeWidth={2} />
            Close
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default GlobalSettingsTrigger;
