const { default: TextRotatePrest } = require("@/components/editor/preset/TextRotatePrest");

AAEAnimBuilder.presets.register({
  groupName: "text",
  presetKey: "wcf-text-rotate-animation",
  name: "Rotate",
  component: TextRotatePrest,
});
