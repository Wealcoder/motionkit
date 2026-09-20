const defaultConfig = require("@wordpress/scripts/config/webpack.config");
const path = require("path");

module.exports = {
  ...defaultConfig,
  name: "motionkit-admin-ui",
  entry: {
    admin: ["./src/modules/admin/connect.js", "./src/css/admin.css"],
    "admin-tools": [
      "./src/modules/admin/tools.js",
      "./src/css/admin-tools.css",
    ],
    "admin-animations": [
      "./src/modules/admin/animations.js",
      "./src/css/admin-animations.css",
    ],
    "admin-bar": "./src/css/admin-bar.css",
    "admin-menu-icon": "./src/css/admin-menu-icon.css",
    "modules/editor-bridge": "./src/modules/editor-bridge.js",
    // The free WAAPI runtime — authored in this repo (src/motionkit-waapi/), which wp.org requires as readable source alongside the built bundle.
    "motionkit-waapi": "./src/motionkit-waapi/wrapper.js",
    // Same engine, no WordPress-data-reading or self-boot — copied by scripts/copy-to-editor.js into motionkit-editor's preview iframe, where animations arrive via the editor's own router instead.
    "motionkit-waapi-engine": "./src/motionkit-waapi/engine/index.js",
  },
  output: {
    path: path.resolve(__dirname, "assets/build"),
    filename: "[name].js",
  },
};
