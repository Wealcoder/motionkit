// helper to clear clipboard
const clearClipboard = async () => {
  console.log("triggerd");
  if (navigator.clipboard && window.isSecureContext) {
    await navigator.clipboard.writeText("");
    return;
  }

  // legacy fallback
  const tempTextarea = document.createElement("textarea");
  tempTextarea.value = "";
  tempTextarea.style.position = "fixed";
  tempTextarea.style.top = "-9999px";
  document.body.appendChild(tempTextarea);
  tempTextarea.focus();
  tempTextarea.select();
  document.execCommand("copy");
  document.body.removeChild(tempTextarea);
};

// helper function to copy clipboard
export function copyToClipboard(textToCopy) {
  return new Promise(async (resolve, reject) => {
    if (!textToCopy) {
      reject(new Error("No text provided to copy"));
      return;
    }

    if (textToCopy === "N/A") {
      try {
        await clearClipboard();
      } catch (_) {}
      reject(new Error("The selected element class or id is not available."));
      return;
    }

    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(textToCopy).then(resolve).catch(reject);
      return;
    }

    try {
      const tempTextarea = document.createElement("textarea");
      tempTextarea.value = textToCopy;
      tempTextarea.style.position = "fixed";
      tempTextarea.style.top = "-9999px";
      tempTextarea.setAttribute("readonly", "");

      document.body.appendChild(tempTextarea);
      tempTextarea.focus();
      tempTextarea.select();

      const success = document.execCommand("copy");
      document.body.removeChild(tempTextarea);

      success ? resolve() : reject(new Error("Failed to copy selector!"));
    } catch (err) {
      reject(err);
    }
  });
}
