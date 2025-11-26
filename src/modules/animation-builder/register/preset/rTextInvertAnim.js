const { default: TextInvertPrest } = require("@/components/editor/preset/TextInvertPrest");

AAEAnimBuilder.presets.register({
  groupName: "text",
  presetKey: "wcf-text-invert-animation",
  name: "Invert",
  component: TextInvertPrest,
});
