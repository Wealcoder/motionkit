import { useEffect, useState } from "react";
import TopBar from "../components/TopBar";
import ShowPresets from "../components/ShowPresets";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { mainNavData } from "./menus";
import FreeAnimationTopbar from "../components/FreeAnimationTopbar";
import ShowFreeAnimations from "../components/ShowFreeAnimations";

const MainPage = () => {
  const [searchKey, setSearchKey] = useState("");
  const [activeTab, setActiveTab] = useState("preset_animaitons");
  const [presetCount, setPresetCount] = useState({});

  useEffect(() => {
    if (activeTab === "free_animations") {
      setPresetCount(
        WCF_ANIMATION_BUILDER_ADMIN.config.free_animation_count ?? {
          total: 0,
          active: 0,
        }
      );
    } else {
      setPresetCount(
        WCF_ANIMATION_BUILDER_ADMIN.config.preset_count ?? {
          total: 0,
          active: 0,
        }
      );
    }
  }, [activeTab, WCF_ANIMATION_BUILDER_ADMIN]);

  return (
    <div className="wcfabs2025-wrapper  ">
      <div className="wcfabs2025-style ">
        <div className="container overflow-x-hidden bg-background rounded-[10px] ">
          <Tabs
            defaultValue="preset_animaitons"
            onValueChange={(value) => setActiveTab(value)}
          >
            <div className="px-5 2xl:px-8 py-3 2xl:py-5 border-b border-b-[#f2f5f8]">
              {/* tabs manues */}
              <TabsList className="border-none gap-1">
                {mainNavData?.map((tab, idx) => {
                  const value = tab?.name?.replace(/\s+/g, "_").toLowerCase();
                  return (
                    <TabsTrigger
                      value={value}
                      key={idx}
                      {...(activeTab === value && { "data-active": true })}
                      className="group/item !inline-flex h-9 w-max items-center justify-center bg-background ps-2.5 pe-3 py-2 font-medium transition-colors hover:bg-background-secondary hover:text-text-secondary-hover focus:bg-background-secondary focus:text-text-secondary-hover focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-background-secondary data-[active]:text-text-primary-hover data-[state=open]:bg-background-secondary cursor-pointer rounded-lg gap-2 text-base text-text-secondary"
                    >
                      <span
                        className={`${
                          activeTab == value ? "text-text-hover" : ""
                        }`}
                      >
                        {tab?.icon}
                      </span>
                      {tab?.name}
                    </TabsTrigger>
                  );
                })}
              </TabsList>
            </div>
            {/* free animation tab content */}
            <TabsContent value={"free_animations"}>
              <div className="min-h-[80vh] px-8 py-6 ">
                <div className="pb-6">
                  <FreeAnimationTopbar
                    searchKey={searchKey}
                    setSearchKey={setSearchKey}
                    presetCount={presetCount}
                  />
                </div>
                <div className="mt-4">
                  <ShowFreeAnimations
                    searchKey={searchKey}
                    setPresetCount={setPresetCount}
                  />
                </div>
              </div>
            </TabsContent>
            {/* Preset animation tab content */}
            <TabsContent value={"preset_animaitons"}>
              <div className="min-h-[80vh] px-8 py-6 rounded-2xl">
                <div className="pb-6">
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
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default MainPage;
