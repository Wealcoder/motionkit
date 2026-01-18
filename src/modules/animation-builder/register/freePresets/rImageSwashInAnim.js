import {
  config,
  defaultData,
} from "@/animation_presets/free_pesets/image/swashIn";

AAEAnimBuilder.freePresets.register({
  groupName: "image",
  presetKey: "wcf-image-swash-in-free-animation",
  name: "Swash In",
  configuration: { defaultData, config },
});
