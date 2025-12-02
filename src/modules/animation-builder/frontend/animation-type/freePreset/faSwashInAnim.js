export function faSwashInAnim() {
  return {
    classname: "wcf-fa-swashin",
    category: "fade", // TODO: Change this
    properties: {
      keyframes: {
        "0%": {
          opacity: "0",
          transformOrigin: "50% 50%",
          transform: "scale(0, 0)",
        },
        "90%": {
          opacity: "1",
          transformOrigin: "50% 50%",
          transform: "scale(0.9, 0.9)",
        },
        "100%": {
          opacity: "1",
          transformOrigin: "50% 50%",
          transform: "scale(1, 1)",
        },
      },
      duration: 1000,
      easing: "power2.out",
      delay: 0,
      repeat: 1,
    },
  };
}
