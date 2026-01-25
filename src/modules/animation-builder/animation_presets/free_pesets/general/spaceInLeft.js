import { easeTypes, triggerTypes } from "@/config/animationsProperties";

const defaultData = {
  triggerType: "on_scroll",
  itemClass: "",
  animationDelay: 0,
  animationDuration: 1,
  animationIterationCount: 0,
  animationTimingFunction: "ease",
  tabs:{}
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
        {
          title: "Tabs",
          fieldType: "tabs-field",
          path: "tabs",
          tabsTrigger: [
            { title: "Default", value: "default" },
            { title: "Custom", value: "custom" },
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
              ],
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
              ],
            },
          ],
        },
        {
          title: "Transform Origin",
          fieldType: "transform-origin-field",
          path: "transformOrigin",
        },
      ],
    },
  ],
};

export { defaultData, config };
