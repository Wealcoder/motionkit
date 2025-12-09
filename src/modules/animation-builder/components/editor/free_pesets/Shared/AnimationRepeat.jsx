import ToolTipWrapper from "@/components/common/ToolTipWrapper";
import { Input } from "@/components/ui/input";

const AnimationRepeat = ({ onChange = () => {}, value = 0 }) => {
  return (
    <div className="grid grid-cols-2 gap-2 justify-between items-center">
      <div className="flex items-center gap-1">
        <h3 className="text-xs text-text-2 capitalize">Repeat</h3>
        <ToolTipWrapper text={"Add the class name of the video element"} />
      </div>
      <div className="flex items-center gap-1.5">
        <div className="flex-1">
          <Input
            type="number"
            value={value ?? 0}
            min={0}
            step={1}
            onChange={(e) => {
              const value = Number(e.target.value || 0);
              onChange(value);
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default AnimationRepeat;
