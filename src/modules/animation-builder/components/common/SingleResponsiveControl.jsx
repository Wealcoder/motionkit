import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useAnimationControl, useDeviceConfig } from "@/hooks/app.hooks";
import { Laptop, Monitor, Smartphone, Tablet } from "lucide-react";
import { useState } from "react";

const ResponsiveIcons = {
  desktop: <Monitor size={14} />,
  laptop: <Laptop size={14} />,
  tab_land: <Tablet style={{ rotate: "90deg" }} size={14} />,
  tab: <Tablet size={14} />,
  mobile: <Smartphone size={14} />,
};

const SingleResponsiveControl = ({ id }) => {
  const { updateResponsive, allAnimation } = useAnimationControl();
  const { selectedDevice } = useDeviceConfig();

  const [allowDevice, setAllowDevice] = useState(
    allAnimation[selectedDevice]?.find((el) => el.id === id)?.enable
  );

  return (
    <div className="w-full p-3">
      <div className="flex items-center justify-between gap-2 mt-2">
        <Label
          htmlFor={`${selectedDevice}-enable-single`}
          className="flex items-center gap-2"
        >
          Animation On/Off {ResponsiveIcons[selectedDevice]}
        </Label>
        <Switch
          id={`${selectedDevice}-enable-single`}
          checked={allowDevice}
          onCheckedChange={(value) => {
            setAllowDevice(value);
            updateResponsive(id, selectedDevice, value);
          }}
        />
      </div>
    </div>
  );
};

export default SingleResponsiveControl;
