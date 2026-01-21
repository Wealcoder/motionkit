import { useContentStep, useDeviceConfig } from "@/hooks/app.hooks";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import AllResponsiveControl from "../../../../../components/common/AllResponsiveControl";
import SingleResponsiveControl from "../../../../../components/common/SingleResponsiveControl";
import { useMemo, useState } from "react";
import RenderComponent from "../../animation_handler/RenderComponent";
import { Input } from "@/components/ui/input";
import AnimationPropsHanlder from "../../animation_handler/AnimationPropsHanlder";

const FreePresetAnimation = () => {
  const { contentStep, updateContentData } = useContentStep();
  const { selectedDevice } = useDeviceConfig();

  // getting information about register presets and preset groups
  const animationPresets = useMemo(() => AAEAnimBuilder?.freePresets || {}, []);

  // storing preset and preset group information
  const [selectedPresetGroup, setSelectedPresetGroup] = useState(
    contentStep?.data?.presetGroup || "",
  );
  const [selectedPreset, setSelectedPreset] = useState(
    contentStep?.data?.preset || "",
  );

  // collecting free presets and preset groups
  const allPresetGroup = useMemo(
    () => animationPresets?.getAllFreePresetGroups?.() || [],
    [animationPresets],
  );
  const presetList = useMemo(() => {
    if (!selectedPresetGroup) return [];
    return (
      animationPresets?.getAllFreePresets(selectedPresetGroup?.toLowerCase()) ||
      []
    );
  }, [animationPresets, selectedPresetGroup]);

  // updating preset information
  const handleUpdatePresetGroup = (value) => {
    if (!value || !contentStep?.data?.type) return;
    const currentPresetGroup = value?.toLowerCase();
    updateContentData({
      ...contentStep,
      data: {
        ...contentStep.data,
        presetGroup: currentPresetGroup,
        preset: "",
      },
    });
    setSelectedPresetGroup(value);
    setSelectedPreset(""); // reset on preset group changes
  };

  const handleUpdatePreset = (value) => {
    if (!value || !contentStep?.data?.type) return;
    updateContentData({
      ...contentStep,
      data: {
        ...contentStep.data,
        preset: value,
      },
    });
    setSelectedPreset(value);
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-2 bg-background  rounded-5">
        {/* title */}
        <div className="flex justify-between items-center">
          <span className="wcf-ab-title">Title</span>
          <Input
            value={contentStep?.data?.title}
            onChange={(e) => updateContentData(e.target.value, "title")}
            placeholder="Title Animation"
            className="wcf-ab-dynamic-field-input"
          />
        </div>
        {/* preset group */}
        {contentStep?.data?.type && (
          <div className="flex justify-between items-center ">
            <span className="wcf-ab-title">Preset</span>
            <Select
              value={selectedPresetGroup}
              onValueChange={handleUpdatePresetGroup}
            >
              <SelectTrigger className="wcf-ab-select-trigger">
                <SelectValue placeholder="Option" className="line-clamp-1" />
              </SelectTrigger>
              <SelectContent className="wcf-ab-select-content">
                <SelectGroup>
                  {allPresetGroup?.map((preset, index) => (
                    <SelectItem
                      key={`${preset}-${index}`}
                      value={preset}
                      className="capitalize "
                    >
                      {preset}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        )}
        {/* preset type */}
        {selectedPresetGroup && (
          <div className="flex justify-between items-center ">
            <span className="wcf-ab-title">Type</span>
            <Select value={selectedPreset} onValueChange={handleUpdatePreset}>
              <SelectTrigger className="wcf-ab-select-trigger">
                <SelectValue placeholder="Option" className="line-clamp-1" />
              </SelectTrigger>
              <SelectContent className="wcf-ab-select-content">
                <SelectGroup>
                  {presetList?.map((preset) => (
                    <SelectItem key={preset.presetKey} value={preset.presetKey}>
                      {preset.name}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        )}
      </div>
      {/* rendering preset properties */}
      {selectedPresetGroup && selectedPreset && (
        <div>
          <AnimationPropsHanlder
            selectedPresetGroup={contentStep?.data?.presetGroup ?? ""}
            selectedPreset={contentStep?.data?.preset ?? ""}
            contentStep={contentStep}
            updateContentData={updateContentData}
          />
        </div>
      )}
    </div>
  );
};

export default FreePresetAnimation;
