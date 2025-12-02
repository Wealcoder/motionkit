import { AppContext } from "@@/context/app.context";
import { useContext } from "react";

export const usePresets = () => {
  const {
    mainState: { allPresets },
    setAllPresets,
    setAllFreeAnimations,
    updateActivePreset,
    updateActiveGroupPreset,
    updateActiveFullPreset,
  } = useContext(AppContext);
  return {
    allPresets,
    setAllPresets,
    setAllFreeAnimations,
    updateActivePreset,
    updateActiveGroupPreset,
    updateActiveFullPreset,
  };
};
