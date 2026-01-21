import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import { ViewIcon } from "@hugeicons/core-free-icons";
import { useState } from "react";

const ActivateBorderBtn = () => {
  const [activeBorder, setActiveBorder] = useState(false);

  const updateActiveBorder = (value) => {
    const iframe = document.getElementById(
      "wcf--animation-builder--animation--preview",
    );
    setActiveBorder(value);
    localStorage.setItem("aae_selected_border", value);
    if (iframe) {
      const win = iframe.contentWindow;
      win.postMessage({ aae_show_border: value });
    }
  };

  return (
    <Button
      className={`wcf-ab-button-icon`}
      onClick={() => updateActiveBorder(!activeBorder)}
    >
      <HugeiconsIcon icon={ViewIcon} size={16} strokeWidth={2} />
    </Button>
  );
};

export default ActivateBorderBtn;
