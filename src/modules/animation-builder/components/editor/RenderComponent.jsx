import React from "react";

const RenderComponent = ({
  selectedPresetGroup,
  selectedPreset,
  contentStep,
  updateContentData,
}) => {
  if (!selectedPreset) return null;
  const animationPresets = AAEAnimBuilder.presets;
  const preset = animationPresets.getPreset(selectedPresetGroup, selectedPreset);
  if (!preset) return null;

  const { component } = preset;
  if (!component) return null;

  const extraProps = { contentStep, updateContentData };

  // Case A: stored as a component type (preferred)
  if (typeof component === "function") {
    const Component = component;
    return <Component {...extraProps} />;
  }

  // Case B: stored as an element (<ScrollVideoPrest />)
  if (React.isValidElement(component)) {
    return React.cloneElement(component, extraProps);
  }

  console.warn(
    "preset.component is neither a component type nor a valid element:",
    component
  );
  return null;
};

export default RenderComponent;
