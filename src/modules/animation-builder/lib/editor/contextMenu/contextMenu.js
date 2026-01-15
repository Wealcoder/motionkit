import { menuItems } from "@/register/context_menu/context_menu_register";
import { hideClassSelector } from "@/lib/editor/classSelectorHelper";

// register context menus
export const registerContextMenu = () => {
  menuItems?.forEach((menu) =>
    AAEAnimPreviewBuilder.contextMenu.register(menu)
  );
};

// showing context menu
export const dispathContextMenu = (event) => {
  event.preventDefault();
  // hiding class selector modal
  hideClassSelector();
  const target = event.target;
  if (target.closest(".wcfanimb-skip-selector-full")) return;
  AAEAnimPreviewBuilder.contextMenu.updateContextMenu({
    target,
    x: event.clientX,
    y: event.clientY,
  });
  window.dispatchEvent(new CustomEvent("wcf-open-context-menu"));
};
