import { AppContext } from "@@/context/app.context";
import { useContext } from "react";

export const usePresets = () => {
  const {
    mainState: { allPresets },
    setAllPresets,
    updateActivePreset,
    updateActiveGroupPreset,
    updateActiveFullPreset,
  } = useContext(AppContext);
  return {
    allPresets,
    setAllPresets,
    updateActivePreset,
    updateActiveGroupPreset,
    updateActiveFullPreset,
  };
};
