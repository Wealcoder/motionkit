export const CheckProperties = (properties) => {
  if (properties?.length) {
    const emptyValue = properties.find((el) => !el.value);
    if (emptyValue) {
      const result = properties.map((el) => {
        if (!el.value) {
          el.isError = true;
          el.errorMessage = "*required";
          return el;
        } else {
          return el;
        }
      });

      return {
        status: false,
        data: result,
      };
    } else {
      return {
        status: true,
      };
    }
  } else {
    return {
      status: true,
    };
  }
};

// functions to validate premium plguins
export const isPremiumUser = () => {
  if (!window.WCF_ANIMATION_BUILDER) return false;
  const { subs = "0" } = window.WCF_ANIMATION_BUILDER || {};
  return subs === "1";
};
