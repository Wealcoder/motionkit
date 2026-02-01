import WCFABLabel from "@/components/animations/blocks/WCFABLabel";
import WCFABDeleteBtn from "@/components/animations/blocks/WCFABDeleteBtn";

import { RadioGroup } from "../ui/radio-group";
import WCFABRadio from "@/components/animations/blocks/WCFABRadio";

const radioGroupItems = [
  { key: "drawin", label: "Draw In" },
  { key: "drawout", label: "Draw Out" },
];

const DirectionField = (
  property = {},
  value = "drawin",
  onValueChange = () => {},
  onDisabledUpdate = () => {},
  onDelete = () => {},
) => {
  const {
    title = "Direction",
    tooltipContent = "Choose animation direction",
    isRequired = false,
    isCustomAnim = true,
  } = property || {};

  const handleChange=(newValue)=>{
    onValueChange(newValue)
  }

  return (
    <div className="w-64 h-7 p-0.5">
      <div className="flex flex-col md:flex-row justify-between">
        {/* label */}
        <WCFABLabel title={title} tooltipContent={tooltipContent} />

        {/* radios */}
        <div className="flex items-center gap-3 w-44.5 h-4.5">
          <RadioGroup
            defaultValue={value}
            onValueChange={handleChange}
            className="grid grid-cols-2 gap-2.5"
          >
            {radioGroupItems.map((item) => (
              <WCFABRadio
                key={item.key}
                value={item.key}
                label={item.label}
                id={item.key}
              />
            ))}
          </RadioGroup>

          {isCustomAnim && <WCFABDeleteBtn onDelete={onDelete} />}
        </div>
      </div>
    </div>
  );
};

export default DirectionField;
