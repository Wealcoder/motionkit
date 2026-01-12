import TextField from "@/components/animations/TextField";
import NumberField from "@/components/animations/NumberField";
import NumberField2 from "@/components/animations/NumberField2";
import ClassSelectionField from "@/components/animations/ClassSelectionField";
import ColorPickerField from "@/components/animations/ColorPickerField";
import RotationField from "@/components/animations/RotationField";
import SelectField from "@/components/animations/SelectField";
import SliderField from "@/components/animations/SliderField";
import SwitchField from "@/components/animations/SwitchField";

const AnimationPropsMapping = React.memo(
  ({ property }) => {
    const { path = null, fieldType = null } = property || {};
    if (!path || !fieldType) return null;

    switch (fieldType) {
      case "text-field":
        return (
          <TextField
            property={property}
            value=""
            onDelete={() => {}}
            onDisabledUpdate={() => {}}
            onValueChange={() => {}}
          />
        );

      case "number-field":
        return (
          <NumberField
            property={property}
            value=""
            onDelete={() => {}}
            onDisabledUpdate={() => {}}
            onValueChange={() => {}}
          />
        );

      case "number-field-2":
        return (
          <NumberField2
            property={property}
            value=""
            onDelete={() => {}}
            onDisabledUpdate={() => {}}
            onValueChange={() => {}}
          />
        );

      case "class-selection-field":
        return (
          <ClassSelectionField
            property={property}
            value=""
            onValueChang
            onDelete={() => {}}
            onDisabledUpdate={() => {}}
            e={() => {}}
          />
        );

      case "code-block-field":
        // todo: add code block field leter;
        break;

      case "color-picker":
        return (
          <ColorPickerField
            property={property}
            value=""
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
            value=""
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
            value=""
            onDelete={() => {}}
            onDisabledUpdate={() => {}}
            onValueChange={() => {}}
          />
        );

      case "slider-field":
        return (
          <SliderField
            property={property}
            value=""
            onDelete={() => {}}
            onDisabledUpdate={() => {}}
            onValueChange={() => {}}
          />
        );

      case "switch-field":
        return (
          <SwitchField
            property={property}
            value=""
            onDelete={() => {}}
            onDisabledUpdate={() => {}}
            onValueChange={() => {}}
          />
        );

      default:
        return null;
    }
  },
  (prev, next) => {
    return (
      prev?.property?.value === next?.property?.value &&
      prev?.property?.field_type !== next?.property?.field_type
    );
  }
);

export default AnimationPropsMapping;
