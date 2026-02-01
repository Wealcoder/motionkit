import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SwitchField from "@/components/animations/SwitchField";

import WCFABNumberInput from "@/components/animations/blocks/WCFABNumberInput";
import WCFABSlider from "@/components/animations/blocks/WCFABSlider";

import { HugeiconsIcon } from "@hugeicons/react";
import {
  ComputerIcon,
  LaptopIcon,
  SmartPhone01Icon,
  Tablet02Icon,
} from "@hugeicons/core-free-icons";

import { cn } from "@/lib/utils";

// Devices data
const DEVICES = [
  {
    key: "desktop",
    label: "Desktop",
    icon: <HugeiconsIcon icon={ComputerIcon} size={15} strokeWidth={2} />,
  },
  {
    key: "laptop",
    label: "Laptop",
    icon: <HugeiconsIcon icon={LaptopIcon} size={15} strokeWidth={2} />,
  },
  {
    key: "tablet",
    label: "Tablet",
    icon: <HugeiconsIcon icon={Tablet02Icon} size={15} strokeWidth={2} />,
  },
  {
    key: "mobile",
    label: "Mobile",
    icon: <HugeiconsIcon icon={SmartPhone01Icon} size={15} strokeWidth={2} />,
  },
];

// slider min and max value range
const MIN_VALUE = 0.5;
const MAX_VALUE = 3;
const STEP = 0.05;

const ScrollSmother = () => {
  const [config, setConfig] = useState({
    enableScrollSmother: true,
    configuration: {
      desktop: { enable: true, value: 1 },
      laptop: { enable: true, value: 1 },
      tablet: { enable: true, value: 1 },
      mobile: { enable: true, value: 1 },
    },
  });
  const [selectedDevice, setSelectedDevice] = useState("desktop");

  // derived state
  const isGlobalEnabled = config.enableScrollSmother;

  // Smooth Scroll toggle switch handler
  const toggleGlobalSwitch = (value) => {
    setConfig((prev) => {
      const next = { ...prev };
      next.enableScrollSmother = value;
      for (let device in next.configuration) {
        const deviceValue = next.configuration[device];
        next.configuration[device] = { ...deviceValue, enable: value };
      }
      return next;
    });
  };

  // device toggle switch handler
  const toggleDevice = (value) => {
    setConfig((prev) => ({
      ...prev,
      configuration: {
        ...prev.configuration,
        [selectedDevice]: {
          ...prev.configuration[selectedDevice],
          enable: value,
        },
      },
    }));
  };

  const updateValue = (value) => {
    setConfig((prev) => ({
      ...prev,
      configuration: {
        ...prev.configuration,
        [selectedDevice]: {
          ...prev.configuration[selectedDevice],
          value,
        },
      },
    }));
  };

  return (
    <div className="flex flex-col gap-[15px] p-3 bg-background-topbar rounded-5">
      <SwitchField
        property={{
          title: "Scroll Smother",
          tooltipContent: "",
        }}
        value={true}
        onValueChange={toggleGlobalSwitch}
      />

      {isGlobalEnabled && (
        <Tabs
          defaultValue={selectedDevice}
          onValueChange={(deviceKey) => setSelectedDevice(deviceKey)}
          className="p-0 min-w-0 w-full"
        >
          <TabsList className="inline-flex p-1 justify-between gap-1.5 bg-background-sidebar rounded-5">
            {DEVICES?.map((device) => (
              <TabsTrigger
                key={device?.key}
                value={device.key}
                className={
                  "w-full gap-1.5 bg-transparent hover:bg-button-hover focus:bg-button-action data-[state=active]:bg-button text-xs text-foreground font-inter font-normal leading-5 tracking-tighter border-none outline-none focus-within:ring-0 focus-visible:!border-none focus-visible:!outline-none focus-visible:ring-offset-0 focus-visible:ring-0 data-[state=active]:ring-offset-0 data-[state=active]:ring-0 data-[state=active]:border-none data-[state=active]:outline-none cursor-pointer"
                }
              >
                {device?.icon ?? null}
                {device?.label ?? ""}
              </TabsTrigger>
            ))}
          </TabsList>
          {DEVICES?.map((device) => {
            const scrollsmotherValue = config.configuration[device?.key]?.value;
            return (
              <TabsContent
                key={device?.key}
                value={device.key}
                className={cn(
                  " min-w-0 mt-5 overflow-auto",
                  selectedDevice === device?.key
                    ? "flex flex-col gap-5 "
                    : "none",
                )}
              >
                <SwitchField
                  property={{
                    title: `Enable On ${device?.label}`,
                    tooltipContent: "",
                    titleLength: "full",
                  }}
                  value={true}
                  onValueChange={toggleDevice}
                />
                <span className="text-xss text-foreground font-normal leading-4.25 tracking-normal">
                  Set the scroll smother level
                </span>
                <div className="grid grid-cols-[165px,1fr] gap-5">
                  <WCFABSlider
                    property={{
                      min: MIN_VALUE,
                      max: MAX_VALUE,
                      step: STEP,
                    }}
                    value={scrollsmotherValue}
                    onValueChange={updateValue}
                  />
                  <WCFABNumberInput
                    property={{
                      min: MIN_VALUE,
                      max: MAX_VALUE,
                      step: STEP,
                      size: "sm",
                    }}
                    value={scrollsmotherValue}
                    onValueChange={updateValue}
                  />
                </div>
              </TabsContent>
            );
          })}
        </Tabs>
      )}
    </div>
  );
};

export default ScrollSmother;
