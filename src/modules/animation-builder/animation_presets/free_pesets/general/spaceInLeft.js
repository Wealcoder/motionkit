import { easeTypes, triggerTypes } from "@/config/dynamicPropertiesData";

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
  tabs: {},
  boxShadow:"10px 5px 5px #ffffffff",
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
          title: "Gradient",
          fieldType: "gradient-color-picker",
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
          title: "Transform Origin",
          fieldType: "transform-origin-field",
          path: "transformOrigin",
          isCustomAnim: true,
        },
        {
          title: "Drop Shadow",
          fieldType: "drop-shadow-field",
          path: "dropShadow",
          isCustomAnim: true,
        },
        {
          title: "Box Shadow",
          fieldType: "box-shadow-field",
          path: "boxShadow",
          isCustomAnim: true,
        },
        {
          title: "Repeat",
          fieldType: "repeat-field",
          path: "repeat",
          isCustomAnim: true,
        },
        {
          title: "Stagger",
          fieldType: "stagger-field",
          path: "stagger",
          isCustomAnim: true,
        },
        {
          title: "Width",
          fieldType: "width-field",
          path: "repeat",
          isCustomAnim: true,
        },
        {
          title: "Method",
          fieldType: "tween-method-field",
          path: "tween",
          isCustomAnim: true,
        }, 
        {
          title: "Tabs",
          fieldType: "tabs-field",
          path: "tabs",
          tabsTrigger: [
            { title: "Default", value: "default" },
            { title: "Custom", value: "custom" },
            { title: "Test 1", value: "test1" },
            { title: "Test 2", value: "test2" },
            { title: "Test 3", value: "test3" },
            { title: "Test 4", value: "test4" },
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
            {
              key: "test1",
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
            {
              key: "test2",
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
            {
              key: "test3",
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
            {
              key: "test4",
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
          title: "Direction",
          fieldType: "direction-field",
          path: "direction",
          isCustomAnim: true,
        }, 
      ],
    },
  ],
};

export { defaultData, config };
