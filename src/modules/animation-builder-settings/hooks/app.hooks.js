import { AppContext } from "@@/context/app.context";
import { useContext } from "react";

export const usePresets = () => {
  const {
    mainState: { allPresets, allFreeAnimations },
    setAllPresets,
    setAllFreeAnimations,
    // preset animation state modifier
    updateActivePreset,
    updateActiveGroupPreset,
    updateActiveFullPreset,
    // free animation preset modifier
    updateFreeActivePreset,
    updateFreeActiveGroupPreset,
    updateFreeActiveFullPreset,
  } = useContext(AppContext);
  return {
    allPresets,
    allFreeAnimations,
    setAllPresets,
    setAllFreeAnimations,
    // preset animation state modifier
    updateActivePreset,
    updateActiveGroupPreset,
    updateActiveFullPreset,
    // free animation preset modifier
    updateFreeActivePreset,
    updateFreeActiveGroupPreset,
    updateFreeActiveFullPreset,
  };
};
