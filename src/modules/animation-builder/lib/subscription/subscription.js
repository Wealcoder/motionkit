// functions to validate premium plguins
export const isPremiumUser = () => {
  if (!window.WCF_ANIMATION_BUILDER) return false;
  const { subs = "0" } = window.WCF_ANIMATION_BUILDER || {};
  return subs === "1";
};
