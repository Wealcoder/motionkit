// Add these class for all animation "wcf-free-ab-25" & "wcf-free-ab-freeAnimGeneral" (for inspecting)

export const freeAnimClassMapping = (preset) => {
  if (!preset) {
    console.error("Free animation register key not found!");
    return [];
  }
  switch (preset) {
    case "wcf-general-swash-in-free-animation":
      return [
        "wcf-free-ab-25",
        "wcf-free-ab-freeAnimGeneral",
        "wcf-free-ab-swashIn",
      ];
    case "wcf-general-vanish-in-free-animation":
      return [
        "wcf-free-ab-25",
        "wcf-free-ab-freeAnimGeneral",
        "wcf-free-ab-vanishIn",
      ];
    case "wcf-general-sil-free-animation":
      return [
        "wcf-free-ab-25",
        "wcf-free-ab-freeAnimGeneral",
        "wcf-free-ab-spaceInLeft",
      ];
    case "wcf-general-sir-free-animation":
      return [
        "wcf-free-ab-25",
        "wcf-free-ab-freeAnimGeneral",
        "wcf-free-ab-spaceInRight",
      ];
    case "wcf-general-swap-free-animation":
      return [
        "wcf-free-ab-25",
        "wcf-free-ab-freeAnimGeneral",
        "wcf-free-ab-swap",
      ];
    case "wcf-general-tid-free-animation":
      return [
        "wcf-free-ab-25",
        "wcf-free-ab-freeAnimGeneral",
        "wcf-free-ab-twisterInDown",
      ];
    default:
      return [];
  }
};
