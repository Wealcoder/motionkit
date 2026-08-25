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
    "admin-bar": "./src/css/admin-bar.css",
    "admin-menu-icon": "./src/css/admin-menu-icon.css",
  },
  output: {
    path: path.resolve(__dirname, "assets/build"),
    filename: "[name].js",
  },
};
