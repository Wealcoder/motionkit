import ToolTipWrapper from "@/components/common/ToolTipWrapper";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const triggerTypes = [
  { title: "On Scroll", value: "on_scroll" },
  { title: "On Page Load", value: "page_load" },
  { title: "Hover", value: "hover" },
  { title: "Click", value: "click" },
];

const AnimationTriggerType = ({
  onChange = () => {},
  value = "on_scroll",
  removedKeys = [],
}) => {
  let availableKeys = [];

  // filtering removed key if needed.
  if (Array?.isArray(removedKeys) && removedKeys?.length) {
    availableKeys = removedKeys?.filter((key) =>
      triggerTypes?.some((type) => type?.value !== key)
    );
  } else {
    availableKeys = triggerTypes;
  }

  return (
    <div className="grid grid-cols-2 gap-2 justify-between items-center">
      <div className="flex items-center gap-1">
        <h3 className="text-xs text-text-2 capitalize">Trigger Type</h3>
        <ToolTipWrapper text={"Select the trigger type"} />
      </div>
      <div className="flex items-center gap-1.5">
        <div className="flex-1">
          <Select value={value} onValueChange={(value) => onChange(value)}>
            <SelectTrigger className="min-w-[90px]">
              <SelectValue placeholder="Select type" className="line-clamp-1" />
            </SelectTrigger>
            <SelectContent className="min-w-[90px]">
              <SelectGroup>
                {availableKeys?.map((type, index) => (
                  <SelectItem
                    key={index}
                    placeholder="Select type"
                    className="line-clamp-1"
                    value={type?.value}
                  >
                    {type?.title}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};

export default AnimationTriggerType;
