export const handleSetOrResetAnimation = (eventData, callback) => {
  if (typeof callback !== "function" || !Object.keys(eventData)?.length) return;
  const { animation_config = [] } = eventData || {};
  callback({ animation_config, data: eventData });
  return;
};
