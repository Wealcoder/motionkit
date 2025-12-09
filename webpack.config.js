const defaultConfig = require("@wordpress/scripts/config/webpack.config");
// Import the helper to find and generate the entry points in the src directory
const { getWebpackEntryPoints } = require("@wordpress/scripts/utils/config");
const glob = require("glob");
const path = require("path");

// helper to build entries from a folder
function getPresetEntries({ folder, outPrefix }) {
  const files = glob.sync(`${folder}/*.js`);
  return files.reduce((entries, file) => {
    const name = outPrefix + path.basename(file, ".js");
    // Use absolute path so Webpack never confuses it
    entries[name] = path.resolve(file);
    return entries;
  }, {});
}

module.exports = {
  ...defaultConfig,
  externals: {
    react: "React",
    "react-dom": "ReactDOM",
  },
  entry: () => {
    return {
      ...getWebpackEntryPoints(),

      // manual entries

      "modules/animation-builder/main":
        "./src/modules/animation-builder/main.js",
      "modules/animation-builder-settings/main":
        "./src/modules/animation-builder-settings/main.js",

      "modules/animation-builder/preview":
        "./src/modules/animation-builder/preview.js",
      "modules/animation-builder/frontend":
        "./src/modules/animation-builder/frontend.js",
      "modules/animation-builder/animbuilder-copy":
        "./src/modules/animation-builder/animbuilder-copy.css",
      "modules/animation-builder/freeAnim": "./src/css/freeAnim.css",


      // auto-generated free preset entries (frontend)
      ...getPresetEntries({
        folder:
          "./src/modules/animation-builder/frontend/animation-type/freePreset",
        outPrefix: "modules/animation-builder/frontend/freePresets/",
      }),

      // auto-generated preset entries (register)
      ...getPresetEntries({
        folder: "./src/modules/animation-builder/register/preset",
        outPrefix: "modules/animation-builder/register/preset/",
      }),

      // auto-generated free preset entries (register)
      ...getPresetEntries({
        folder: "./src/modules/animation-builder/register/freePresets",
        outPrefix: "modules/animation-builder/register/freePresets/",
      }),
    };
  },
  output: {
    path: path.resolve(__dirname, "assets/build"), // Custom output directory
    filename: "[name].js", // Output bundle filename
    // publicPath: "/assets/", // Public URL of the output directory when referenced in a browser
  },
  module: {
    ...defaultConfig.module,
    rules: [
      ...defaultConfig.module.rules,
      // Additional rules can be added here
    ],
  },
  plugins: [
    ...defaultConfig.plugins,
    // Additional plugins can be added here
  ],
  resolve: {
    extensions: [".js", ".jsx"],
    modules: [path.resolve(__dirname, "/src"), "node_modules"],
    alias: {
      "@": path.resolve(__dirname, "src/modules/animation-builder/"),
      "@@": path.resolve(__dirname, "src/modules/animation-builder-settings/"),
    },
  },
};
