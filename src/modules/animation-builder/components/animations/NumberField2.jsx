import WCFABDeleteBtn from "@/components/animations/blocks/WCFABDeleteBtn";
import WCFABNumInputWithBtn from "@/components/animations/blocks/WCFABNumInputWithBtn";
import WCFABErrorMessage from "@/components/animations/blocks/WCFABErrorMessage";
import WCFABLabel from "@/components/animations/blocks/WCFABLabel";

const NumberField2 = ({
  property = {},
  value = 0,
  onDelete = () => {},
  onDisabledUpdate = () => {},
  onValueChange = () => {},
}) => {
  const {
    size = "sm",
    title = "title",
    tooltipContent = "Enter the value.",
    isRequired = false,
    isCustomAnim = false,
    placeholder = "Add Value",
    min = 0,
    max = 0,
    step = 0.1,
    ...rest
  } = property || {};

  return (
    <div>
      <div className={"flex justify-between items-center"}>
        {/* Label + tooltip */}
        <WCFABLabel size={size} title={title} tooltipContent={tooltipContent} />

        {/* Input + delete */}
        <div className={"flex justify-between items-center gap-2"}>
          <WCFABNumInputWithBtn
            size={size}
            type="number"
            placeholder={placeholder}
            value={value}
            onValueChange={onValueChange}
            min={min}
            max={max}
          />
          {isCustomAnim && <WCFABDeleteBtn onDelete={onDelete} />}
        </div>
      </div>

      {/* required message */}
      {isRequired && isDataValid && (
        <WCFABErrorMessage message={"This field is required"} />
      )}
    </div>
  );
};

export default NumberField2;
