const BREAKPOINTS = {
  desktop: null,
  laptop: "(max-width: 1440px)",
  tab_land: "(max-width: 1024px)",
  tab: "(max-width: 768px)",
  mobile: "(max-width: 480px)",
};

export function generateFreeAnimCSS(data) {
  // const currentData = [];
  // if(!Array.isArray(data)){
  //   currentData
  // }
  return Object.entries(data).reduce((cssOutput, [device, items]) => {
    const cssForDevice = items.reduce((acc, item) => {
      if (!item.enable) return acc;
      const selector = item.itemClass;
      const rules = `
        ${selector} {
          animation-delay: ${item.delay}ms;
          animation-duration: ${item.duration}ms;
          animation-iteration-count: ${item.repeat};
        }
      `;
      return acc + rules;
    }, "");
    if (!cssForDevice.trim()) return cssOutput;
    const media = BREAKPOINTS[device];
    if (!media) {
      return cssOutput + cssForDevice;
    }
    return (
      cssOutput +
      `
      @media ${media} {
        ${cssForDevice}
      }
    `
    );
  }, "");
}
