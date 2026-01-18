import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ComputerIcon,
  LaptopIcon,
  Tablet01Icon,
  SmartPhone01Icon,
} from "@hugeicons/core-free-icons";
import { cn } from "@/lib/utils";
import { useDeviceConfig, useKernel } from "@/hooks/app.hooks";

const ResponsiveIcons = {
  desktop: (
    <HugeiconsIcon
      icon={ComputerIcon}
      stroke="currentColor"
      strokeWidth={2}
      fill="none"
    />
  ),
  laptop: (
    <HugeiconsIcon
      icon={LaptopIcon}
      stroke="currentColor"
      strokeWidth={2}
      fill="none"
    />
  ),
  tab_land: (
    <HugeiconsIcon
      icon={Tablet01Icon}
      stroke="currentColor"
      strokeWidth={2}
      fill="none"
      style={{ transform: "rotate(270deg)" }}
    />
  ),
  tab: (
    <HugeiconsIcon
      icon={Tablet01Icon}
      stroke="currentColor"
      strokeWidth={2}
      fill="none"
    />
  ),
  mobile: (
    <HugeiconsIcon
      icon={SmartPhone01Icon}
      stroke="currentColor"
      strokeWidth={2}
      fill="none"
    />
  ),
};

const ResponsiveControl = () => {
  const { resetEditorPreview } = useKernel();
  const { selectedDevice, setSelectedDevice } = useDeviceConfig();

  // Setting device configuration and resetting editor preview placement and zoom level
  const handleSetSelectedDevice = (key) => {
    resetEditorPreview();
    setSelectedDevice(key);
  };

  return (
    <div className="flex items-center justify-center gap-4">
      {WCF_ANIMATION_BUILDER?.device_config?.map((device) => (
        <TooltipProvider delayDuration={100} key={device.key}>
          <Tooltip delayDuration={100}>
            <TooltipTrigger asChild>
              <Button
                onClick={() => handleSetSelectedDevice(device.key)}
                className={cn(
                  selectedDevice === device?.key
                    ? "bg-button-primary  text-white"
                    : "bg-transparent hover:bg-button-primary text-[#A1A1AA] hover:text-white",
                  "h-[36px] w-[36px] rounded-full border-none"
                )}
              >
                {ResponsiveIcons[device.key]}
              </Button>
            </TooltipTrigger>
            <TooltipContent align="center" className="mr-0">
              <p>{device.viewWidth}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ))}
    </div>
  );
};

export default ResponsiveControl;
