import { easeTypes, triggerTypes } from "@/config/animationsProperties";

const defaultData = {
  triggerType: "on_scroll",
  itemClass: "",
  delay: 0.01,
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
          path: "delay",
        },
        {
          title: "Duration",
          fieldType: "number-field",
          path: "duration",
        },
        {
          title: "Ease",
          fieldType: "select-field",
          fieldData: easeTypes,
          path: "triggerType",
        },
        {
          title: "Repeat",
          fieldType: "number-field",
          path: "repeat",
        },
      ],
    },
  ],
};

export { defaultData, config };
