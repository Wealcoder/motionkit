const defaultConfig = require("@wordpress/scripts/config/webpack.config");
// Import the helper to find and generate the entry points in the src directory
const { getWebpackEntryPoints } = require("@wordpress/scripts/utils/config");
const glob = require("glob");
const path = require("path");
const webpack = require("webpack");

// Load .env so MOTIONKIT_* build flags are available via process.env (mirrors
// scripts/copy-to-editor.js; no dotenv dependency). Existing env wins.
(function loadDotEnv() {
  const fs = require("fs");
  const envFile = path.resolve(__dirname, ".env");
  if (!fs.existsSync(envFile)) return;
  for (const raw of fs.readFileSync(envFile, "utf8").split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith("#")) continue;
    const eq = line.indexOf("=");
    if (eq === -1) continue;
    const key = line.slice(0, eq).trim();
    let val = line.slice(eq + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    if (!(key in process.env)) process.env[key] = val;
  }
})();

// Verbose customEngine console logging (per-tween start + completion, step-apply
// tracing). Off unless MOTIONKIT_DEV_LOG=true so production bundles stay silent.
const DEV_LOG = process.env.MOTIONKIT_DEV_LOG === "true";

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

const sharedResolve = {
  extensions: [".js", ".jsx"],
  modules: [path.resolve(__dirname, "/src"), "node_modules"],
  alias: {
    "@": path.resolve(__dirname, "src/modules/animation-builder/"),
  },
};

const sharedModule = {
  ...defaultConfig.module,
  rules: [
    ...defaultConfig.module.rules,
    // Additional rules can be added here
  ],
};

const sharedExternals = {
  react: "React",
  "react-dom": "ReactDOM",
};

// Main bundle config — all entries except the editor variant. Builds with
// __MOTIONKIT_DEVTOOLS__ = false so customAnimation.js (and the customRegistry
// module it pulls in) gets its DevTools branches dead-code-eliminated.
const mainConfig = {
  ...defaultConfig,
  name: "main",
  externals: sharedExternals,
  entry: () => {
    return {
      ...getWebpackEntryPoints(),
      "modules/animation-builder/frontend":
        "./src/modules/animation-builder/frontend.js",
      "modules/animation-builder/editor-bridge":
        "./src/modules/animation-builder/editor-bridge.js",
      "modules/animation-builder/frontend/editor-reset":
        "./src/modules/animation-builder/frontend/editor-reset.js",
      admin: "./src/css/admin.css",
      "admin-tools": "./src/css/admin-tools.css",
      "admin-bar": "./src/css/admin-bar.css",
      ...getPresetEntries({
        folder:
          "./src/modules/animation-builder/frontend/animation-type/preset",
        outPrefix: "modules/animation-builder/frontend/presets/",
      }),
      // Slim production build — DevTools registry stripped
      "modules/animation-builder/frontend/customAnimation":
        "./src/modules/animation-builder/frontend/animation-type/customAnimation.js",
      // Preloader engine — standalone, shares nothing with customEngine or the page
      // transition runtime. Loaded in <head> so it can cover before first paint.
      //
      // One bundle per preset, each = engine core + that single preset. PHP enqueues only
      // the file matching the selected Preloader Type, so a visitor never downloads the
      // other fifteen. The core is duplicated across the outputs on disk, which is the
      // deliberate trade: disk is free, and the alternative (a shared chunk, or a runtime
      // dynamic import) costs a second request at the one moment on the page where
      // latency is most expensive.
      ...getPresetEntries({
        folder: "./src/modules/animation-builder/frontend/preloader",
        outPrefix: "modules/animation-builder/frontend/preloader/",
      }),
    };
  },
  output: {
    path: path.resolve(__dirname, "assets/build"),
    filename: "[name].js",
  },
  module: sharedModule,
  plugins: [
    ...defaultConfig.plugins,
    new webpack.DefinePlugin({
      __MOTIONKIT_DEVTOOLS__: JSON.stringify(false),
      __MOTIONKIT_DEV_LOG__: JSON.stringify(DEV_LOG),
    }),
  ],
  resolve: sharedResolve,
};

// Editor-preview build — same customAnimation source, but with
// __MOTIONKIT_DEVTOOLS__ = true so the registry module activates. Output goes
// next to the slim file as customAnimation.editor.js. The copy-to-editor
// script picks up this file and the inject-bridge serves it from the
// motionkit-editor static dir during proxy-snapshot iframe loads.
const editorConfig = {
  ...defaultConfig,
  name: "editor",
  dependencies: ["main"],
  externals: sharedExternals,
  entry: {
    "modules/animation-builder/frontend/customAnimation.editor":
      "./src/modules/animation-builder/frontend/animation-type/customAnimation.js",
  },
  output: {
    path: path.resolve(__dirname, "assets/build"),
    filename: "[name].js",
  },
  module: sharedModule,
  plugins: [
    new webpack.DefinePlugin({
      __MOTIONKIT_DEVTOOLS__: JSON.stringify(true),
      __MOTIONKIT_DEV_LOG__: JSON.stringify(DEV_LOG),
    }),
    {
      apply(compiler) {
        compiler.hooks.afterEmit.tapAsync(
          "CopyToEditorPlugin",
          (_compilation, cb) => {
            try {
              require("./scripts/copy-to-editor").copyToEditor({ quiet: true });
            } catch (e) {
              console.warn("[copy-to-editor] skipped:", e.message);
            }
            cb();
          },
        );
      },
    },
  ],
  resolve: sharedResolve,
};

module.exports = [mainConfig, editorConfig];
