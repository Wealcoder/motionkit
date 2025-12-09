import ToolTipWrapper from "@/components/common/ToolTipWrapper";
import { Input } from "@/components/ui/input";

const AnimationDuration = ({ onChange = () => {}, value = "0.3s" }) => {
  return (
    <div className="grid grid-cols-2 gap-2 justify-between items-center">
      <div className="flex items-center gap-1">
        <h3 className="text-xs text-text-2 capitalize">Duration</h3>
        <ToolTipWrapper text={"Animation duration in seconds"} />
      </div>
      <div className="flex items-center gap-1.5">
        <div className="flex-1">
          <Input
            type="number"
            value={Number(value?.replace("s", ""))}
            min={0.3}
            step={0.1}
            onChange={(e) => {
              const value = Number(e.target.value || 0.5);
              onChange(`${value}s`);
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default AnimationDuration;
