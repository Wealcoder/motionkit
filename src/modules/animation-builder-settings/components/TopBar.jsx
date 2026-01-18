// import { RiCloseLine, RiCommandLine, RiSearchLine } from "react-icons/ri"; // use huge icon instead
import { Switch } from "@@/components/ui/switch";
import { Label } from "@@/components/ui/label";
import { Input } from "@@/components/ui/input";
import { usePresets } from "@@/hooks/app.hooks";

const TopBar = ({ searchKey, setSearchKey, presetCount }) => {
  const { allPresets, updateActiveFullPreset } = usePresets();

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 xl:gap-11 justify-between items-center">
      <div className="flex items-center gap-3">
        <div className="border rounded-full h-[52px] w-[52px] flex justify-center items-center shadow-common">
          {/* <RiCommandLine size={24} color="#FC6848" /> */}
        </div>
        <div className="flex flex-col gap-1">
          <div className="flex items-center">
            <h2 className="text-[18px] font-medium ">Presets Animations</h2>
          </div>
          <div className="flex items-center">
            <p className="text-sm text-label ">
              {presetCount?.total ?? 0} Total Presets
            </p>
            <div className="w-4 h-4 bg-white rounded-full" strokeWidth={4} />
            <p className="text-sm text-label ">
              {presetCount?.active ?? 0} Active Presets
            </p>
          </div>
        </div>
      </div>
      <div className="flex justify-between xl:justify-end items-center">
        <div className="flex items-center space-x-2">
          <Switch
            id="global-enable-all"
            checked={allPresets?.is_active}
            onCheckedChange={(value) => updateActiveFullPreset({ value })}
          />
          <Label htmlFor="global-enable-all">Enable All</Label>
        </div>
        <div className="ml-6 mr-2">
          <div className="relative">
            {/* <RiSearchLine className="absolute left-3 top-2.5 h-5 w-5 text-icon-secondary" /> */}
            <Input
              value={searchKey}
              onChange={(e) => setSearchKey(e.target.value)}
              placeholder="Search Presets"
              className="px-9"
            />
            {searchKey
              ? ""
              : // <RiCloseLine
                //   onClick={() => setSearchKey("")}
                //   className="absolute right-3 top-2.5 h-5 w-5 cursor-pointer text-icon-secondary"
                // />
                ""}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopBar;
