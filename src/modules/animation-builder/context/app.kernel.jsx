const { useReducer, createContext, useCallback } = require("react");
import { validateKeyCombination } from "@/lib/events/keyboardEventUtils";

const initialState = {
  editorZoomLevel: 1,
  xPlacement: 0,
  isEditorOpen: true,
  isStructureOpen: false,
};

const reducer = (state, action) => {
  switch (action.type) {
    case "setEditorZoomLevel":
      return { ...state, editorZoomLevel: action?.value };
    case "setEditorXPlacement":
      return { ...state, xPlacement: action?.value };
    case "toggleController":
      return { ...state, isEditorOpen: !state.isEditorOpen };
    case "toggleStructure":
      return { ...state, isStructureOpen: !state.isStructureOpen };
    default:
      console.error("Kernel: Action type not recognized!");
      break;
  }
};

const useAppKernel = (state) => {
  const [mainState, dispatch] = useReducer(reducer, state);

  // #################### GENERAL FUNCTION ####################
  // changing iframe zoom during scroll. (Ctrl + mouse wheel)
  const setEditorZoomLevel = useCallback((level = 1) => {
    if (!level || typeof level !== "number") return;
    dispatch({
      type: "setEditorZoomLevel",
      value: level,
    });
  });

  // changing x axios position during scroll. (Shift + mouse wheel)
  const setEditorXPlacement = useCallback((placement = 0) => {
    dispatch({
      type: "setEditorXPlacement",
      value: placement * 5, // 10 is scrolling speed
    });
  });

  // reset editor zoom level and placement
  const resetEditorPreview = useCallback(() => {
    dispatch({
      type: "setEditorZoomLevel",
      value: 1,
    });
    dispatch({
      type: "setEditorXPlacement",
      value: 0,
    });
  });

  const toggleController = useCallback(() => {
    dispatch({
      type: "toggleController",
    });
  });

  // toggle editor structure
  const toggleStructure = useCallback(() => {
    dispatch({
      type: "toggleStructure",
    });
  });

  // #################### EVENT HANDLER FUNCTION ####################
  // IMPORTANT : (Iframe to Editor) event handler actions mapping
  const actions = {
    toggleController: toggleController,
  };

  // Handler
  const handleEventToKernel = useCallback(
    (e) => {
      if (e.origin !== window.location.origin) return; //security checkup
      const currentEventData = e?.data;
      const { type = "", value = null, rest } = currentEventData || {};
      if (!type) return;
      switch (type) {
        case "WCF_AB_WHEEL_EVENT":
          setEditorZoomLevel(value);
          break;
        case "WCF_AB_WHEEL_EVENT_X_PLACEMENT":
          setEditorXPlacement(value);
          break;
        case "WCF_AB_KEYDOWN_EVENT":
          validateKeyCombination(value, actions);
          break;
        default:
          break;
      }
    },
    [...Object.values(actions)]
  );

  return {
    mainState,
    setEditorZoomLevel,
    setEditorXPlacement,
    resetEditorPreview,
    toggleController,
    toggleStructure,
    handleEventToKernel,
  };
};

export const Kernel = createContext(initialState);

export const KernelContextProvider = ({ children }) => {
  return (
    <Kernel.Provider value={useAppKernel(initialState)}>
      {children}
    </Kernel.Provider>
  );
};
