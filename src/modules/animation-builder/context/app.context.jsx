import { createContext, useCallback, useReducer } from "react";
import { generateUniqueId } from "../../../utils/generateUniqueId";
import {
  copyTitle,
  deepSmartMerge,
  getResponsiveAndBelow,
  isElementCustomized,
  removeFromDynamicCopy,
} from "@/lib/utils";
import { CheckProperties } from "@/lib/validationCheck";
import { toast } from "sonner";

const initialState = {
  // editor configuration
  editorConfig: {
    isEditorLoading: false,
    editorZoomLevel: 1,
    xPlacement: 0,
    isControllerOpen: true,
    isStructureOpen: false,
  },
  // todo: need to write global settings save api and organize this context. follow bellow function for global settings.
  // const savePresets = async () => {
  //   await fetch(WCF_ANIMATION_BUILDER_ADMIN.ajaxurl, {
  //     method: "POST",
  //     headers: {
  //       "Content-Type": "application/x-www-form-urlencoded",
  //       Accept: "application/json",
  //     },

  //     body: new URLSearchParams({
  //       action: "aae_save_anim_builder_settings",
  //       setting_name: "wcf_anim_builder_free_animation_settings",
  //       form_fields: JSON.stringify(allFreeAnimations),
  //       nonce: WCF_ANIMATION_BUILDER_ADMIN.nonce,
  //     }),
  //   })
  //     .then((response) => response.json())
  //     .then((data) => {
  //       setPresetCount?.(data.count);
  //       toast.success("Presets saved successfully!", { position: "top-right" });
  //     });
  // };
  globalSettings: {
    scrollsmoother: {
      enableScrollSmother: true,
      configuration: {
        desktop: { enable: true, value: 1 },
        laptop: { enable: true, value: 1 },
        tablet: { enable: true, value: 1 },
        mobile: { enable: true, value: 1 },
      },
    },
    pageTransition: {
      enter: {},
      exit: {},
    },
  },
  // content sections
  contentStep: {
    step: 1,
    data: {},
  },
  // all animation sections
  allAnimation: {},
  // page configuration
  pageConfig: {},
  selectedDevice: "desktop",
};

const reducer = (state, action) => {
  switch (action.type) {
    // Editor Settings
    case "setEditorLoading":
      return {
        ...state,
        editorConfig: { ...state.editorConfig, isEditorLoading: action?.value },
      };
    case "setEditorZoomLevel":
      return {
        ...state,
        editorConfig: { ...state.editorConfig, editorZoomLevel: action?.value },
      };
    case "setEditorXPlacement":
      return {
        ...state,
        editorConfig: { ...state.editorConfig, xPlacement: action?.value },
      };
    case "toggleController":
      return {
        ...state,
        editorConfig: {
          ...state.editorConfig,
          isControllerOpen: !state?.editorConfig?.isControllerOpen,
        },
      };
    case "toggleStructure":
      return {
        ...state,
        editorConfig: {
          ...state.editorConfig,
          isStructureOpen: !state?.editorConfig?.isStructureOpen,
        },
      };

    // Animation Settings
    case "setContentStep":
      return { ...state, contentStep: action?.value };
    case "setAllAnimation":
      return { ...state, allAnimation: action?.value };
    case "setPageConfig":
      return { ...state, pageConfig: action?.value };
    case "setSelectedDevice":
      return { ...state, selectedDevice: action?.value };
    default:
      throw new Error();
  }
};

const useMainContext = (state) => {
  const [mainState, dispatch] = useReducer(reducer, state);

  // #################### EDITOR FUNCTION ####################
  const setIsEditorLoading = useCallback((value = false) => {
    const outsideValue = String(value);
    const currentState = outsideValue
      ? outsideValue === "true"
      : !mainState.isEditorLoading;
    dispatch({ type: "setEditorLoading", value: currentState });
    return currentState;
  });

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
    if (!placement && typeof placement !== "number") return;
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

  // #################### ANIMATION FUNCTION ####################
  const setContentStep = useCallback((data) => {
    dispatch({
      type: "setContentStep",
      value: data,
    });
  }, []);

  const setAllAnimation = useCallback((data) => {
    dispatch({
      type: "setAllAnimation",
      value: data,
    });
  }, []);

  const setPageConfig = useCallback((data) => {
    dispatch({
      type: "setPageConfig",
      value: data,
    });
  }, []);

  const setSelectedDevice = useCallback((data) => {
    dispatch({
      type: "setSelectedDevice",
      value: data,
    });
    dispatch({
      type: "setContentStep",
      value: {
        step: 1,
        data: {},
      },
    });
  }, []);

  const createAnimation = useCallback(
    async (data) => {
      console.log("hit create animation");

      const responsiveData = getResponsiveAndBelow(mainState.selectedDevice);
      const result = { ...mainState.allAnimation };

      responsiveData.forEach((key) => {
        if (!result[key]) {
          result[key] = [];
        }
        result[key] = [...result[key], data];
      });

      setAllAnimation(result);

      await fetch(mainState.pageConfig.ajaxurl, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Accept: "application/json",
        },

        body: new URLSearchParams({
          action: "wcf_anim_builder_configs_store",
          pageTypeConfigs: JSON.stringify(mainState.pageConfig.pageTypeConfigs),
          wcf_nonce: mainState.pageConfig.nonce,
          animationConfigs: JSON.stringify(result),
        }),
      })
        .then((response) => {
          return response.json();
        })
        .then((return_content) => {
          toast("Animation Create Successfully");
        });
    },
    [mainState.allAnimation, mainState.pageConfig, mainState.selectedDevice],
  );

  const updateAnimation = useCallback(
    async (allAnimation) => {
      console.log("hit update animation");
      const cfg = mainState.pageConfig;

      await fetch(cfg?.ajaxurl, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Accept: "application/json",
        },
        body: new URLSearchParams({
          action: "wcf_anim_builder_configs_store",
          pageTypeConfigs: JSON.stringify(cfg.pageTypeConfigs),
          wcf_nonce: cfg.nonce,
          animationConfigs: JSON.stringify(
            allAnimation || mainState.allAnimation,
          ),
        }),
      })
        .then((response) => {
          return response.json();
        })
        .then((return_content) => {
          toast("Animation Save Successfully");
        });
    },
    [mainState.allAnimation, mainState.pageConfig],
  );

  const temporarySave = useCallback(
    async (data) => {
      const currentDevice = mainState.selectedDevice;
      const deviceOrder = getResponsiveAndBelow(currentDevice);
      const deviceAnim = mainState?.allAnimation[currentDevice] || [];

      const oldAnimStore = structuredClone(mainState?.allAnimation || {});

      if (data?.ScrollTrigger?.enable) {
        const isValid = CheckProperties(data?.ScrollTrigger?.properties);
        if (!isValid.status) {
          return updateContentData(
            { ...data?.ScrollTrigger, properties: isValid.data },
            "ScrollTrigger",
          );
        }
      }

      const clonedData = structuredClone(data);

      const updatedDeviceAnim = deviceAnim.map((el) =>
        el.id === clonedData.id ? clonedData : structuredClone(el),
      );

      const newAllAnimation = {
        ...structuredClone(oldAnimStore),
        [currentDevice]: updatedDeviceAnim,
      };

      const sourceIndex = deviceOrder.indexOf(currentDevice);
      const sourceEl = updatedDeviceAnim.find((el) => el.id === clonedData.id);

      if (!sourceEl) {
        console.warn(
          `Element with id ${clonedData.id} not found in current device`,
        );
        return;
      }

      for (let i = sourceIndex + 1; i < deviceOrder.length; i++) {
        const targetDevice = deviceOrder[i];
        const targetList = newAllAnimation[targetDevice] || [];

        const parentDevice = deviceOrder[i - 1];
        const parentList = newAllAnimation[parentDevice] || [];
        const parentEl = parentList.find((el) => el.id === clonedData.id);

        const oldValue = structuredClone(
          oldAnimStore[parentDevice]?.find((el) => el.id === clonedData.id) ||
            {},
        );

        let found = false;
        const updatedTargetList = targetList.map((targetEl) => {
          if (targetEl.id !== clonedData.id) return structuredClone(targetEl);
          found = true;
          const isCustomized = isElementCustomized(
            targetEl,
            sourceEl,
            targetDevice,
            deviceOrder,
            newAllAnimation,
          );

          if (isCustomized) {
            const result = deepSmartMerge(
              parentEl || sourceEl,
              targetEl,
              oldValue,
            );

            return result;
          } else {
            return structuredClone(parentEl || sourceEl);
          }
        });

        if (!found) {
          updatedTargetList.push(structuredClone(parentEl || sourceEl));
        }

        newAllAnimation[targetDevice] = updatedTargetList;
      }

      setAllAnimation(newAllAnimation);
    },
    [mainState.allAnimation, mainState.contentStep, mainState.selectedDevice],
  );

  const duplicateAnimation = useCallback(
    (id) => {
      const deviceAnim = mainState?.allAnimation["desktop"];
      const original = deviceAnim?.find((el) => el.id === id);
      if (!original) return;

      const data = structuredClone(original);

      const sameTitle = deviceAnim?.filter((el) => {
        return (
          el.title === data.title ||
          removeFromDynamicCopy(el.title) === data.title
        );
      });

      data.id = generateUniqueId();
      data.title = copyTitle(data.title, sameTitle);

      const timelineMap = {};
      data.timelines = data.timelines?.map((timeline) => {
        const newId = generateUniqueId();
        timelineMap[timeline.id] = newId;
        return { ...timeline, id: newId };
      });

      data.animations = data.animations?.map((animation) => ({
        ...animation,
        id: generateUniqueId(),
        timeline: timelineMap[animation.timeline] || animation.timeline,
        properties: animation.properties?.map((property) => ({
          ...property,
          id: generateUniqueId(),
        })),
      }));

      data.ScrollTrigger = {
        ...data.ScrollTrigger,
        properties: data.ScrollTrigger?.properties?.map((property) => ({
          ...property,
          id: generateUniqueId(),
        })),
        timeline:
          timelineMap[data.ScrollTrigger?.timeline] ||
          data.ScrollTrigger?.timeline,
      };

      data.customFields = data.customFields?.map((field) => ({
        ...field,
        id: generateUniqueId(),
      }));

      const updated = {};

      for (const device in mainState.allAnimation) {
        const deviceAnim = mainState.allAnimation[device] || [];
        updated[device] = [...deviceAnim, data];
      }

      setAllAnimation(updated);
    },
    [mainState.allAnimation, mainState.selectedDevice],
  );

  const deleteAnimation = useCallback(
    async (id) => {
      console.log("hit delete animation");
      const result = {};

      for (const device in mainState.allAnimation) {
        result[device] = mainState.allAnimation[device].filter(
          (el) => el.id !== id,
        );
      }

      setAllAnimation(result);

      await fetch(mainState.pageConfig.ajaxurl, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Accept: "application/json",
        },
        body: new URLSearchParams({
          action: "wcf_anim_builder_configs_store",
          pageTypeConfigs: JSON.stringify(mainState.pageConfig.pageTypeConfigs),
          wcf_nonce: mainState.pageConfig.nonce,
          animationConfigs: JSON.stringify(result),
        }),
      })
        .then((response) => {
          return response.json();
        })
        .then((return_content) => {
          toast("Animation Delete Successfully");
        });
    },
    [mainState.allAnimation, mainState.pageConfig, mainState.selectedDevice],
  );

  const updateContentData = useCallback(
    (value, key) => {
      let result;
      if (key) {
        result = {
          ...mainState.contentStep,
          data: { ...mainState.contentStep?.data, [key]: value },
        };
      } else {
        result = value;
      }
      setContentStep(result);
      temporarySave(result.data);
    },
    [mainState.contentStep],
  );

  const updateTimelineData = useCallback(
    (data) => {
      if (data) {
        const items = mainState?.contentStep?.data?.timelines?.map((el) => {
          if (el.id === data.id) {
            el = data;
            return el;
          } else {
            return el;
          }
        });
        if (items) {
          const result = {
            ...mainState.contentStep,
            data: {
              ...mainState.contentStep?.data,
              timelines: items,
            },
          };
          setContentStep(result);
          temporarySave(result.data);
        }
      }
    },
    [mainState.contentStep],
  );

  const updateAnimationData = useCallback(
    (data) => {
      if (data) {
        const items = mainState?.contentStep?.data?.animations?.map((el) => {
          if (el.id === data.id) {
            el = data;
            return el;
          } else {
            return el;
          }
        });
        if (items) {
          const result = {
            ...mainState.contentStep,
            data: {
              ...mainState.contentStep?.data,
              animations: items,
            },
          };
          setContentStep(result);
          temporarySave(result.data);
        }
      }
    },
    [mainState.contentStep],
  );

  const duplicateTimeline = useCallback(
    (id) => {
      const fullContent = { ...mainState.contentStep };
      const { timelines } = fullContent?.data;
      const data = timelines?.find((el) => el.id === id);
      const sameTitle = timelines?.filter((el) => {
        if (el.title === data.title) {
          return el;
        } else if (removeFromDynamicCopy(el.title) === data.title) {
          return el;
        }
      });

      const modifyTitle = copyTitle(data.title, sameTitle);

      fullContent.data.timelines = [
        ...fullContent.data.timelines,
        { ...data, id: generateUniqueId(), title: modifyTitle },
      ];
      setContentStep(fullContent);
      temporarySave(fullContent.data);
    },
    [mainState.contentStep],
  );

  const deleteTimeline = useCallback(
    (id) => {
      const fullContent = { ...mainState.contentStep };
      const { timelines } = fullContent?.data;
      const result = timelines?.filter((el) => el.id !== id);

      fullContent.data.timelines = result;
      setContentStep(fullContent);
      temporarySave(fullContent.data);
    },
    [mainState.contentStep],
  );

  const duplicateAnimationData = useCallback(
    (id) => {
      const fullContent = { ...mainState.contentStep };
      const { animations } = fullContent?.data;
      const data = animations?.find((el) => el.id === id);
      const sameTitle = animations?.filter((el) => {
        if (el.title === data.title) {
          return el;
        } else if (removeFromDynamicCopy(el.title) === data.title) {
          return el;
        }
      });

      const modifyTitle = copyTitle(data.title, sameTitle);

      fullContent.data.animations = [
        ...fullContent.data.animations,
        { ...data, id: generateUniqueId(), title: modifyTitle },
      ];
      setContentStep(fullContent);
      temporarySave(fullContent.data);
    },
    [mainState.contentStep],
  );

  const deleteAnimationData = useCallback(
    (id) => {
      const fullContent = { ...mainState.contentStep };
      const { animations } = fullContent?.data;
      const result = animations?.filter((el) => el.id !== id);

      fullContent.data.animations = result;
      setContentStep(fullContent);
      temporarySave(fullContent.data);
    },
    [mainState.contentStep],
  );

  const updateResponsive = useCallback(
    (id, device, value) => {
      setAllAnimation({
        ...mainState.allAnimation,
        [device]: mainState.allAnimation[device].map((el) =>
          el.id === id ? { ...el, enable: value } : el,
        ),
      });
    },
    [mainState.allAnimation],
  );

  return {
    mainState,
    // Eiditor functions
    setIsEditorLoading,
    setEditorZoomLevel,
    setEditorXPlacement,
    resetEditorPreview,
    toggleController,
    toggleStructure,
    // Animation functions
    setContentStep,
    setAllAnimation,
    updateContentData,
    updateTimelineData,
    updateAnimationData,
    createAnimation,
    updateAnimation,
    temporarySave,
    duplicateAnimation,
    deleteAnimation,
    duplicateTimeline,
    deleteTimeline,
    duplicateAnimationData,
    deleteAnimationData,
    updateResponsive,
    setPageConfig,
    setSelectedDevice,
  };
};

export const AppContext = createContext({
  mainState: initialState,
  setContentStep: () => {},
  setAllAnimation: () => {},
  setPageConfig: () => {},
  setSelectedDevice: () => {},
});

export const AppContextProvider = ({ children }) => {
  return (
    <AppContext.Provider value={useMainContext(initialState)}>
      {children}
    </AppContext.Provider>
  );
};
