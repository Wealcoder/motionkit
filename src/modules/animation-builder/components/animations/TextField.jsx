import WCFABDeleteBtn from "@/components/animations/blocks/WCFABDeleteBtn";
import WCFABLabel from "@/components/animations/blocks/WCFABLabel";
import WCFABInput from "@/components/animations/blocks/WCFABInput";
import WCFABErrorMessage from "@/components/animations/blocks/WCFABErrorMessage";
import { contentWrapper } from "@/components/animations/shared/style";
import { cn } from "@/lib/utils";

const TextField = ({
  property = {},
  value = "",
  onDelete = () => {},
  onDisabledUpdate = () => {},
  onValueChange = () => {},
}) => {
  const {
    size = "sm",
    title = "title",
    tooltipContent = "Enter the value.",
    placeholder = "Add Value",
    isRequired = false,
    isCustomAnim = false,
  } = property || {};

  return (
    <div>
      <div className={"flex justify-between items-center"}>
        {/* Label + tooltip */}
        <WCFABLabel size={size} title={title} tooltipContent={tooltipContent} />

        {/* Input + delete */}
        <div className={cn(contentWrapper({ size }))}>
          <WCFABInput
            size={size}
            type="text"
            placeholder={placeholder}
            value={value}
            onValueChange={onValueChange}
          />
          {isCustomAnim && <WCFABDeleteBtn onDelete={onDelete} />}
        </div>
      </div>

      {/* Required message */}
      {isRequired && isDataValid && (
        <WCFABErrorMessage message={"This field is required"} />
      )}
    </div>
  );
};

export default TextField;
