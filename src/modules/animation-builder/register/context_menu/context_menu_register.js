import {
  handleContextMenuCopyClass,
  handleContextMenuCopyParentClass,
  handleEditAnimContextMenu,
} from "../../lib/contextMenu/contextMenuHelper";

export const menuItems = [
  {
    contextMenuKey: "wcf-cmb-copy-class",
    title: "Copy Class",
    trigger: [],
    options: [], // options must include title, contextMenuKey, callback
    callback: handleContextMenuCopyClass,
  },
  {
    contextMenuKey: "wcf-cmb-copy-parent-class",
    title: "Copy Parent Class",
    trigger: [],
    options: [], // options must include title, contextMenuKey, callback
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
            callback: (e) => {
              console.log("classic animation", e);
            },
          },
          {
            contextMenuKey: "wcf-ab-ca-preset",
            title: "Preset Animation",
            trigger: [],
            options: [],
            callback: (e) => {
              console.log("preset animation", e);
            },
          },
          {
            contextMenuKey: "wcf-ab-ca-custom",
            title: "Custom Animation",
            trigger: [],
            options: [],
            callback: (e) => {
              console.log("custom animation", e);
            },
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
    ], // options must include title, contextMenuKey, callback
    callback: null,
  },
  {
    contextMenuKey: "wcf-cmb-edit-animation",
    title: "Edit Animation",
    trigger: [],
    options: [], // options must include title, contextMenuKey, callback
    callback: handleEditAnimContextMenu,
  },
  {
    contextMenuKey: "wcf-cmb-preview-animation",
    title: "Preview Animation",
    trigger: [],
    options: [], // options must include title, contextMenuKey, callback
    callback: (e) => {
      console.log("preview animation", e);
    },
  },
  {
    contextMenuKey: "wcf-cmb-copy-animation",
    title: "Copy Animation",
    trigger: [],
    options: [], // options must include title, contextMenuKey, callback
    callback: (e) => {
      console.log("copy animation", e);
    },
  },
  {
    contextMenuKey: "wcf-cmb-paste-animation",
    title: "Paste Animation",
    trigger: [],
    options: [], // options must include title, contextMenuKey, callback
    callback: (e) => {
      console.log("paste animation", e);
    },
  },
  {
    contextMenuKey: "wcf-cmb-delete-animation",
    title: "Delete Animation",
    trigger: [],
    options: [], // options must include title, contextMenuKey, callback
    callback: (e) => {
      console.log("delete animation", e);
    },
  },
  {
    contextMenuKey: "wcf-cmb-save-animation",
    title: "Save Animation",
    trigger: [],
    options: [], // options must include title, contextMenuKey, callback
    callback: (e) => {
      console.log("save animation", e);
    },
  },
];
