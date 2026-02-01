import WCFABLabel from "@/components/animations/blocks/WCFABLabel";
import WCFABDeleteBtn from "@/components/animations/blocks/WCFABDeleteBtn";
import WCFABRadio from "./blocks/WCFABRadio";

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
    path = "",
    isRequired = false,
    isCustomAnim = true,
    ...rest
  } = property || {};

  const handleChange = (selectedValue) => {
    console.log(selectedValue);
    onValueChange(selectedValue);
  };

  return (
    <div className="w-64 h-7 p-0.5">
      <div className="flex flex-col justify-between mx-auto rounded-lg sm:flex-row sm:items-center">
        {/* left label + tooltip */}
        <WCFABLabel title={title} tooltipContent={tooltipContent} />

        {/* right radio + delete button */}
        <div className="flex items-center gap-3 w-44.5 h-4.5">
          <WCFABRadio defaultValue={value} handleChange={handleChange} />
          
          {/* delete button */}
          {isCustomAnim && <WCFABDeleteBtn onDelete={onDelete} />}
        </div>
      </div>

      {/* required message */}
      {isRequired && isDataValid && (
        <p className="text-white text-sm">Field is Required</p>
      )}
    </div>
  );
};

export default DirectionField;
