import { useRef, useState, useEffect } from "react";
// import { IoIosArrowForward } from "react-icons/io"; // use huge icon instead
import "./editorContextMenu.css";
import { hidePopup } from "@/lib/animationUtils";

const clamp = (v, min, max) => {
  return Math.min(Math.max(v, min), max);
};

const EditorContextMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [targetElement, setTargetElement] = useState(null);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
  const [activePath, setActivePath] = useState([]);
  const [pendingActions, setPendingActions] = useState({});
  const { menus } = AAEAnimPreviewBuilder.contextMenu.getProps() || {};

  // contxt menu closing handler
  const handleCloseMenu = () => {
    setIsOpen(false);
    setTargetElement(null);
    setMenuPosition({ x: 0, y: 0 });
    setActivePath([]);
  };

  // context menu opening handler
  const handleStartMenu = () => {
    hidePopup();
    const { target, position } =
      AAEAnimPreviewBuilder.contextMenu.getProps() || {};
    if (!target) return;
    setTargetElement(target);
    setMenuPosition(position);
    setIsOpen(true);
  };

  useEffect(() => {
    // opening context menu event
    window.addEventListener("wcf-open-context-menu", handleStartMenu);
    // closing context menu event
    window.addEventListener("wcf-close-context-menu", handleCloseMenu);
    window.addEventListener("wheel", handleCloseMenu);

    return () => {
      window.removeEventListener("wcf-open-context-menu", handleStartMenu);
      window.removeEventListener("wcf-close-context-menu", handleCloseMenu);
      window.removeEventListener("wheel", handleCloseMenu);
    };
  }, []);

  if (!menus?.length || !targetElement || !isOpen) return null;

  // Conditional style properties
  const rootStyle = {
    position: "fixed",
    left: clamp(menuPosition.x, 8, window.innerWidth - 250 - 8),
    top: clamp(menuPosition.y, 8, window.innerHeight - 8),
  };

  return (
    <div
      // todo: same element context menu not upadating position.
      key={`${menuPosition.x}-${menuPosition.y}`}
      className="wcfanimb-skip-selector-full"
      style={{ ...rootStyle }}
    >
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

function Menu({
  menus = [],
  targetElement,
  activePath,
  setActivePath,
  level = 0,
  parentFlip = { x: false, y: false },
}) {
  const menuRef = useRef(null);
  const [flipX, setFlipX] = useState(parentFlip.x);
  const [flipY, setFlipY] = useState(parentFlip.y);
  const [isHoveringMenu, setIsHoveringMenu] = useState(false);

  const isSubmenuBlocked = level >= 3;

  // Handling submenu flipping to viewport
  useEffect(() => {
    if (!menuRef.current) return;
    const rect = menuRef.current.getBoundingClientRect();
    const overflowRight = rect.right > window.innerWidth;
    const overflowBottom = rect.bottom > window.innerHeight;
    setFlipX(parentFlip.x || overflowRight);
    setFlipY(parentFlip.y || overflowBottom);
  }, []);

  const submenuStyle = {
    position: "absolute",
    top: flipY ? "auto" : 0,
    bottom: flipY ? 0 : "auto",
    left: flipX ? "auto" : "100%",
    right: flipX ? "100%" : "auto",
  };

  return (
    <ul ref={menuRef} className="wcf-context-menu" style={{ ...submenuStyle }}>
      {menus.map((menu) => {
        if (!menu?.contextMenuKey) return null;
        const isOpen = activePath[level] === menu.contextMenuKey;
        const hasSubmenu = !!menu?.options?.length;
        return (
          <li
            key={menu.contextMenuKey}
            className="wcf-ab-context-menuItems"
            style={{ position: "relative" }}
            onClick={async () => {
              if (typeof menu?.callback !== "function" || !menu?.callback)
                return;
              menu.callback(targetElement, menu);
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
            onMouseDown={(e) => e.preventDefault()} // prevent selecting text on double click
          >
            <span>{menu.title}</span>
            {/* {menu?.options?.length > 0 && <IoIosArrowForward />} */}

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
