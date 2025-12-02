import ToolTipWrapper from "@/components/common/ToolTipWrapper";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { IconDelete } from "@/lib/icons";
import { useEffect, useState } from "react";

const HorizontalScrollPreset = ({ contentStep, updateContentData }) => {
  const { data } = contentStep;

  const [fullConfig, setFullConfig] = useState({
    containerClass: data?.containerClass || "",
    containerHeight: data?.containerHeight || "",
    itemClass: data?.itemClass || "",
    itemWidthType: data?.itemWidthType || "default",
    itemWidth: data?.itemWidth || "",
    itemsWidth: data?.itemsWidth || [],
  });

  useEffect(() => {
    const result = { ...contentStep, data: { ...data, ...fullConfig } };
    updateContentData(result);
  }, [fullConfig]);

  const addItemField = () => {
    setFullConfig((prev) => ({
      ...prev,
      itemsWidth: [...prev.itemsWidth, ""],
    }));
  };

  const removeItemField = (index) => {
    setFullConfig((prev) => ({
      ...prev,
      itemsWidth: prev.itemsWidth.filter((_, i) => i !== index),
    }));
  };

  return (
    <div className="flex flex-col gap-2 border-b border-border-2 w-full p-3">
      <div className="grid grid-cols-2 gap-2 justify-between items-center">
        <div className="flex items-center gap-1">
          <h3 className="text-xs text-text-2 capitalize">Container Class</h3>
          <ToolTipWrapper text={"Add the wrapper container class name"} />
        </div>
        <div className="flex items-center gap-1.5">
          <div className="flex-1">
            <Input
              value={fullConfig?.containerClass}
              onChange={(e) => {
                setFullConfig((prev) => ({
                  ...prev,
                  containerClass: e.target.value,
                }));
              }}
              placeholder="add value"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 justify-between items-center">
        <div className="flex items-center gap-1">
          <h3 className="text-xs text-text-2 capitalize">Scrolling Height</h3>
          <ToolTipWrapper text={"scroll height"} />
        </div>
        <div className="flex items-center gap-1.5">
          <div className="flex-1">
            <Input
              value={fullConfig?.containerHeight}
              onChange={(e) => {
                setFullConfig((prev) => ({
                  ...prev,
                  containerHeight: e.target.value,
                }));
              }}
              placeholder="add value"
            />
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2 justify-between items-center">
        <div className="flex items-center gap-1">
          <h3 className="text-xs text-text-2 capitalize">Item Class</h3>
          <ToolTipWrapper text={"Add the class name of the video element"} />
        </div>
        <div className="flex items-center gap-1.5">
          <div className="flex-1">
            <Input
              value={fullConfig?.itemClass}
              onChange={(e) => {
                setFullConfig((prev) => ({
                  ...prev,
                  itemClass: e.target.value,
                }));
              }}
              placeholder="add value"
            />
          </div>
        </div>
      </div>
      {/* tab  */}
      <Tabs
        value={fullConfig.itemWidthType}
        onValueChange={(value) =>
          setFullConfig((prev) => ({
            ...prev,
            itemWidthType: value,
          }))
        }
      >
        <TabsList className="w-full">
          <TabsTrigger value={"default"} className="w-full">
            Default
          </TabsTrigger>
          <TabsTrigger value={"custom"} className="w-full">
            Custom
          </TabsTrigger>
        </TabsList>

        <TabsContent value={"default"}>
          <div className="grid grid-cols-2 gap-2 justify-between items-center">
            <div className="flex items-center gap-1">
              <h3 className="text-xs text-text-2 capitalize">Item Width</h3>
              <ToolTipWrapper text={"Add the width"} />
            </div>
            <div className="flex items-center gap-1.5">
              <div className="flex-1">
                <Input
                  value={fullConfig?.itemWidth}
                  onChange={(e) => {
                    setFullConfig((prev) => ({
                      ...prev,
                      itemWidth: e.target.value,
                    }));
                  }}
                  placeholder="add value"
                />
              </div>
            </div>
          </div>
        </TabsContent>
        <TabsContent value="custom">
          <div className="flex flex-col gap-2">
            <Button onClick={addItemField} variant="play" size="play">
              Add Item Width
            </Button>

            {fullConfig.itemsWidth.length > 0 ? (
              fullConfig.itemsWidth.map((w, idx) => (
                <div
                  key={idx}
                  className="grid grid-cols-2 gap-2 justify-between items-center"
                >
                  <div className="flex items-center gap-1">
                    <h3 className="text-xs text-text-2 capitalize">
                      Item {idx + 1} Width
                    </h3>
                    <ToolTipWrapper text="Add the width for this item" />
                  </div>

                  <div className="flex items-center gap-1.5">
                    <Input
                      className="flex-1"
                      value={w}
                      onChange={(e) => {
                        const val = e.target.value;
                        setFullConfig((prev) => {
                          const newArr = [...prev.itemsWidth];
                          newArr[idx] = val;
                          return { ...prev, itemsWidth: newArr };
                        });
                      }}
                      placeholder="add value"
                    />

                    <div
                      onClick={() => removeItemField(idx)}
                      className="flex justify-center items-center cursor-pointer"
                    >
                      <IconDelete />
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p>Click “Add Item Width” to create custom-width fields.</p>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default HorizontalScrollPreset;
