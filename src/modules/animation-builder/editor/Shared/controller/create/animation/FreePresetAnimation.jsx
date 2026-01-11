import { useContentStep, useDeviceConfig } from "@/hooks/app.hooks";
import { Input } from "@/components/ui/input";
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
import { useState } from "react";
import RenderComponent from "../../../../../components/editor/RenderComponent";
import TextField from "@/components/animations/TextField";

const FreePresetAnimation = () => {
  const { contentStep, updateContentData } = useContentStep();
  const { selectedDevice } = useDeviceConfig();
  const animationPresets = AAEAnimBuilder?.freePresets || {};
  const [selectedPresetGroup, setSelectedPresetGroup] = useState(
    contentStep?.data?.presetGroup || ""
  );
  const [selectedPreset, setSelectedPreset] = useState(
    contentStep?.data?.preset || ""
  );

  return (
    <div className="border-2 border-solid border-red-500">
      <TextField
        label="title"
        tooltipContent=""
        value={contentStep?.data?.title}
        onUpdateValue={(value) => updateContentData(value)}
      />
    </div>
  );
};

export default FreePresetAnimation;

//  <div className="p-3 border-b border-border flex flex-col gap-3">
//    {/* title */}
//    <div className="flex justify-between items-center gap-2">
//      <div className="w-[56px]">
//        <h3 className="text-xs text-text-2">Title</h3>
//      </div>
//      <div className="flex-1">
//        <Input
//          value={contentStep?.data?.title ?? ""}
//          onChange={(e) => updateContentData(e.target.value, "title")}
//          placeholder="Title Animation"
//          className="h-[28px]"
//        />
//      </div>
//    </div>
//    {/* Preset group and preset selection */}
//    <div className="flex justify-between items-center gap-2">
//      <div className="w-[56px]">
//        <h3 className="text-xs text-text-2">Preset</h3>
//      </div>
//      <div className="flex-1">
//        <Select
//          value={selectedPresetGroup ?? ""}
//          onValueChange={(value) => {
//            updateContentData({
//              ...contentStep,
//              data: {
//                ...contentStep.data,
//                presetGroup: value,
//              },
//            });
//            setSelectedPresetGroup(value);
//          }}
//        >
//          <SelectTrigger className="min-w-[90px] capitalize">
//            <SelectValue placeholder="Option" className="line-clamp-1" />
//          </SelectTrigger>
//          <SelectContent className="min-w-[90px]">
//            <SelectGroup>
//              {animationPresets.getAllFreePresetGroups().map((preset, i) => (
//                <SelectItem
//                  key={`${preset}-${i}`}
//                  value={preset}
//                  className="capitalize"
//                >
//                  {preset}
//                </SelectItem>
//              ))}
//            </SelectGroup>
//          </SelectContent>
//        </Select>
//      </div>
//    </div>
//    {selectedPresetGroup ? (
//      <div className="flex justify-between items-center gap-2">
//        <div className="w-[56px]">
//          <h3 className="text-xs text-text-2">Type</h3>
//        </div>
//        <div className="flex-1">
//          <Select
//            value={selectedPreset}
//            onValueChange={(value) => {
//              updateContentData({
//                ...contentStep,
//                data: {
//                  ...contentStep.data,
//                  preset: value,
//                },
//              });
//              setSelectedPreset(value);
//            }}
//          >
//            <SelectTrigger className="min-w-[90px]">
//              <SelectValue placeholder="Option" className="line-clamp-1" />
//            </SelectTrigger>
//            <SelectContent className="min-w-[90px]">
//              <SelectGroup>
//                {animationPresets
//                  .getAllFreePresets(selectedPresetGroup)
//                  .map((preset) => (
//                    <SelectItem
//                      key={preset.presetKey}
//                      value={preset.presetKey}
//                    >
//                      {preset.name}
//                    </SelectItem>
//                  ))}
//              </SelectGroup>
//            </SelectContent>
//          </Select>
//        </div>
//      </div>
//    ) : (
//      ""
//    )}
//  </div>;
//  {
//    /* Rendering preset configuration */
//  }
//  <div>
//    <RenderComponent
//      selectedPresetGroup={selectedPresetGroup}
//      selectedPreset={selectedPreset}
//      contentStep={contentStep}
//      updateContentData={updateContentData}
//    />

//    {selectedDevice === "desktop" ? (
//      <AllResponsiveControl id={contentStep?.data?.id} />
//    ) : (
//      <SingleResponsiveControl id={contentStep?.data?.id} />
//    )}
//  </div>;
