import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

const GRID = [
  { id: "tl", x: "0%", y: "0%" },
  { id: "tc", x: "50%", y: "0%" },
  { id: "tr", x: "100%", y: "0%" },
  { id: "cl", x: "0%", y: "50%" },
  { id: "cc", x: "50%", y: "50%" },
  { id: "cr", x: "100%", y: "50%" },
  { id: "bl", x: "0%", y: "100%" },
  { id: "bc", x: "50%", y: "100%" },
  { id: "br", x: "100%", y: "100%" },
];

const TransformOriginGrid = ({ value, onChange }) => {
  return (
    <RadioGroup
      value={value}
      onValueChange={onChange}
      className="
        grid grid-cols-3 gap-3
        bg-[#18181B]
        p-3 rounded-md
      "
    >
      {GRID.map((item) => {
        const cssValue = `${item.x} ${item.y}`;

        return (
          <RadioGroupItem
            key={item.id}
            value={cssValue}
            className="data-[state=checked]:border-[#3B82F6] data-[state=checked]:bg-[#3B82F6]
              "
          />
        );
      })}
    </RadioGroup>
  );
};

export default TransformOriginGrid;
