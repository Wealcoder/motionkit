// free default animations config list
const defaultConfig = {
  duration: 1,
  delay: 0,
  repeat: 1,
};

export const freeAnimations = [
  // swashIn

  // vanishIn
  {
    classname: "wcf-fa-vanishin",
    category: "fade", // TODO: Change this
    properties: {
      keyframes: {
        "0%": {
          opacity: "0",
          transformOrigin: "50% 50%",
          transform: "scale(2, 2)",
          filter: "blur(90px)",
        },
        "100%": {
          opacity: "1",
          transformOrigin: "50% 50%",
          transform: "scale(1, 1)",
          filter: "blur(0px)",
        },
      },
      ...defaultConfig,
    },
  },

  // spaceInLeft
  {
    classname: "wcf-fa-spaceinleft",
    category: "fade", // TODO: Change this
    properties: {
      keyframes: {
        "0%": {
          opacity: "0",
          transformOrigin: "0% 50%",
          transform: "scale(0.2) translate(-200%, 0%)",
        },
        "100%": {
          opacity: "1",
          transformOrigin: "0% 50%",
          transform: "scale(1) translate(0%, 0%)",
        },
      },
      ...defaultConfig,
    },
  },

  // spaceInRight
  {
    classname: "wcf-fa-spaceinright",
    category: "fade", // TODO: Change this
    properties: {
      keyframes: {
        "0%": {
          opacity: "0",
          transformOrigin: "100% 50%",
          transform: "scale(0.2) translate(200%, 0%)",
        },
        "100%": {
          opacity: "1",
          transformOrigin: "100% 50%",
          transform: "scale(1) translate(0%, 0%)",
        },
      },
      ...defaultConfig,
    },
  },

  // swap
  {
    classname: "wcf-fa-swap",
    category: "fade", // TODO: Change this
    properties: {
      keyframes: {
        "0%": {
          opacity: "0",
          transformOrigin: "0 100%",
          transform: "scale(0, 0) translate(-700px, 0px)",
        },
        "100%": {
          opacity: "1",
          transformOrigin: "100% 100%",
          transform: "scale(1, 1) translate(0px, 0px)",
        },
      },
      ...defaultConfig,
    },
  },
];
