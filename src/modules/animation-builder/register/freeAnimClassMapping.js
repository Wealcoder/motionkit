// Add this class for all animation "wcf-free-ab-25" (for inspecting)

export const freeAnimClassMapping = (preset) => {
  if (!preset) {
    console.error("Free animation register key not found!");
    return [];
  }
  switch (preset) {
    case "wcf-general-swash-in-free-animation":
      return ["wcf-free-ab-25", "wcf-free-ab-swashIn"];
    default:
      return [];
  }
};
