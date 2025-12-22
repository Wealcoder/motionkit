import { useEffect, useState } from "react";
import "./editorContextMenu.css";
import { IoIosArrowForward } from "react-icons/io";
import { getFullSelector, hidePopup } from "@/frontend/animationUtils";
import { useAnimationControl, useContentStep } from "@/hooks/app.hooks";
import { generateUniqueId } from "../../../../utils/generateUniqueId";
import { ABCustomPresetData } from "@/config/animationPresetData";

const menuItems = [
  { title: "Copy Class", key: "copy-class" },
  { title: "Copy Parent Class", key: "copy-parent-class" },
  {
    title: "Add Animation",
    key: "add-animation",
    options: [
      {
        title: "Current Animation",
        key: "current-animation",
        options: [
          { title: "Classic Animation", key: "free_animation" },
          { title: "Preset Animation", key: "preset" },
          { title: "Custom Animation", key: "custom" },
        ],
      },
      { title: "Global Animation", key: "global-animation" },
    ],
  },
  { title: "Edit Animation", key: "edit-animation" },
  { title: "Preview Animation", key: "preview-animation" },
  { title: "Copy Animation", key: "copy-animation" },
  { title: "Paste Animation", key: "paste-animation" },
  { title: "Delete Animation", key: "delete-animation" },
  { title: "Save Animation", key: "save-animation" },
];

const EditorContextMenu = () => {
  const [open, setOpen] = useState(false);
  const [context, setContext] = useState({ target: null, x: 0, y: 0 });
  const [activePath, setActivePath] = useState([]);
  // for add animation
  const { setContentStep } = useContentStep();
  const { createAnimation } = useAnimationControl();

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

  const handleCloseMenu = () => {
    setOpen(false);
    setContext({ target: null, x: 0, y: 0 });
    hidePopup();
  };

  const handleCopyText = (text) => {
    if (navigator.clipboard && window.isSecureContext) {
      // Modern API for copying
      navigator.clipboard
        .writeText(text)
        .then(() => {
          handleCloseMenu();
        })
        .catch((err) => {
          console.error("Failed to copy text: ", err);
        });
    } else {
      // Fallback to manual method for older browsers
      const tempTextarea = document.createElement("textarea");
      tempTextarea.value = text;

      // Style the textarea to be offscreen
      tempTextarea.style.position = "fixed";
      tempTextarea.style.top = "-9999px";
      document.body.appendChild(tempTextarea);

      // Select the text inside the textarea
      tempTextarea.focus();
      tempTextarea.select();

      try {
        if (document.execCommand("copy")) {
          handleCloseMenu();
        }
      } catch (err) {
        console.error("Error copying text: ", err);
      }
      // Clean up by removing the temporary textarea
      document.body.removeChild(tempTextarea);
    }
  };

  const handleCopyClass = (context) => {
    const textToCopy = getFullSelector(context?.target);
    if (textToCopy) {
      handleCopyText(textToCopy);
    }
    return;
  };

  const handleCopyParentClass = (context) => {
    const textToCopy = getFullSelector(context?.target?.parentElement);
    if (textToCopy) {
      handleCopyText(textToCopy);
    }
    return;
  };

  const handleAddAnimation = (type) => {
    let sampleData = {};
    const id = generateUniqueId();
    // creating initial payload
    switch (type) {
      case "free_animation":
        sampleData = {
          id,
          title: "Free Animation",
          type,
          enable: true,
        };
        break;
      case "preset":
        sampleData = {
          id,
          title: "Animation Title",
          type,
          enable: true,
        };
        break;
      case "custom":
        sampleData = {
          ...ABCustomPresetData,
          id,
          title: ABCustomPresetData.title,
        };
    }
    setContentStep({
      step: 2,
      data: sampleData,
    });
    createAnimation(sampleData);
  };

  // menus functionality handler
  const handleMenuItem = (key, context) => {
    if (!context) return;
    switch (key) {
      case "copy-class":
        handleCopyClass(context);
        break;
      case "copy-parent-class":
        handleCopyParentClass(context);
        break;
      case "free_animation":
        handleAddAnimation(key);
        break;
      case "preset":
        handleAddAnimation(key);
        break;
      case "custom":
        handleAddAnimation(key);
        break;
      case "add-animation":
      default:
        break;
    }
  };

  if (!context) return null;

  return (
    <div
      className="wcf-context-menu"
      style={{
        display: open ? "flex" : "none", // important props for handling menus visiable state
        top: context?.y ?? 0,
        left: context?.x ?? 0,
      }}
      onMouseLeave={() => setActivePath([])}
    >
      {/* work on nested menu and design */}
      <Menu
        items={menuItems}
        activePath={activePath}
        setActivePath={setActivePath}
      />
    </div>
  );
};

export default EditorContextMenu;

function Menu({ items, activePath, setActivePath, level = 0 }) {
  return (
    <ul className="menu" style={{ left: level * 180 }}>
      {items.map((item) => {
        const isActive = activePath[level] === item.key;

        return (
          <li
            key={item.key}
            className={`menu-item ${isActive ? "active" : ""}`}
            onMouseEnter={() => {
              const nextPath = activePath.slice(0, level);
              nextPath[level] = item.key;
              setActivePath(nextPath);
            }}
          >
            <span>{item.title}</span>

            {/* Render submenu ONLY if active */}
            {item.options && isActive && (
              <Menu
                items={item.options}
                activePath={activePath}
                setActivePath={setActivePath}
                level={level + 1}
              />
            )}
          </li>
        );
      })}
    </ul>
  );
}

//  <div
// className="wcf-context-menu"
// style={{
//   display: open ? "flex" : "none", // important props for handling menus visiable state
//   top: context?.y ?? 0,
//   left: context?.x ?? 0,
// }}
//     >
//       {menuItems?.map((item, index) => (
//         <>
//           <button
//             className="wcf-context-menu-btn"
//             onClick={(e) => {
//               e.preventDefault();
//               handleMenuItem(item?.key, context);
//             }}
//             onMouseEnter={(e) => {
//               const rect = e.currentTarget.getBoundingClientRect();
//               const openLeft = rect.right + 215 > window.innerWidth;
//               setSubmenuData({
//                 key: item.key,
//                 top: rect.top,
//                 left: openLeft ? rect.left - 215 - 22 : rect.right + 6,
//                 openLeft,
//               });
//             }}
//             onPointerDownCapture={(e) => e.stopPropagation()}
//             onContextMenuCapture={(e) => e.preventDefault()}
//             key={index}
//           >
//             {item?.title ?? ""} {item?.options?.length && <IoIosArrowForward />}
//           </button>
//           {item.options && submenuData?.key === item.key && (
//             <div
//               className="wcf-context-submenu"
//               style={{
//                 position: "fixed",
//                 top: submenuData.top,
//                 left: submenuData.left,
//                 display: open ? "flex" : "none",
//               }}
//             >
//               {item.options.map((opt, i) => (
//                 <button
//                   key={i}
//                   className="wcf-context-menu-btn"
//                   onClick={(e) => {
//                     e.preventDefault();
//                     handleMenuItem(opt.key, context);
//                   }}
//                 >
//                   {opt.title}
//                 </button>
//               ))}
//             </div>
//           )}
//         </>
//       ))}
//     </div>
