import { Kernel } from "@/context/app.kernel";
import { AppContext } from "@/context/app.context";
import { useContext } from "react";

export const useKernel = () => {
  const currentKernelData = useContext(Kernel);
  const { mainState, ...rest } = currentKernelData || {};
  const settings = structuredClone(mainState);
  return {
    settings,
    ...rest,
  };
};

export const useContentStep = () => {
  const {
    mainState: { contentStep: store },
    setContentStep,
    updateContentData,
    updateTimelineData,
    updateAnimationData,
    duplicateTimeline,
    deleteTimeline,
    duplicateAnimationData,
    deleteAnimationData,
  } = useContext(AppContext);
  const contentStep = structuredClone(store);
  return {
    contentStep,
    setContentStep,
    updateContentData,
    updateTimelineData,
    updateAnimationData,
    duplicateTimeline,
    deleteTimeline,
    duplicateAnimationData,
    deleteAnimationData,
  };
};

export const useAnimationControl = () => {
  const {
    mainState: { allAnimation: store },
    createAnimation,
    updateAnimation,
    temporarySave,
    duplicateAnimation,
    deleteAnimation,
    setAllAnimation,
    updateResponsive,
  } = useContext(AppContext);
  const allAnimation = structuredClone(store);
  return {
    allAnimation,
    createAnimation,
    updateAnimation,
    temporarySave,
    duplicateAnimation,
    deleteAnimation,
    setAllAnimation,
    updateResponsive,
  };
};

export const usePageConfig = () => {
  const {
    mainState: { pageConfig },
    setPageConfig,
  } = useContext(AppContext);
  return {
    pageConfig,
    setPageConfig,
  };
};

export const useDeviceConfig = () => {
  const {
    mainState: { selectedDevice },
    setSelectedDevice,
  } = useContext(AppContext);
  return {
    selectedDevice,
    setSelectedDevice,
  };
};
