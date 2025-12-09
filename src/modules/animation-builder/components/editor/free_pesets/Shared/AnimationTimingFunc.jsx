import ToolTipWrapper from "@/components/common/ToolTipWrapper";
import {
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Select } from "@radix-ui/react-select";

const easeConfig = [
  { title: "Ease", value: "ease" },
  { title: "Linear", value: "linear" },
  { title: "Ease In", value: "ease-in" },
  { title: "Ease Out", value: "ease-out" },
  { title: "Ease In Out", value: "ease-in-out" },
  {
    title: "Subtle",
    value:
      "linear(0, 0.417 25.5%, 0.867 49.4%, 1 57.7%, 0.925 65.1%, 0.908 68.6%, 0.902 72.2%, 0.916 78.2%, 0.988 92.1%, 1)",
  },
  {
    title: "Expo",
    value: "cubic-bezier(0.9, 0, 0.1, 1)",
  },
  {
    title: "Quart",
    value: "cubic-bezier(0.78, 0, 0.22, 1)",
  },
];

const AnimationTimingFunc = ({ onChange = () => {}, value = "ease" }) => {
  return (
    <div className="grid grid-cols-2 gap-2 justify-between items-center">
      <div className="flex items-center gap-1">
        <h3 className="text-xs text-text-2 capitalize">Ease</h3>
        <ToolTipWrapper text={"Select the animation timinig function."} />
      </div>
      <div className="flex items-center gap-1.5">
        <div className="flex-1">
          <Select
            value={value ?? "ease"}
            onValueChange={(value) => onChange(value)}
          >
            <SelectTrigger className="min-w-[90px]">
              <SelectValue placeholder="Ease" className="line-clamp-1" />
            </SelectTrigger>
            <SelectContent className="min-w-[90px]">
              <SelectGroup>
                {easeConfig?.map((el) => (
                  <SelectItem key={el} value={el?.value}>
                    {el?.title}
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

export default AnimationTimingFunc;
