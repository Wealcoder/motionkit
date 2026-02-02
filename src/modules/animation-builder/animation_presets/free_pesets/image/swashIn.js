import { easeTypes, triggerTypes } from "@/config/dynamicPropertiesData";

const defaultData = {
  triggerType: "on_scroll",
  itemClass: "",
  animationDelay: 0,
  animationDuration: 1,
  animationIterationCount: 0,
  animationTimingFunction: "ease",
};

const config = {
  title: "Space In Right",
  description: "",
  key: "wcf-image-swash-in-free-animation",
  properties: [
    {
      accordionTitle: "Properties",
      properties: [
        {
          title: "Trigger Type",
          fieldType: "select-field",
          fieldData: triggerTypes,
          path: "triggerType",
        },
        {
          title: "Item Class",
          fieldType: "class-selector-field",
          path: "itemClass",
        },
        {
          title: "Delay",
          fieldType: "number-field",
          path: "animationDelay",
        },
        {
          title: "Duration",
          fieldType: "number-field",
          path: "animationDuration",
        },
        {
          title: "Ease",
          fieldType: "select-field",
          fieldData: easeTypes,
          path: "animationTimingFunction",
        },
        {
          title: "Repeat",
          fieldType: "number-field",
          path: "animationIterationCount",
        },
      ],
    },
  ],
};

export { defaultData, config };
