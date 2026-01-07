const validToastType = ["success", "error", "info", "loading"];

// helper function for generating iframe toast inside editor. For output function please checkout generateToast under lib > editor
export const helpToastEvent = ({ type, message }) => {
  if (!type || !message) return;
  const isTypeValid = validToastType?.includes(type);
  window.parent.postMessage(
    {
      type: "WCF-AB-TOAST-TRIGGER",
      toastType: isTypeValid ? type : "info",
      message,
    },
    "*"
  );
};
