import { easeTypes, triggerTypes } from "@/config/animationsProperties";

const defaultData = {
  triggerType: "on_scroll",
  itemClass: "",
  animationDelay: 0,
  animationDuration: 1,
  animationIterationCount: 0,
  animationTimingFunction: "expo",
  // test
  test: "",
  colorPicker: "#000000",
  rotation: 360,
  slider: -150,
  switch: true,
  code: "",
  repeat: -1,
};

const config = {
  title: "Space In Left",
  description: "",
  key: "wcf-ab-gen-sil-fa",
  properties: [
    // todo: apply space in left property
    {
      accordionTitle: "Test Component",
      properties: [
        {
          title: "Text field",
          fieldType: "text-field",
          path: "test",
          isCustomAnim: true,
        },
        {
          title: "Number field",
          fieldType: "number-field",
          path: "animationDuration",
          isCustomAnim: true,
        },
        {
          title: "Number  2",
          fieldType: "number-field-2",
          path: "animationDuration",
          isCustomAnim: true,
        },
        {
          title: "Class selector field",
          fieldType: "class-selector-field",
          path: "itemClass",
          isCustomAnim: true,
        },
        {
          title: "Color picker",
          fieldType: "color-picker",
          path: "colorPicker",
          isCustomAnim: true,
        },
        {
          title: "Rotation Field",
          fieldType: "rotation-field",
          path: "rotation",
          isCustomAnim: true,
        },
        {
          title: "Select Field",
          fieldType: "select-field",
          fieldData: easeTypes,
          path: "animationTimingFunction",
          isCustomAnim: true,
        },
        {
          title: "Repeat",
          fieldType: "slider-field",
          path: "slider",
          isCustomAnim: true,
        },
        {
          title: "Switch Field",
          fieldType: "switch-field",
          path: "switch",
          isCustomAnim: true,
        },
        {
          title: "Code Block Field",
          fieldType: "code-block-field",
          path: "code",
          isCustomAnim: true,
        },
        {
          title: "Repeat",
          fieldType: "repeat-field",
          path: "repeat",
          isCustomAnim: true,
        },
      ],
    },
  ],
};

export { defaultData, config };
