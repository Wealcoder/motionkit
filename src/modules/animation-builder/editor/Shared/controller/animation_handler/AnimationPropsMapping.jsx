import { useCallback } from "react";
import { getValueFromPath, setValueByPath } from "@/lib/animations/animations";
import TextField from "@/components/animations/TextField";
import NumberField from "@/components/animations/NumberField";
import NumberField2 from "@/components/animations/NumberField2";
import ClassSelectionField from "@/components/animations/ClassSelectionField";
import ColorPickerField from "@/components/animations/ColorPickerField";
import GradientColorPickerField from "@/components/animations/GradientPickerField";
import RotationField from "@/components/animations/RotationField";
import SelectField from "@/components/animations/SelectField";
import SliderField from "@/components/animations/SliderField";
import SwitchField from "@/components/animations/SwitchField";
import CodeblockField from "@/components/animations/CodeblockField";
import RepeatField from "@/components/animations/RepeatField";
import WidthHeightField from "@/components/animations/WidthHeightField";
import TabsFields from "@/components/animations/TabsField";

// listing all animation properties types.
export const FIELD_COMPONENTS = {
  "text-field": TextField,
  "number-field": NumberField,
  "number-field-2": NumberField2,
  "class-selector-field": ClassSelectionField,
  "code-block-field": CodeblockField,
  "color-picker": ColorPickerField,
  "gradient-color-picker": GradientColorPickerField,
  "rotation-field": RotationField,
  "select-field": SelectField,
  "slider-field": SliderField,
  "switch-field": SwitchField,
  "repeat-field": RepeatField,
  "height-field": WidthHeightField,
  "width-field": WidthHeightField,
  "tabs-field": TabsFields,
};

const AnimationPropsMapping = React.memo(
  ({
    property = {},
    defaultData = {},
    contentStep = {},
    updateContentData = () => {},
  }) => {
    const { path = null, fieldType = null } = property || {};
    if (!path || !fieldType) return null;

    const handleSetValueByPath = useCallback(
      (value) => {
        console.log(`Current Path: ${property?.path} | Value => ${value}`);
        const newData = structuredClone(defaultData);
        setValueByPath(newData, path, value);
        updateContentData({
          ...contentStep,
          data: { ...contentStep.data, ...newData },
        });
      },
      [defaultData, path, contentStep, updateContentData],
    );

    const handleDeleteField = useCallback(() => console.log("Deleted"), []);
    const handleDisabledUpdate = useCallback(() => console.log("Disabled"), []);
    const value = getValueFromPath(defaultData, path) ?? "";

    // finding out animation properties field by field types
    const FieldComponent = FIELD_COMPONENTS[fieldType];
    if (!FieldComponent) return null;

    // dynamically pass props
    const commonProps = {
      property,
      value,
      onDelete: handleDeleteField,
      onDisabledUpdate: handleDisabledUpdate,
      onValueChange: handleSetValueByPath,
    };

    // tabs-field needs extra props
    if (fieldType === "tabs-field") {
      return (
        <FieldComponent
          {...commonProps}
          contentStep={contentStep}
          updateContentData={updateContentData}
        />
      );
    }

    return <FieldComponent {...commonProps} />;
  },
  (prev, next) => prev?.contentStep === next?.contentStep,
);

export default AnimationPropsMapping;
