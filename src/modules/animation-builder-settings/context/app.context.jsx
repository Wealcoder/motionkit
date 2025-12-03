import { createContext, useCallback, useReducer } from "react";
import {
  activeFullPresetFn,
  activeGroupPresetFn,
  activePresetFn,
} from "@@/lib/presetService";

const initialState = {
  allPresets:
    JSON.parse(
      JSON.stringify(WCF_ANIMATION_BUILDER_ADMIN?.config?.preset_settings ?? {})
    ) || {},
  allFreeAnimations:
    JSON.parse(
      JSON.stringify(WCF_ANIMATION_BUILDER_ADMIN?.config?.free_animations ?? {})
    ) || {},
};

const reducer = (state, action) => {
  switch (action.type) {
    case "setAllPresets":
      return { ...state, allPresets: action.value };
    case "setAllFreeAnimations":
      return { ...state, allFreeAnimations: action.value };

    default:
      throw new Error();
  }
};

const useMainContext = (state) => {
  const [mainState, dispatch] = useReducer(reducer, state);

  const setAllPresets = useCallback((data) => {
    dispatch({
      type: "setAllPresets",
      value: data,
    });
  }, []);

  const setAllFreeAnimations = useCallback((data) => {
    dispatch({
      type: "setAllFreeAnimations",
      value: data,
    });
  }, []);

  // Preset animation state modifier
  const updateActivePreset = useCallback(
    (data) => {
      activePresetFn(mainState.allPresets, data, dispatch, "setAllPresets");
    },
    [mainState.allPresets]
  );

  const updateActiveGroupPreset = useCallback(
    (data) => {
      activeGroupPresetFn(
        mainState.allPresets,
        data,
        dispatch,
        "setAllPresets"
      );
    },
    [mainState.allPresets]
  );

  const updateActiveFullPreset = useCallback(
    (data) => {
      activeFullPresetFn(mainState.allPresets, data, dispatch, "setAllPresets");
    },
    [mainState.allPresets]
  );

  // Free animation preset modifier
  const updateFreeActivePreset = useCallback(
    (data) => {
      activePresetFn(
        mainState.allFreeAnimations,
        data,
        dispatch,
        "setAllFreeAnimations"
      );
    },
    [mainState.allFreeAnimations]
  );

  const updateFreeActiveGroupPreset = useCallback(
    (data) => {
      activeGroupPresetFn(
        mainState.allFreeAnimations,
        data,
        dispatch,
        "setAllFreeAnimations"
      );
    },
    [mainState.allFreeAnimations]
  );

  const updateFreeActiveFullPreset = useCallback(
    (data) => {
      activeFullPresetFn(
        mainState.allFreeAnimations,
        data,
        dispatch,
        "setAllFreeAnimations"
      );
    },
    [mainState.allFreeAnimations]
  );

  return {
    mainState,
    setAllPresets,
    setAllFreeAnimations,
    updateActivePreset,
    updateActiveGroupPreset,
    updateActiveFullPreset,
    updateFreeActivePreset,
    updateFreeActiveGroupPreset,
    updateFreeActiveFullPreset,
  };
};

export const AppContext = createContext({
  mainState: initialState,
  setAllPresets: () => {},
  setAllFreeAnimations: () => {},
  updateActivePreset: () => {},
});

export const AppContextProvider = ({ children }) => {
  return (
    <AppContext.Provider value={useMainContext(initialState)}>
      {children}
    </AppContext.Provider>
  );
};
