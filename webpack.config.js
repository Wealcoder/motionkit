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
    // The free WAAPI runtime. Source is generated from the MotionKit editor repo (see src/motionkit-waapi/), built here so the plugin ships both the readable source wp.org requires and its own bundle.
    "motionkit-waapi": "./src/motionkit-waapi/standalone.js",
  },
  output: {
    path: path.resolve(__dirname, "assets/build"),
    filename: "[name].js",
  },
};
