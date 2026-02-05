import BoxShadowField from "@/components/animations/BoxShadowField";
import ColorPickerField from "@/components/animations/ColorPickerField";
import DropShadowField from "@/components/animations/DropShadowField";
import NumberField from "@/components/animations/NumberField";
import RepeatField from "@/components/animations/RepeatField";
import RotationField from "@/components/animations/RotationField";
import TextField from "@/components/animations/TextField";
import TransformOriginField from "@/components/animations/TransformOriginField";
import StaggerField from "@/components/animations/StaggerField";
import WidthHeightField from "@/components/animations/WidthHeightField";

const animationProperties = [
    {
        key: "",
        items: [
            {
                key: "x",
                title: "X",
                path: "x",
                fieldType: "number-field",
                element: NumberField,
            },
            {
                key: "y",
                title: "Y",
                path: "y",
                fieldType: "number-field",
                element: NumberField,
            },
            {
                key: "opacity",
                title: "Opacity",
                path: "opacity",
                fieldType: "number-field",
                element: NumberField,
            },
            {
                key: "width",
                title: "Width",
                path: "width",
                fieldType: "width-field",
                element: WidthHeightField,
            },
            {
                key: "height",
                title: "Height",
                path: "height",
                fieldType: "width-field",
                element: WidthHeightField,
            },
            {
                key: "scale",
                title: "Scale",
                path: "scale",
                fieldType: "number-field",
                element: NumberField,
            },
            {
                key: "repeat",
                title: "Repeat",
                path: "repeat",
                fieldType: "repeat-field",
                element: RepeatField,
            },
            {
                key: "rotate",
                title: "Rotate",
                path: "rotate",
                fieldType: "rotation-field",
                element: RotationField,
            },
            {
                key: "rotateX",
                title: "Rotate X",
                path: "rotateX",
                fieldType: "rotation-field",
                element: RotationField,
            },
            {
                key: "transformOrigin",
                title: "Transform Origin",
                path: "transformOrigin",
                fieldType: "transform-origin-field",
                element: TransformOriginField,
            },
            {
                key: "color",
                title: "Color",
                path: "color",
                fieldType: "color-picker",
                element: ColorPickerField,
            },
            {
                key: "background",
                title: "Background",
                path: "background",
                fieldType: "color-picker",
                element: ColorPickerField,
            },
            {
                key: "border",
                title: "Border",
                path: "border",
                fieldType: "border-field",
                element: NumberField,
            },
            {
                key: "boxShadow",
                title: "Box Shadow",
                path: "boxShadow",
                fieldType: "box-shadow-field",
                element: BoxShadowField,
            },
            {
                key: "dropShadow",
                title: "Drop Shadow",
                path: "dropShadow",
                fieldType: "drop-shadow-field",
                element: DropShadowField,
            },
            {
                key: "ease",
                title: "Ease",
                path: "ease",
                fieldType: "select-field",
                element: TextField,
            },
            {
                key: "force3D",
                title: "Force 3D",
                path: "force3D",
                fieldType: "switch-field",
                element: TextField,
            },
            {
                key: "delay",
                title: "Delay",
                path: "delay",
                fieldType: "number-field",
                element: NumberField,
            },
            {
                key: "duration",
                title: "Duration",
                path: "duration",
                fieldType: "number-field",
                element: NumberField,
            },
            {
                key: "scaleX",
                title: "Scale X",
                path: "scaleX",
                fieldType: "number-field",
                element: NumberField,
            },
            {
                key: "scaleY",
                title: "Scale Y",
                path: "scaleY",
                fieldType: "number-field",
                element: NumberField,
            },
            {
                key: "xPercent",
                title: "X Percent",
                path: "xPercent",
                fieldType: "number-field",
                element: NumberField,
            },
            {
                key: "yPercent",
                title: "Y Percent",
                path: "yPercent",
                fieldType: "number-field",
                element: NumberField,
            },
            {
                key: "repeatDelay",
                title: "Repeat Delay",
                path: "repeatDelay",
                fieldType: "number-field",
                element: NumberField,
            },
            {
                key: "yoyo",
                title: "Yoyo",
                path: "yoyo",
                fieldType: "switch-field",
                element: TextField,
            },
            
            {
                key: "rotateY",
                title: "Rotate Y",
                path: "rotateY",
                fieldType: "rotation-field",
                element: RotationField,
            },
            {
                key: "stagger",
                title: "Stagger",
                path: "stagger",
                fieldType: "stagger-field",
                element: StaggerField,
            },
            {
                key: "overwrite",
                title: "Overwrite",
                path: "overwrite",
                fieldType: "select-field",
                element: TextField,
            },
            {
                key: "custom",
                title: "Custom",
                path: "custom",
                fieldType: "code-block-field",
                element: TextField,
            },
        ],
    },
    {
        key: "draw svg",
        items: [
            {
                key: "drawSVG",
                title: "Draw SVG",
                path: "drawSVG",
                fieldType: "text-field",
                element: TextField,
            },
            {
                key: "stroke",
                title: "Stroke",
                path: "stroke",
                fieldType: "color-picker",
                element: ColorPickerField,
            },
            {
                key: "strokeWidth",
                title: "Stroke Width",
                path: "strokeWidth",
                fieldType: "number-field",
                element: NumberField,
            },
            {
                key: "fill",
                title: "Fill",
                path: "fill",
                fieldType: "color-picker",
                element: ColorPickerField,
            },
        ],
    },
];

export default animationProperties;
