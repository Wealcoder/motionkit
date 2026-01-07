import { toast } from "sonner";
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
