export const activePresetFn = (
  mainContent,
  data,
  dispatch,
  presetType = null
) => {
  if (!presetType) {
    console.error("Preset type is required!");
    return;
  }

  const result = Object.fromEntries(
    Object.entries(mainContent.elements).map(([key, value]) => {
      const filteredElements = Object.fromEntries(
        Object.entries(value.elements || {}).filter(([key2, value2]) => {
          if (key2 === data.slug) {
            value2.is_active = data.value;
            if (!data.value) {
              value.is_active = data.value;
            }
            return [key2, value2];
          } else {
            return [key2, value2];
          }
        })
      );

      return [key, { ...value, elements: filteredElements }];
    })
  );

  if (!data.value) {
    dispatch({
      type: presetType,
      value: {
        ...mainContent,
        is_active: data.value,
        elements: result,
      },
    });
  } else {
    dispatch({
      type: presetType,
      value: {
        ...mainContent,
        elements: result,
      },
    });
  }
};

export const activeGroupPresetFn = (
  mainContent,
  data,
  dispatch,
  presetType = null
) => {
  if (!presetType) {
    console.error("Preset type is required!");
    return;
  }
  const result = Object.fromEntries(
    Object.entries(mainContent.elements).map(([key, value]) => {
      const filteredElements = Object.fromEntries(
        Object.entries(value.elements || {}).filter(([key2, value2]) => {
          if (key === data.slug) {
            value2.is_active = data.value;
            return [key2, value2];
          } else {
            return [key2, value2];
          }
        })
      );
      if (key === data.slug) {
        value.is_active = data.value;
      }
      return [key, { ...value, elements: filteredElements }];
    })
  );

  if (!data.value) {
    dispatch({
      type: presetType,
      value: {
        ...mainContent,
        is_active: data.value,
        elements: result,
      },
    });
  } else {
    dispatch({
      type: presetType,
      value: {
        ...mainContent,
        elements: result,
      },
    });
  }
};

export const activeFullPresetFn = (
  mainContent,
  data,
  dispatch,
  presetType = null
) => {
  if (!presetType) {
    console.error("Preset type is required!");
    return;
  }
  const result = Object.fromEntries(
    Object.entries(mainContent.elements).map(([key, value]) => {
      const filteredElements = Object.fromEntries(
        Object.entries(value.elements || {}).filter(([key2, value2]) => {
          value2.is_active = data.value;
          return [key2, value2];
        })
      );
      value.is_active = data.value;
      return [key, { ...value, elements: filteredElements }];
    })
  );

  dispatch({
    type: presetType,
    value: {
      is_active: data.value,
      elements: result,
    },
  });
};
