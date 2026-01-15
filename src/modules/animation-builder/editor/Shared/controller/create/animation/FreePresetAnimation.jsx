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
    contentStep?.data?.presetGroup || ""
  );
  const [selectedPreset, setSelectedPreset] = useState(
    contentStep?.data?.preset || ""
  );

  // collecting free presets and preset groups
  const allPresetGroup = useMemo(
    () => animationPresets?.getAllFreePresetGroups?.() || [],
    [animationPresets]
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
      <div className="flex flex-col gap-2 bg-background px-3 py-[15px] rounded-5">
        {/* title */}
        <div className="flex justify-between items-center">
          <span className="text-sm font-normal leading-5 tracking-normal">
            Title
          </span>
          <Input
            value={contentStep?.data?.title}
            onChange={(e) => updateContentData(e.target.value, "title")}
            placeholder="Title Animation"
            className="h-[34px] max-w-52 px-3 py-2 bg-background-input hover:bg-input-hover focus:bg-input-focus text-input-placeholder placeholder:text-input-placeholder hover:text-input-text-hover focus:text-input-text-focus text-sm font-medium leading-[18px] border-none outline-none ring-0 focus:ring-0 rounded-5 cursor-text"
          />
        </div>
        {/* preset group */}
        {contentStep?.data?.type && (
          <div className="flex justify-between items-center ">
            <span className="text-sm font-normal leading-5 tracking-normal">
              Preset
            </span>
            <Select
              value={selectedPresetGroup}
              onValueChange={handleUpdatePresetGroup}
            >
              <SelectTrigger className="h-[34px] max-w-52 px-3 py-2 bg-background-input hover:bg-input-hover focus:bg-input-focus text-input-placeholder placeholder:text-input-placeholder hover:text-input-text-hover focus:text-input-text-focus text-sm font-medium leading-[18px] border-none outline-none rounded-5 cursor-pointer">
                <SelectValue placeholder="Option" className="line-clamp-1" />
              </SelectTrigger>
              <SelectContent>
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
            <span className="text-sm font-normal leading-5 tracking-normal">
              Type
            </span>
            <Select value={selectedPreset} onValueChange={handleUpdatePreset}>
              <SelectTrigger className="h-[34px] max-w-52 px-3 py-2 bg-background-input hover:bg-input-hover focus:bg-input-focus text-input-placeholder placeholder:text-input-placeholder hover:text-input-text-hover focus:text-input-text-focus text-sm font-medium leading-[18px] border-none outline-none rounded-5 cursor-pointer">
                <SelectValue placeholder="Option" className="line-clamp-1" />
              </SelectTrigger>
              <SelectContent className="min-w-[90px]">
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
