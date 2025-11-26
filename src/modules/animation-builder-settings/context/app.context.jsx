

import { createContext, useCallback, useReducer } from "react";
import { activeFullPresetFn, activeGroupPresetFn, activePresetFn } from "@@/lib/presetService";

const initialState = {
  allPresets:
    JSON.parse(JSON.stringify(WCF_ADDONS_ADMIN?.config?.settings)) || {},
};

const reducer = (state, action) => {
  switch (action.type) {
    case "setAllPresets":
      return { ...state, allPresets: action.value };
    

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


  const updateActivePreset = useCallback(
    (data) => {
      activePresetFn(mainState.allPresets, data, dispatch);
    },
    [mainState.allPresets]
  ); 

  const updateActiveGroupPreset = useCallback(
    (data) => {
      activeGroupPresetFn(mainState.allPresets, data, dispatch);
    },
    [mainState.allPresets]
  );

  const updateActiveFullPreset = useCallback(
    (data) => {
      activeFullPresetFn(mainState.allPresets, data, dispatch);
    },
    [mainState.allPresets]
  );

  return {
    mainState,
    setAllPresets,
    updateActivePreset,
    updateActiveGroupPreset,
    updateActiveFullPreset,
  };
};

export const AppContext = createContext({
  mainState: initialState,
  setAllPresets: () => {},
  updateActivePreset: () => {},
});

export const AppContextProvider = ({ children }) => {
  return (
    <AppContext.Provider value={useMainContext(initialState)}>
      {children}
    </AppContext.Provider>
  );
};
