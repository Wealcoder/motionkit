import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@@/components/ui/tabs";
import { Button } from "@@/components/ui/button";
import React, { useEffect, useState } from "react";
import { Switch } from "@@/components/ui/switch";
import { Label } from "@@/components/ui/label";
import { deviceMediaMatch } from "@@/lib/utils";
import { toast } from "sonner";
import { ScrollArea, ScrollBar } from "@@/components/ui/scroll-area";
import PresetCard from "./PresetCard";
import { usePresets } from "@@/hooks/app.hooks";

const ShowPresets = ({ searchKey, setPresetCount }) => {
  const { allPresets, updateActivePreset, updateActiveGroupPreset } =
    usePresets();

  const [tabValue, setTabValue] = useState("all");
  const [categoryPresets, setCategoryPresets] = useState({});
  const [noResult, setNoResult] = useState(false);
  const [presetTabList, setPresetTabList] = useState([]);

  // Build tab list from all presets
  useEffect(() => {
    if (allPresets) {
      const result = Object.entries(allPresets.elements).map(
        ([key, value]) => ({
          title: value.title,
          value: key,
        })
      );
      setPresetTabList(result);
    }
  }, [allPresets]);

  // Filter presets based on search and tab
  useEffect(() => {
    if (!allPresets?.elements) return;
    let filtered = allPresets.elements;
    if (searchKey) {
      filtered = findSearchResult();
      setNoResult(!Object.keys(filtered).length);
    } else {
      setNoResult(false);
    }
    setCategoryPresets(filtered);
  }, [allPresets, searchKey]);

  // Reset tab on search
  useEffect(() => {
    if (searchKey) setTabValue("all");
  }, [searchKey]);

  // Search helper
  const findSearchResult = () => {
    return Object.fromEntries(
      Object.entries(allPresets.elements)
        .map(([key, value]) => {
          const filteredElements = Object.fromEntries(
            Object.entries(value.elements || {}).filter(([, v]) =>
              v.label.toLowerCase().includes(searchKey.toLowerCase())
            )
          );
          return [key, { ...value, elements: filteredElements }];
        })
        .filter(([, value]) => Object.keys(value.elements).length > 0)
    );
  };

  // Save settings
  const savePresets = async () => {
    await fetch(WCF_ANIMATION_BUILDER_ADMIN.ajaxurl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "application/json",
      },

      body: new URLSearchParams({
        action: "aae_save_anim_builder_settings",
        setting_name: "aae_anim_builder_settings",
        form_fields: JSON.stringify(allPresets),
        nonce: WCF_ANIMATION_BUILDER_ADMIN.nonce,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        setPresetCount?.(data.count);
        toast.success("Presets saved successfully!", { position: "top-right" });
      });
  };

  // Render
  return (
    <Tabs defaultValue="all" value={tabValue} onValueChange={setTabValue}>
      <div className="flex justify-between items-center mb-4">
        <ScrollArea className="max-w-[900px] rounded-lg bg-background-secondary">
          <TabsList className="h-11">
            <TabsTrigger value="all" className="px-4">
              All
            </TabsTrigger>
            {presetTabList.map((tab) => (
              <TabsTrigger key={tab.value} value={tab.value}>
                {tab.title}
              </TabsTrigger>
            ))}
          </TabsList>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
        <Button onClick={savePresets}>Save Preset Settings</Button>
      </div>

      {/* All Presets Tab */}
      <TabsContent
        value="all"
        className="bg-background-secondary p-3 rounded-lg"
      >
        {noResult ? (
          <div className="bg-background flex justify-center items-center p-5 rounded">
            <h3 className="text-base font-medium">No Result Found</h3>
          </div>
        ) : (
          Object.keys(categoryPresets).map((cat) => (
            <div key={cat} className="mt-3 first:mt-0">
              <div className="bg-background flex justify-between items-center p-5 rounded">
                <h3 className="text-base font-medium">
                  {categoryPresets[cat].title}
                </h3>
                <div className="flex items-center space-x-2">
                  <Switch
                    id={cat}
                    checked={categoryPresets[cat].is_active}
                    onCheckedChange={(value) =>
                      updateActiveGroupPreset({ value, slug: cat })
                    }
                  />
                  <Label htmlFor={cat}>Enable All</Label>
                </div>
              </div>
              <div className="grid grid-cols-2 xl:grid-cols-3 gap-1 mt-1">
                {Object.keys(categoryPresets[cat].elements).map((preset, i) => (
                  <PresetCard
                    key={`preset-${i}`}
                    preset={categoryPresets[cat].elements[preset]}
                    slug={preset}
                    updateActiveItem={updateActivePreset}
                    className="rounded p-5"
                  />
                ))}
                {/* Empty cards for grid alignment */}
                {Array.from({
                  length:
                    deviceMediaMatch() -
                    (Object.keys(categoryPresets[cat].elements).length %
                      deviceMediaMatch() || deviceMediaMatch()),
                }).map((_, idx) => (
                  <PresetCard key={`empty-${idx}`} className="rounded" />
                ))}
              </div>
            </div>
          ))
        )}
      </TabsContent>

      {/* Individual Category Tabs */}
      {Object.keys(categoryPresets).map((cat) => (
        <TabsContent
          key={cat}
          value={cat}
          className="bg-background-secondary p-3 rounded-lg"
        >
          <div>
            <div className="bg-background flex justify-between items-center p-5 rounded">
              <h3 className="text-base font-medium">
                {categoryPresets[cat].title}
              </h3>
              <div className="flex items-center space-x-2">
                <Switch
                  id={cat}
                  checked={categoryPresets[cat].is_active}
                  onCheckedChange={(value) =>
                    updateActiveGroupPreset({ value, slug: cat })
                  }
                />
                <Label htmlFor={cat}>Enable All</Label>
              </div>
            </div>
            <div className="grid grid-cols-2 xl:grid-cols-3 gap-1 mt-1">
              {Object.keys(categoryPresets[cat].elements).map((preset, i) => (
                <PresetCard
                  key={`preset-${i}`}
                  preset={categoryPresets[cat].elements[preset]}
                  slug={preset}
                  updateActiveItem={updateActivePreset}
                  className="rounded p-5"
                />
              ))}
              {Array.from({
                length:
                  deviceMediaMatch() -
                  (Object.keys(categoryPresets[cat].elements).length %
                    deviceMediaMatch() || deviceMediaMatch()),
              }).map((_, idx) => (
                <PresetCard key={`empty-${idx}`} className="rounded" />
              ))}
            </div>
          </div>
        </TabsContent>
      ))}
    </Tabs>
  );
};

export default ShowPresets;
