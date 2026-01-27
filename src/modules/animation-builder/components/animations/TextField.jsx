import WCFABDeleteBtn from "@/components/animations/blocks/WCFABDeleteBtn";
import WCFABLabel from "@/components/animations/blocks/WCFABLabel";
import WCFABTextInput from "@/components/animations/blocks/WCFABTextInput";
import WCFABErrorMessage from "@/components/animations/blocks/WCFABErrorMessage";

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
        <div className={"flex justify-between items-center gap-2"}>
          <WCFABTextInput
            size={size}
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
