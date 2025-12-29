import {
  handleAddContextMenu,
  handleContextMenuCopyClass,
  handleContextMenuCopyParentClass,
  handleCopyAnimContextMenu,
  handleDeleteAnimContextMenu,
  handleEditAnimContextMenu,
  handlePasteAnimContextMenu,
  handlePreviewAnimContextMenu,
  handleSaveAnimContextMenu,
} from "../../lib/contextMenu/contextMenu";

export const menuItems = [
  {
    contextMenuKey: "wcf-cmb-copy-class",
    title: "Copy Class",
    trigger: [],
    options: [],
    callback: handleContextMenuCopyClass,
  },
  {
    contextMenuKey: "wcf-cmb-copy-parent-class",
    title: "Copy Parent Class",
    trigger: [],
    options: [],
    callback: handleContextMenuCopyParentClass,
  },
  {
    contextMenuKey: "wcf-cmb-add-animation",
    title: "Add Animation",
    trigger: [],
    options: [
      {
        contextMenuKey: "wcf-cmb-add-anim-current",
        title: "Current Animation",
        trigger: [],
        options: [
          {
            contextMenuKey: "wcf-ab-ca-classic",
            title: "Classic Animation",
            trigger: [],
            options: [],
            callback: handleAddContextMenu,
          },
          {
            contextMenuKey: "wcf-ab-ca-preset",
            title: "Preset Animation",
            trigger: [],
            options: [],
            callback: handleAddContextMenu,
          },
          {
            contextMenuKey: "wcf-ab-ca-custom",
            title: "Custom Animation",
            trigger: [],
            options: [],
            callback: handleAddContextMenu,
          },
        ],
        callback: null,
      },
      {
        contextMenuKey: "wcf-cmb-add-anim-current",
        title: "Global Animation",
        trigger: [],
        options: [],
        callback: (e) => {
          console.log("global animation", e);
        },
      },
    ],
    callback: null,
  },
  {
    contextMenuKey: "wcf-cmb-edit-animation",
    title: "Edit Animation",
    trigger: [],
    options: [],
    callback: handleEditAnimContextMenu,
  },
  {
    contextMenuKey: "wcf-cmb-preview-animation",
    title: "Preview Animation",
    trigger: [],
    options: [],
    callback: handlePreviewAnimContextMenu,
  },
  {
    contextMenuKey: "wcf-cmb-copy-animation",
    title: "Copy Animation",
    trigger: [],
    options: [],
    callback: handleCopyAnimContextMenu,
  },
  {
    contextMenuKey: "wcf-cmb-paste-animation",
    title: "Paste Animation",
    trigger: [],
    options: [],
    callback: handlePasteAnimContextMenu,
  },
  {
    contextMenuKey: "wcf-cmb-delete-animation",
    title: "Delete Animation",
    trigger: [],
    options: [],
    callback: handleDeleteAnimContextMenu,
  },
  {
    contextMenuKey: "wcf-cmb-save-animation",
    title: "Save Animation",
    trigger: [],
    options: [],
    callback: handleSaveAnimContextMenu,
  },
];
