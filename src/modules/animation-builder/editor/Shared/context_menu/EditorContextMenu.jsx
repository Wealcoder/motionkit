import { useRef, useState, useEffect } from "react";
import "./editorContextMenu.css";
import { hideClassSelector } from "@/lib/editor/classSelectorHelper";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowDown01Icon,
  ArrowRight01Icon,
} from "@hugeicons/core-free-icons/index";

const clamp = (v, min, max) => Math.min(Math.max(v, min), max);

/* ---------- Root Context Menu ---------- */

const EditorContextMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [targetElement, setTargetElement] = useState(null);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
  const [activePath, setActivePath] = useState([]);
  const { menus } = AAEAnimPreviewBuilder.contextMenu.getProps() || {};
  const tagName = targetElement?.tagName?.toLowerCase() ?? "";
  const firstClassName = targetElement?.classList?.[0] ?? "";

  const handleCloseMenu = () => {
    setIsOpen(false);
    setTargetElement(null);
    setActivePath([]);
  };

  const handleStartMenu = () => {
    hideClassSelector();
    const { target, position } =
      AAEAnimPreviewBuilder.contextMenu.getProps() || {};
    if (!target) return;

    setTargetElement(target);
    setMenuPosition(position);
    setIsOpen(true);
  };

  useEffect(() => {
    window.addEventListener("wcf-open-context-menu", handleStartMenu);
    window.addEventListener("wcf-close-context-menu", handleCloseMenu);
    window.addEventListener("wheel", handleCloseMenu);
    return () => {
      window.removeEventListener("wcf-open-context-menu", handleStartMenu);
      window.removeEventListener("wcf-close-context-menu", handleCloseMenu);
      window.removeEventListener("wheel", handleCloseMenu);
    };
  }, []);

  if (!menus?.length || !targetElement || !isOpen) return null;

  const rootStyle = {
    left: clamp(menuPosition.x, 8, window.innerWidth - 265 - 8),
    top: clamp(menuPosition.y, 8, window.innerHeight - 8),
  };

  return (
    <div
      className="wcfanimb-skip-selector-full wcf-context-menu-wrapper"
      style={rootStyle}
    >
      {/* Element Info */}
      <div className="wcf-context-header">
        <p>Element</p>
        {targetElement.nodeType === 1 && (
          <p className="tag">{`<${tagName}>`}</p>
        )}
        {!!firstClassName && (
          <p className="class">
            {firstClassName.length > 25
              ? `${firstClassName.slice(0, 25)}...`
              : firstClassName}
          </p>
        )}
      </div>

      <Menu
        menus={menus}
        targetElement={targetElement}
        activePath={activePath}
        setActivePath={setActivePath}
        level={0}
      />
    </div>
  );
};

export default EditorContextMenu;

function Menu({ menus, targetElement, activePath, setActivePath, level }) {
  return (
    <ul className="wcf-context-menu">
      {menus.map((menu) => {
        if (!menu?.contextMenuKey) return null;

        const hasSubmenu = !!menu.options?.length;
        const isOpen = activePath[level] === menu.contextMenuKey;

        return (
          <MenuItem
            key={menu.contextMenuKey}
            menu={menu}
            hasSubmenu={hasSubmenu}
            isOpen={isOpen}
            targetElement={targetElement}
            activePath={activePath}
            setActivePath={setActivePath}
            level={level}
          />
        );
      })}
    </ul>
  );
}

function MenuItem({
  menu,
  hasSubmenu,
  isOpen,
  targetElement,
  activePath,
  setActivePath,
  level,
}) {
  const liRef = useRef(null);
  const [direction, setDirection] = useState("right");

  // TODO: fix third menu position when open on the right edge of the iframe
  const detectFlip = () => {
    if (!liRef.current) return;
    const parentRect = liRef.current.getBoundingClientRect();
    const spaceRight = window.innerWidth - parentRect.right;
    const spaceLeft = parentRect.left;

    if (spaceRight < 250 && spaceLeft > 250) {
      setDirection("left");
    } else {
      setDirection("right");
    }
  };

  return (
    <li
      ref={liRef}
      className="wcf-ab-context-menuItems "
      onMouseEnter={() => {
        if (!hasSubmenu) return;
        detectFlip();
        setActivePath((prev) => {
          const next = prev.slice(0, level);
          next[level] = menu.contextMenuKey;
          return next;
        });
      }}
      onClick={() => {
        if (typeof menu.callback === "function") {
          menu.callback(targetElement, menu);
        }
      }}
      onMouseDown={(e) => e.preventDefault()}
    >
      <div className="text-sm menu-row transition-all duration-100 ease-out active:scale-x-95 active:scale-y-90 active:translate-y-[1px] active:opacity-90">
        <span className="menu-title">
          {menu.icon ?? ""}
          {menu.title}
        </span>
        {hasSubmenu && (
          <HugeiconsIcon
            icon={direction === "right" ? ArrowRight01Icon : ArrowDown01Icon}
          />
        )}
      </div>

      {hasSubmenu && isOpen && (
        <div className={`submenu submenu--${direction}`}>
          <Menu
            menus={menu.options}
            targetElement={targetElement}
            activePath={activePath}
            setActivePath={setActivePath}
            level={level + 1}
          />
        </div>
      )}
    </li>
  );
}
