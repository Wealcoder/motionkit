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
};

const config = {
  title: "Space In Left",
  description: "",
  key: "wcf-ab-gen-sil-fa",
  properties: [
    // {
    //   accordionTitle: "Properties",
    //   properties: [
    //     {
    //       title: "Trigger Type",
    //       fieldType: "select-field",
    //       fieldData: triggerTypes,
    //       path: "triggerType",
    //     },
    //     {
    //       title: "Item Class",
    //       fieldType: "class-selector-field",
    //       path: "itemClass",
    //     },
    //     {
    //       title: "Delay",
    //       fieldType: "number-field",
    //       path: "animationDelay",
    //     },
    //     {
    //       title: "Duration",
    //       fieldType: "number-field",
    //       path: "animationDuration",
    //     },
    //     {
    //       title: "Ease",
    //       fieldType: "select-field",
    //       fieldData: easeTypes,
    //       path: "animationTimingFunction",
    //     },
    //     {
    //       title: "Repeat",
    //       fieldType: "number-field",
    //       path: "animationIterationCount",
    //     },
    //   ],
    // },
    {
      accordionTitle: "Test Component",
      properties: [
        {
          title: "Text field",
          fieldType: "text-field",
          path: "test",
        },
        {
          title: "Number field",
          fieldType: "number-field",
          path: "animationDuration",
        },
        {
          title: "Stagger",
          fieldType: "number-field-2",
          path: "animationDuration",
        },
        {
          title: "Class selector field",
          fieldType: "class-selector-field",
          path: "itemClass",
        },
        {
          title: "Color picker",
          fieldType: "color-picker",
          path: "colorPicker",
        },
        {
          title: "Rotation Field",
          fieldType: "rotation-field",
          path: "rotation",
        },
        {
          title: "Select Field",
          fieldType: "select-field",
          fieldData: easeTypes,
          path: "animationTimingFunction",
        },
        {
          title: "Slider Field",
          fieldType: "slider-field",
          path: "slider",
        },
        {
          title: "Switch Field",
          fieldType: "switch-field",
          path: "switch",
        },
      ],
    },
  ],
};

export { defaultData, config };
