import {
  config,
  defaultData,
} from "@/animation_presets/free_pesets/general/spaceInLeft";

AAEAnimBuilder.freePresets.register({
  groupName: "general",
  presetKey: "wcf-ab-gen-sil-fa",
  name: "Space In Left",
  configuration: { defaultData, config },
});
