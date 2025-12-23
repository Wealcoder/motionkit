import { useEffect, useState } from "react";
import "./editorContextMenu.css";
import { IoIosArrowForward } from "react-icons/io";
import { getFullSelector, hidePopup } from "@/frontend/animationUtils";
import { useAnimationControl, useContentStep } from "@/hooks/app.hooks";
import { generateUniqueId } from "../../../utils/generateUniqueId";
import { ABCustomPresetData } from "@/config/animationPresetData";

const EditorContextMenu = () => {
  const [menuItems, setMenuItem] = useState([]);
  const [open, setOpen] = useState(false);
  const [context, setContext] = useState({ target: null, x: 0, y: 0 });
  const [activePath, setActivePath] = useState([]);

  const handleCloseMenu = () => {
    setOpen(false);
    setContext({ target: null, x: 0, y: 0 });
    hidePopup();
  };

  // for add animation
  const { setContentStep } = useContentStep();
  const { createAnimation } = useAnimationControl();

  // load context menus
  useEffect(() => {
    const menus = AAEAnimPreviewBuilder.contextMenu.getContextMenus();
    if (!menus) return;
    setMenuItem(menus);
  }, [AAEAnimPreviewBuilder.contextMenu]);

  useEffect(() => {
    const openHandler = () => {
      setContext({ ...window.__WCF_CONTEXT__ });
      setOpen(true);
    };

    const closeHandler = () => setOpen(false);

    window.addEventListener("wcf-open-context-menu", openHandler);
    window.addEventListener("click", closeHandler);
    window.addEventListener("wheel", closeHandler);

    return () => {
      window.removeEventListener("wcf-open-context-menu", openHandler);
      window.removeEventListener("click", closeHandler);
      window.removeEventListener("wheel", closeHandler);
    };
  }, []);

  if (!context) return null;

  return (
    <div style={{ display: open ? "flex" : "none" }}>
      <Menu
        menuItems={menuItems}
        context={context}
        activePath={activePath}
        setActivePath={setActivePath}
        handleCloseMenu={handleCloseMenu}
      />
    </div>
  );
};

export default EditorContextMenu;

function Menu({
  menuItems = [],
  context = {},
  activePath = [],
  setActivePath = () => {},
  level = 0,
  handleCloseMenu = () => {},
}) {
  const [hoverdMenuKey, setHoveredMenuKey] = useState(null);
  const [openLeft, setOpenLeft] = useState(false);

  const isRoot = level === 0;

  return (
    <ul
      className="wcf-context-menu"
      style={
        isRoot
          ? {
              position: "fixed",
              top: context?.y ?? 0,
              left: context?.x ?? 0,
            }
          : {
              position: "absolute",
              top: 0,
              ...(openLeft
                ? { right: "100%", left: "auto" }
                : { left: "100%", right: "auto" }),
            }
      }
    >
      {menuItems.map((menu, index) => {
        const hasSubmenu = !!menu?.options?.length;
        return (
          <li
            key={menu.key ?? index}
            className="wcf-ab-context-menuItems"
            style={{ position: "relative" }}
            onClick={() => {
              if (menu?.callback && typeof menu?.callback === "function") {
                menu.callback(context, { ...menu });
              }
            }}
            onMouseEnter={(e) => {
              if (!hasSubmenu) return;
              setActivePath();
              const rect = e.currentTarget.getBoundingClientRect();
              const shouldFlip = rect.right + 255 > window.innerWidth;
              setOpenLeft(shouldFlip);
              setHoveredMenuKey(menu.key);
            }}
            onMouseLeave={() => {
              setHoveredMenuKey(null);
              setOpenLeft(false);
            }}
          >
            {menu.title}

            {hasSubmenu && (
              <>
                <IoIosArrowForward />
                {hoverdMenuKey === menu.key && (
                  <Menu
                    menuItems={menu.options}
                    context={context}
                    level={level + 1}
                  />
                )}
              </>
            )}
          </li>
        );
      })}
    </ul>
  );
}
