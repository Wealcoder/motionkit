import { useState } from "react";
import TopBar from "../components/TopBar";
import ShowPresets from "../components/ShowPresets";

const MainPage = () => {
  const [searchKey, setSearchKey] = useState("");
  const [presetCount, setPresetCount] = useState(
    WCF_ANIMATION_BUILDER_ADMIN.config.count
  );

  return (
    <div className="wcfabs2025-wrapper">
      <div className="wcfabs2025-style">
        <div className="container overflow-x-hidden bg-background rounded-[10px]">
          <div className="p-5 2xl:p-16">
            <div className="min-h-[80vh] px-8 py-6 border rounded-2xl">
              <div className="pb-6 border-b">
                <TopBar
                  searchKey={searchKey}
                  setSearchKey={setSearchKey}
                  presetCount={presetCount}
                />
              </div>
              <div className="mt-4">
                <ShowPresets
                  searchKey={searchKey}
                  setPresetCount={setPresetCount}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainPage;
