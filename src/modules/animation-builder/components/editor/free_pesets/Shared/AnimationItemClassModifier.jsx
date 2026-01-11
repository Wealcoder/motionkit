import ToolTipWrapper from "@/components/common/ToolTipWrapper";
import { Input } from "@/components/ui/input";

const TextInput = ({
  onChange = () => {},
  value = "",
  title = "Item Class",
}) => {
  return (
    <div className="grid grid-cols-2 gap-2 justify-between items-center">
      <div className="flex items-center gap-1">
        <h3 className="text-xs text-text-2 capitalize">
          {title ?? "Item Class"}
        </h3>
        <ToolTipWrapper text={"Add the class name of the video element"} />
      </div>
      <div className="flex items-center gap-1.5">
        <div className="flex-1">
          <Input
            value={value ?? ""}
            onChange={(e) => onChange(e.target.value)}
            placeholder="add value"
          />
        </div>
      </div>
    </div>
  );
};

export default TextInput;
