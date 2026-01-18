import { useCallback } from "react";
import { getValueFromPath, setValueByPath } from "@/lib/animations/animations";
import TextField from "@/components/animations/TextField";
import NumberField from "@/components/animations/NumberField";
import NumberField2 from "@/components/animations/NumberField2";
import ClassSelectionField from "@/components/animations/ClassSelectionField";
import ColorPickerField from "@/components/animations/ColorPickerField";
import RotationField from "@/components/animations/RotationField";
import SelectField from "@/components/animations/SelectField";
import SliderField from "@/components/animations/SliderField";
import SwitchField from "@/components/animations/SwitchField";
import TabsField from "@/components/animations/TabsField";

const AnimationPropsMapping = React.memo(
  ({
    property = {},
    defaultData = {},
    contentStep = {},
    updateContentData = () => {},
  }) => {
    const { path = null, fieldType = null } = property || {};
    if (!path || !fieldType) return null;

    console.log("re render", fieldType);

    // updating animation properties.
    const handleSetValueByPath = useCallback(
      (value) => {
        const newData = structuredClone(defaultData);
        setValueByPath(newData, path, value);
        updateContentData({
          ...contentStep,
          data: { ...contentStep.data, ...newData },
        });
      },
      [defaultData, path, contentStep, updateContentData]
    );

    // extracting latest value
    const value = getValueFromPath(defaultData, path) ?? "";

    switch (fieldType) {
      case "text-field":
        return (
          <TextField
            property={property}
            value={value}
            onDelete={() => {}}
            onDisabledUpdate={() => {}}
            onValueChange={handleSetValueByPath}
          />
        );

      case "number-field":
        return (
          <NumberField
            property={property}
            value={value}
            onDelete={() => {}}
            onDisabledUpdate={() => {}}
            onValueChange={handleSetValueByPath}
          />
        );

      case "number-field-2":
        return (
          <NumberField2
            property={property}
            value={value}
            onDelete={() => {}}
            onDisabledUpdate={() => {}}
            onValueChange={handleSetValueByPath}
          />
        );

      case "class-selector-field":
        return (
          <ClassSelectionField
            property={property}
            value={value}
            onDelete={() => {}}
            onDisabledUpdate={() => {}}
            onValueChange={() => {}}
          />
        );

      case "code-block-field":
        // todo: add code block field leter;
        break;

      case "color-picker":
        return (
          <ColorPickerField
            property={property}
            value={value}
            onValueChang
            onDelete={() => {}}
            onDisabledUpdate={() => {}}
            e={() => {}}
          />
        );

      case "rotation-field":
        return (
          <RotationField
            property={property}
            value={value}
            onValueChang
            onDelete={() => {}}
            onDisabledUpdate={() => {}}
            e={() => {}}
          />
        );

      case "select-field":
        return (
          <SelectField
            property={property}
            value={value}
            onDelete={() => {}}
            onDisabledUpdate={() => {}}
            onValueChange={handleSetValueByPath}
          />
        );

      case "slider-field":
        return (
          <SliderField
            property={property}
            value={value}
            onDelete={() => {}}
            onDisabledUpdate={() => {}}
            onValueChange={handleSetValueByPath}
          />
        );

      case "switch-field":
        return (
          <SwitchField
            property={property}
            value={value}
            onDelete={() => {}}
            onDisabledUpdate={() => {}}
            onValueChange={handleSetValueByPath}
          />
        );

      case "tabs-field":
        return (
          <TabsField
            property={property}
            value={value}
            onDelete={() => {}}
            onDisabledUpdate={() => {}}
            onValueChange={handleSetValueByPath}
            contentStep={contentStep}
            updateContentData={updateContentData}
          />
        );
      default:
        return null;
    }
  },
  (prev, next) => prev?.defaultData === next?.defaultData // if true memorized it
);

export default AnimationPropsMapping;
