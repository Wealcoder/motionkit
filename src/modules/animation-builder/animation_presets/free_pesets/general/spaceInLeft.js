import { easeTypes, triggerTypes } from "@/config/animationsProperties";

const defaultData = {
  triggerType: "on_scroll",
  itemClass: "",
  animationDelay: 0,
  animationDuration: 1,
  animationIterationCount: 0,
  animationTimingFunction: "ease",
};

const config = {
  title: "Space In Left",
  description: "",
  key: "wcf-ab-gen-sil-fa",
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
        {
          title: "Tabs",
          fieldType: "tabs-field",
          path: "repeat",
          tabsTrigger: [
            { title: "Default", value: 'default' },
            { title: "Custom", value: 'custom' },
            { title: "Tab 1", value: 'tab1' },
            { title: "Tab 2", value: 'tab2' },
            { title: "Tab 3", value: 'tab3' },
            { title: "Tab 4", value: 'tab4' },
          ],
          tabsContent: [
            {
              key: "default",
              fields: [
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
              ]
            },
            {
              key: "custom",
              fields: [
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
              ]
            }
            // others fields
          ],
        },
      ],
    },
  ],
};

export { defaultData, config };
