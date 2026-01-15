import { toast } from "sonner";
const validToastType = ["success", "error", "info", "loading"];

// helper function for generating iframe toast inside editor.
export const handleToastEventFromIframe = ({ type, message }) => {
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

// display toast event
export const generateToast = (toastType, message) => {
  if (!toastType || !message) return;
  switch (toastType.toLowerCase()) {
    case "success":
      toast.success(message);
      break;
    case "error":
      toast.error(message);
      break;
    case "loading":
      toast.loading(message);
      break;
    case "info":
    default:
      toast(message);
      break;
  }
};
