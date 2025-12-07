export const freeAnimClassMapping = (preset) => {
  if (!preset) {
    console.error("Free animation register key not found!");
    return [];
  }
  switch (preset) {
    case "wcf-general-swash-in-free-animation":
      return ["wcf-free-ab-swashIn"];
    default:
      return [];
  }
};
