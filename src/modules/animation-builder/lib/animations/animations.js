export const handleSetOrResetAnimation = (eventData, callback) => {
  if (typeof callback !== "function" || !Object.keys(eventData)?.length) return;
  const { animation_config = [] } = eventData || {};
  callback({ animation_config, data: eventData });
  return;
};

export const getValueFromPath = (data, path) => {
  if (!data || !path) return null;
  const splitedPath = path.split(".");
  return splitedPath.reduce((current, key) => {
    if (current === undefined || current === null) return null;
    return current[key];
  }, data);
};

export const setValueByPath = (data, path, value) => {
  if (!data || !path) return data;
  const splitedPath = path.split(".");
  splitedPath.reduce((current, key, index) => {
    if (index === splitedPath.length - 1) {
      current[key] = value;
    } else {
      if (!current[key] || typeof current[key] !== "object") {
        current[key] = {};
      }
    }
    return current[key];
  }, data);
};
