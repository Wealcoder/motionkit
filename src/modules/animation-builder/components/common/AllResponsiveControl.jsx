import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useAnimationControl } from "@/hooks/app.hooks";
import {
  ComputerIcon,
  LaptopIcon,
  SmartPhone01Icon,
  Tablet01Icon,
} from "@hugeicons/core-free-icons/index";
import { HugeiconsIcon } from "@hugeicons/react";
import { useEffect, useState } from "react";

const AllResponsiveControl = ({ id }) => {
  const { updateResponsive, allAnimation } = useAnimationControl();

  const deviceKeys = ["desktop", "laptop", "tab_land", "tab", "mobile"];

  const [allowDevice, setAllowDevice] = useState({});

  useEffect(() => {
    const initial = {};
    deviceKeys.forEach((device) => {
      const found = allAnimation[device]?.find((el) => el.id === id);
      initial[device] = found?.enable ?? true;
    });
    setAllowDevice(initial);
  }, []);

  return (
    <Accordion type="single" collapsible className="w-full p-3">
      <AccordionItem value="item-1">
        <AccordionTrigger>Responsive Control</AccordionTrigger>
        <AccordionContent className="pb-0 mt-5 flex flex-col gap-4">
          <div className="flex items-center justify-between gap-2 mt-2">
            <Label htmlFor="desktop-enable" className="flex items-center gap-2">
              Desktop <HugeiconsIcon icon={ComputerIcon} size={14} />
            </Label>
            <Switch
              id="desktop-enable"
              checked={allowDevice?.desktop}
              onCheckedChange={(value) => {
                setAllowDevice((prev) => ({ ...prev, desktop: value }));
                updateResponsive(id, "desktop", value);
              }}
            />
          </div>
          <div className="flex items-center justify-between gap-2 mt-2">
            <Label htmlFor="laptop-enable" className="flex items-center gap-2">
              Laptop <HugeiconsIcon icon={LaptopIcon} size={14} />
            </Label>
            <Switch
              id="laptop-enable"
              checked={allowDevice?.laptop}
              onCheckedChange={(value) => {
                setAllowDevice((prev) => ({ ...prev, laptop: value }));
                updateResponsive(id, "laptop", value);
              }}
            />
          </div>
          <div className="flex items-center justify-between gap-2 mt-2">
            <Label
              htmlFor="tab_land-enable"
              className="flex items-center gap-2"
            >
              Tablet Landscape{" "}
              <HugeiconsIcon icon={Tablet01Icon} rotate={90} size={14} />
            </Label>
            <Switch
              id="tab_land-enable"
              checked={allowDevice?.tab_land}
              onCheckedChange={(value) => {
                setAllowDevice((prev) => ({ ...prev, tab_land: value }));
                updateResponsive(id, "tab_land", value);
              }}
            />
          </div>
          <div className="flex items-center justify-between gap-2 mt-2">
            <Label htmlFor="tab-enable" className="flex items-center gap-2">
              Tablet <HugeiconsIcon icon={Tablet01Icon} size={14} />
            </Label>
            <Switch
              id="tab-enable"
              checked={allowDevice?.tab}
              onCheckedChange={(value) => {
                setAllowDevice((prev) => ({ ...prev, tab: value }));
                updateResponsive(id, "tab", value);
              }}
            />
          </div>
          <div className="flex items-center justify-between gap-2 mt-2">
            <Label htmlFor="mobile-enable" className="flex items-center gap-2">
              Mobile <HugeiconsIcon icon={SmartPhone01Icon} size={14} />
            </Label>
            <Switch
              id="mobile-enable"
              checked={allowDevice?.mobile}
              onCheckedChange={(value) => {
                setAllowDevice((prev) => ({ ...prev, mobile: value }));
                updateResponsive(id, "mobile", value);
              }}
            />
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};

export default AllResponsiveControl;
