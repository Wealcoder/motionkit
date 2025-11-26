export const ABCustomPresetData = {
  title: "Animation Title",
  type: "custom",
  enable: true,
  timelines: [],
  animations: [],
  ScrollTrigger: {},
};

export const ABPresetData = {
  title: "Animation Title",
  type: "preset",
  enable: true,
};

export const ABCustomAnimationData = {
  title: "",
  timeline: "",
  method: "",
  applyAnimation: {},
  properties: [],
};

export const ABPresetAnimationData = [
  {
    presetName: "scroll-video-frame",
    data: {
      hiddenElements: ["timelines"],
      timelines: [
        {
          title: "timeline_1",
        },
      ],
      animations: [
        {
          title: "animation_1",
          timeline: "timeline_1",
          method: "to",
          hiddenElements: ["splitText"],
          applyAnimation: {},
          properties: [
            {
              name: "currentTime",
              value: 1,
              type: "number",
              info: "Specifies the current time of the animation, receiving a numeric value in seconds",
              isError: false,
              errorMessage: "",
            },
          ],
        },
      ],
      ScrollTrigger: {
        enable: true,
        timeline: "timeline_1",
        trigger: "",
        start: "top top",
        end: "bottom bottom",
        scrub: "true",
        pin: "true",
      },
      customFields: [
        {
          name: "parent classname",
          value: "",
          type: "string",
          info: "Parent classname to be used for the scroll video frame animation",
          isError: false,
          errorMessage: "",
        },
        {
          name: "element height",
          value: "",
          type: "string",
          info: "Element height to be used for the scroll video frame animation",
          isError: false,
          errorMessage: "",
        },
      ],
    },
  },
  {
    presetName: "horizontal-scroll",
    data: {
      hiddenElements: ["timelines"],
      timelines: [
        {
          title: "timeline_1",
        },
      ],

      ScrollTrigger: {
        enable: true,
        timeline: "timeline_1",
        trigger: "",
        start: "top top",
        end: "bottom bottom",
        scrub: "true",
        pin: "true",
      },
      customFields: [
        {
          name: "container classname",
          value: "",
          type: "string",
          info: "Parent classname to be used for the scroll video frame animation",
          isError: false,
          errorMessage: "",
        },
        {
          name: "container height",
          value: "",
          type: "string",
          info: "Parent classname to be used for the scroll video frame animation",
          isError: false,
          errorMessage: "",
        },
        {
          name: "item classname",
          value: "",
          type: "string",
          info: "Parent classname to be used for the scroll video frame animation",
          isError: false,
          errorMessage: "",
        },

        {
          name: "item width",
          value: "default",
          type: "tab",
          tabContent: {
            default: [
              {
                name: "width",
                value: "",
                type: "string",
                info: "Element height to be used for the scroll video frame animation",
                isError: false,
                errorMessage: "",
              },
            ],
            custom: [
              {
                name: "item width",
                value: "",
                type: "string",
                info: "Element height to be used for the scroll video frame animation",
                isError: false,
                errorMessage: "",
              },
            ],
          },
          info: "Element height to be used for the scroll video frame animation",
          isError: false,
          errorMessage: "",
        },
      ],
    },
  },
];
