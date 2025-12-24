import { useRef, useState, useEffect } from "react";
import { IoIosArrowForward } from "react-icons/io";
import "./editorContextMenu.css";
import { hidePopup } from "@/lib/animationUtils";

const EditorContextMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [targetElement, setTargetElement] = useState(null);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
  const [activePath, setActivePath] = useState([]);

  const { menus } = AAEAnimPreviewBuilder.contextMenu.getProps() || {};

  const handleCloseMenu = () => {
    hidePopup();
    setIsOpen(false);
    setTargetElement(null);
    setMenuPosition({ x: 0, y: 0 });
    setActivePath([]);
  };

  const handleStartMenu = () => {
    const { target, position } =
      AAEAnimPreviewBuilder.contextMenu.getProps() || {};
    if (!target) return;
    setIsOpen(true);
    setTargetElement(target);
    setMenuPosition(position);
  };

  useEffect(() => {
    window.addEventListener("wcf-open-context-menu", handleStartMenu);
    window.addEventListener("click", handleCloseMenu);
    window.addEventListener("wheel", handleCloseMenu);

    return () => {
      window.removeEventListener("wcf-open-context-menu", handleStartMenu);
      window.removeEventListener("click", handleCloseMenu);
      window.removeEventListener("wheel", handleCloseMenu);
    };
  }, []);

  if (!menus?.length || !targetElement || !isOpen) return null;

  return (
    <div className="wcfanimb-skip-selector-full">
      <Menu
        menus={menus}
        targetElement={targetElement}
        menuPosition={menuPosition}
        activePath={activePath}
        setActivePath={setActivePath}
      />
    </div>
  );
};

export default EditorContextMenu;

const clamp = (v, min, max) => {
  return Math.min(Math.max(v, min), max);
};

function Menu({
  menus = [],
  targetElement,
  menuPosition = { x: 0, y: 0 },
  activePath,
  setActivePath,
  level = 0,
  parentFlip = { x: false, y: false },
}) {
  const menuRef = useRef(null);
  const [flipX, setFlipX] = useState(parentFlip.x);
  const [flipY, setFlipY] = useState(parentFlip.y);
  const [isHoveringMenu, setIsHoveringMenu] = useState(false);

  const isRoot = level === 0;
  const isSubmenuBlocked = level >= 3;

  // Handling submenu flipping to viewport
  useEffect(() => {
    if (!menuRef.current || isRoot) return;
    const rect = menuRef.current.getBoundingClientRect();
    const overflowRight = rect.right > window.innerWidth;
    const overflowBottom = rect.bottom > window.innerHeight;
    setFlipX(parentFlip.x || overflowRight);
    setFlipY(parentFlip.y || overflowBottom);
  }, []);

  // Conditional style properties
  const rootStyle = isRoot
    ? {
        position: "fixed",
        left: clamp(menuPosition.x, 8, window.innerWidth - 250 - 8),
        top: clamp(menuPosition.y, 8, window.innerHeight - 8),
      }
    : {};

  const submenuStyle = !isRoot
    ? {
        position: "absolute",
        top: flipY ? "auto" : 0,
        bottom: flipY ? 0 : "auto",
        left: flipX ? "auto" : "100%",
        right: flipX ? "100%" : "auto",
      }
    : {};

  return (
    <ul
      ref={menuRef}
      className="wcf-context-menu"
      style={{ ...rootStyle, ...submenuStyle }}
    >
      {menus.map((menu) => {
        if (!menu?.contextMenuKey) return null;
        const isOpen = activePath[level] === menu.contextMenuKey;
        const hasSubmenu = !!menu?.options?.length;
        return (
          <li
            key={menu.contextMenuKey}
            className="wcf-ab-context-menuItems"
            style={{ position: "relative" }}
            onClick={() => {
              if (typeof menu.callback === "function") {
                menu.callback(targetElement);
              }
            }}
            onMouseEnter={() => {
              if (!hasSubmenu) return;
              setIsHoveringMenu(true);
              setActivePath((prev) => {
                const next = prev.slice(0, level);
                next[level] = menu.contextMenuKey;
                return next;
              });
            }}
            onMouseLeave={() => {
              if (!hasSubmenu) return;
              setIsHoveringMenu(false);
            }}
          >
            <span>{menu.title}</span>
            {menu?.options?.length > 0 && <IoIosArrowForward />}

            {hasSubmenu && !isSubmenuBlocked && isHoveringMenu && isOpen && (
              <Menu
                menus={menu.options}
                targetElement={targetElement}
                activePath={activePath}
                setActivePath={setActivePath}
                level={level + 1}
                parentFlip={{ x: flipX, y: flipY }}
              />
            )}
          </li>
        );
      })}
    </ul>
  );
}
