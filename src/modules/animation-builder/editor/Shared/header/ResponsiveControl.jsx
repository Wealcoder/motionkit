import { Button } from "@/components/ui/button";
import {
  Tooltip,
  ToolTipArrow,
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
import { useDeviceConfig } from "@/hooks/app.hooks";

// CHECK: Remove this later (here tab_land removed )
const ResponsiveIcons = {
  desktop: <HugeiconsIcon icon={ComputerIcon} />,
  laptop: <HugeiconsIcon icon={LaptopIcon} />,
  tab_land: (
    <HugeiconsIcon
      icon={Tablet01Icon}
      style={{ transform: "rotate(270deg)" }}
    />
  ),
  tab: <HugeiconsIcon icon={Tablet01Icon} />,
  mobile: <HugeiconsIcon icon={SmartPhone01Icon} />,
};

const ResponsiveControl = () => {
  const { selectedDevice, setSelectedDevice } = useDeviceConfig();
  return (
    <div className="flex items-center justify-center gap-4">
      {WCF_ANIMATION_BUILDER?.device_config?.map((device) => (
        <TooltipProvider delayDuration={100} key={device.key}>
          <Tooltip delayDuration={100}>
            <TooltipTrigger asChild>
              <Button
                onClick={() => setSelectedDevice(device.key)}
                className={cn(
                  selectedDevice === device?.key
                    ? "bg-button-rd"
                    : "bg-transparent",
                  "h-[36px] w-[36px] border-none rounded-full"
                )}
              >
                {ResponsiveIcons[device.key]}
              </Button>
            </TooltipTrigger>
            <TooltipContent align="center" className="mr-0">
              <p>{device.viewWidth}</p>
              <ToolTipArrow className="fill-[#474852] -mt-[0.5px]" />
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ))}
    </div>
  );
};

export default ResponsiveControl;
