import { easeTypes, triggerTypes } from "@/config/animationsProperties";

const defaultData = {
  triggerType: "on_scroll",
  itemClass: "",
  delay: 0,
  duration: 1,
  repeat: 0,
};

const config = {
  title: "Space In Left",
  description: "",
  key: "general-space-in-left",
  properties: [
    {
      accordionTitle: "Properties",
      properties: [
        {
          title: "Trigger Type",
          fieldType: "select-field",
          fieldData: triggerTypes,
          path: "defaultData.triggerType",
        },
        {
          title: "Item Class",
          fieldType: "class-selector-field",
          path: "defaultData.itemClass",
        },
        {
          title: "Delay",
          fieldType: "number-field",
          path: "defaultData.delay",
        },
        {
          title: "Duration",
          fieldType: "number-field",
          path: "defaultData.duration",
        },
        {
          title: "Ease",
          fieldType: "select-field",
          fieldData: easeTypes,
          path: "defaultData.triggerType",
        },
        {
          title: "Repeat",
          fieldType: "number-field",
          path: "defaultData.repeat",
        },
      ],
    },
  ],
};

export { defaultData, config };
