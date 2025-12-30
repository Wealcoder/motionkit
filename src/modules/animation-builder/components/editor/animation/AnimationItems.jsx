import {
  Accordion2,
  AccordionContent2,
  AccordionItem2,
  AccordionTrigger2,
} from "@/components/ui/accordion2";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AProperties } from "@/config/timelineProperties";
import { IconCopy, IconDrag } from "../../../../../assets/icons";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEffect, useState } from "react";
import PropertiesControl from "../PropertiesControl";
import { generateUniqueId } from "../../../../../utils/generateUniqueId";
import { useContentStep } from "@/hooks/app.hooks";
import ToolTipWrapper from "@/components/common/ToolTipWrapper";
import DeleteConfirmDialog from "@/components/common/DeleteConfirmDialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

const AnimationItems = ({ item, timelines }) => {
  const properties = AProperties;
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };
  const { updateAnimationData, duplicateAnimationData, deleteAnimationData } =
    useContentStep();

  const [accValue, setAccValue] = useState([""]);

  const [animationData, setAnimationData] = useState({
    title: item?.title || "",
    timeline: item?.timeline || "",
    absoluteTime: item?.absoluteTime || "",
    method: item?.method || "",
    properties: item?.properties || [],
    applyAnimation: item?.applyAnimation || {},
    splitText: item?.splitText || {
      enable: false,
      type: "chars",
      autoSplit: "false",
      mask: "false",
      propIndex: "false",
    },
  });

  useEffect(() => {
    updateAnimationData({
      ...animationData,
      id: item.id,
    });
  }, [animationData]);

  const updateField = (field, value) => {
    setAnimationData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const addProperties = (data) => {
    const sampleData = {
      id: generateUniqueId(),
      name: data.name,
      value: data.value || data?.default,
      type: data.type,
      info: data?.info,
      isError: false,
      errorMessage: "",
    };

    if (data?.unit) sampleData.unit = data.unit;

    const findCustom = animationData?.properties?.find(
      (el) => el.type === "custom"
    );

    if (findCustom) {
      const withoutCustom = animationData?.properties?.filter(
        (el) => el.type !== "custom"
      );

      updateField("properties", [...withoutCustom, sampleData, findCustom]);
    } else {
      updateField("properties", [...animationData.properties, sampleData]);
    }
  };

  const updateProperties = (data, propertyItem) => {
    if (propertyItem?.id) {
      const result = animationData?.properties.map((el) => {
        if (el.id === propertyItem?.id) {
          el.value = data;
          return el;
        } else {
          return el;
        }
      });

      updateField("properties", result);
    }
  };

  const deleteProperties = (id) => {
    if (id) {
      const result = animationData?.properties.filter((el) => el.id !== id);
      updateField("properties", result);
    }
  };

  return (
    <Accordion2
      type="multiple"
      value={accValue}
      onValueChange={setAccValue}
      className="w-full bg-background-hover border border-border-2 rounded"
      ref={setNodeRef}
      style={style}
      {...attributes}
    >
      <AccordionItem2 value="animation" className="group">
        <div className="flex justify-between items-center [&>h3]:w-full">
          <AccordionTrigger2>
            <p>{animationData?.title}</p>
          </AccordionTrigger2>
          <div className="w-[80px] pe-2">
            <div className="hidden group-hover:flex justify-center items-center gap-1">
              <div
                className="py-2.5 px-1 flex justify-center items-center cursor-grab"
                {...listeners}
              >
                <IconDrag />
              </div>
              <div
                className="py-2.5 px-1 flex justify-center items-center cursor-pointer"
                onClick={() => duplicateAnimationData(item.id)}
              >
                <IconCopy />
              </div>

              <DeleteConfirmDialog
                className="py-2.5 px-1 flex justify-center items-center cursor-pointer"
                deleteFn={deleteAnimationData}
                id={item.id}
              />
            </div>
          </div>
        </div>
        <AccordionContent2 className="px-2 py-2.5 border-t border-border-2">
          <div>
            <div className="pb-2.5 border-b border-border-2 flex flex-col gap-2.5">
              <div className="grid grid-cols-3 justify-between items-center gap-2">
                <div className="flex items-center gap-1">
                  <h3 className="text-xs text-text">Title</h3>
                  <ToolTipWrapper text={"Animation title"} />
                </div>
                <div className="col-span-2">
                  <Input
                    value={animationData?.title}
                    onChange={(e) => updateField("title", e.target.value)}
                    placeholder="Animation _1"
                    className="h-[28px]"
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 justify-between items-center gap-2">
                <div className="flex items-center gap-1">
                  <h3 className="text-xs text-text">Timeline</h3>
                  <ToolTipWrapper text={"Select timeline"} />
                </div>
                <div className="col-span-2">
                  <Select
                    value={animationData.timeline}
                    onValueChange={(value) => updateField("timeline", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a timeline" />
                    </SelectTrigger>
                    {timelines?.length ? (
                      <SelectContent>
                        <SelectGroup>
                          {timelines.map((item) => (
                            <SelectItem key={item.id} value={item.id}>
                              {item.title}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    ) : (
                      ""
                    )}
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-3 justify-between items-center gap-2">
                <div className="flex items-center gap-1">
                  <h3 className="text-xs text-text">Absolute Time</h3>
                  <ToolTipWrapper text={"Add Absolute Time"} />
                </div>
                <div className="col-span-2">
                  <Input
                    value={animationData?.absoluteTime}
                    onChange={(e) =>
                      updateField("absoluteTime", e.target.value)
                    }
                    placeholder="3"
                    className="h-[28px]"
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 justify-between items-center gap-2">
                <div className="flex items-center gap-1">
                  <h3 className="text-xs text-text">Method</h3>
                  <ToolTipWrapper text={"Select method"} />
                </div>
                <div className="col-span-2">
                  <Select
                    value={animationData.method}
                    onValueChange={(value) => updateField("method", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectItem value="to">To</SelectItem>
                        <SelectItem value="from">From</SelectItem>
                        {/* <SelectItem value="fromTo">From To</SelectItem> */}
                        <SelectItem value="set">Set</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* apply animation  */}
            <div className="py-2.5 border-b border-border-2 flex flex-col gap-2.5">
              <div>
                <h3 className="text-text-2 mb-1.5">Applies on</h3>
                <div className="flex flex-col gap-2.5">
                  <div className="flex justify-between items-center gap-2">
                    <div className="w-[70px]">
                      <h3 className="text-xs text-text-2">Class</h3>
                    </div>
                    <div className="flex-1">
                      <Input
                        placeholder="<h1 - heading>"
                        value={animationData.applyAnimation.className}
                        onChange={(e) =>
                          updateField("applyAnimation", {
                            ...animationData.applyAnimation,
                            className: e.target.value,
                          })
                        }
                        className="h-[28px] bg-background-hover text-text-2"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* enable splitText  */}
            <div className="py-2.5 border-b border-border-2 flex flex-col gap-2.5">
              <div className="flex items-center justify-between gap-2 mt-2">
                <Label htmlFor={`enable-splitText-${item.id}`}>
                  Enable SplitText
                </Label>
                <Switch
                  id={`enable-splitText-${item.id}`}
                  checked={animationData?.splitText?.enable}
                  onCheckedChange={(value) =>
                    updateField("splitText", {
                      ...animationData?.splitText,
                      enable: value,
                    })
                  }
                />
              </div>

              {animationData?.splitText?.enable ? (
                <div className="flex flex-col gap-2.5">
                  <div className="grid grid-cols-3 justify-between items-center gap-2">
                    <div className="flex items-center gap-1">
                      <h3 className="text-xs text-text">Type</h3>
                      <ToolTipWrapper text={"Select type"} />
                    </div>
                    <div className="col-span-2">
                      <Select
                        value={animationData?.splitText?.type}
                        onValueChange={(value) =>
                          updateField("splitText", {
                            ...animationData?.splitText,
                            type: value,
                          })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectItem value="chars">Characters</SelectItem>
                            <SelectItem value="words">Words</SelectItem>
                            <SelectItem value="lines">Lines</SelectItem>
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 justify-between items-center gap-2">
                    <div className="flex items-center gap-1">
                      <h3 className="text-xs text-text">AutoSplit</h3>
                      <ToolTipWrapper text={"Select autoSplit"} />
                    </div>
                    <div className="col-span-2">
                      <Select
                        value={animationData?.splitText?.autoSplit}
                        onValueChange={(value) =>
                          updateField("splitText", {
                            ...animationData?.splitText,
                            autoSplit: value,
                          })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select autoSplit" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectItem value="true">True</SelectItem>
                            <SelectItem value="false">False</SelectItem>
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 justify-between items-center gap-2">
                    <div className="flex items-center gap-1">
                      <h3 className="text-xs text-text">Mask</h3>
                      <ToolTipWrapper text={"Select Mask"} />
                    </div>
                    <div className="col-span-2">
                      <Select
                        value={animationData?.splitText?.mask}
                        onValueChange={(value) =>
                          updateField("splitText", {
                            ...animationData?.splitText,
                            mask: value,
                          })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select mask" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectItem value="chars">Characters</SelectItem>
                            <SelectItem value="words">Words</SelectItem>
                            <SelectItem value="lines">Lines</SelectItem>
                            <SelectItem value="true">True</SelectItem>
                            <SelectItem value="false">False</SelectItem>
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {animationData?.splitText?.type === "chars" ? (
                    <>
                      <div className="grid grid-cols-3 justify-between items-center gap-2">
                        <div className="flex items-center gap-1">
                          <h3 className="text-xs text-text">CharsClass</h3>
                          <ToolTipWrapper text={"Add character class"} />
                        </div>
                        <div className="col-span-2">
                          <Input
                            value={animationData?.splitText?.charsClass}
                            onChange={(e) =>
                              updateField("splitText", {
                                ...animationData?.splitText,
                                charsClass: e.target.value,
                              })
                            }
                            placeholder="char"
                            className="h-[28px]"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-3 justify-between items-center gap-2">
                        <div className="flex items-center gap-1">
                          <h3 className="text-xs text-text">SmartWrap</h3>
                          <ToolTipWrapper text={"Select smartWrap"} />
                        </div>
                        <div className="col-span-2">
                          <Select
                            value={animationData?.splitText?.smartWrap}
                            onValueChange={(value) =>
                              updateField("splitText", {
                                ...animationData?.splitText,
                                smartWrap: value,
                              })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select smartWrap" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectGroup>
                                <SelectItem value="true">True</SelectItem>
                                <SelectItem value="false">False</SelectItem>
                              </SelectGroup>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </>
                  ) : (
                    ""
                  )}
                  {animationData?.splitText?.type === "words" ? (
                    <div className="grid grid-cols-3 justify-between items-center gap-2">
                      <div className="flex items-center gap-1">
                        <h3 className="text-xs text-text">WordsClass</h3>
                        <ToolTipWrapper text={"Add word class"} />
                      </div>
                      <div className="col-span-2">
                        <Input
                          value={animationData?.splitText?.wordsClass}
                          onChange={(e) =>
                            updateField("splitText", {
                              ...animationData?.splitText,
                              wordsClass: e.target.value,
                            })
                          }
                          placeholder="word"
                          className="h-[28px]"
                        />
                      </div>
                    </div>
                  ) : (
                    ""
                  )}
                  {animationData?.splitText?.type === "lines" ? (
                    <div className="grid grid-cols-3 justify-between items-center gap-2">
                      <div className="flex items-center gap-1">
                        <h3 className="text-xs text-text">LinesClass</h3>
                        <ToolTipWrapper text={"Add line class"} />
                      </div>
                      <div className="col-span-2">
                        <Input
                          value={animationData?.splitText?.linesClass}
                          onChange={(e) =>
                            updateField("splitText", {
                              ...animationData?.splitText,
                              linesClass: e.target.value,
                            })
                          }
                          placeholder="line"
                          className="h-[28px]"
                        />
                      </div>
                    </div>
                  ) : (
                    ""
                  )}

                  <div className="grid grid-cols-3 justify-between items-center gap-2">
                    <div className="flex items-center gap-1">
                      <h3 className="text-xs text-text">Ignore</h3>
                      <ToolTipWrapper text={"Add ignore"} />
                    </div>
                    <div className="col-span-2">
                      <Input
                        value={animationData?.splitText?.ignore}
                        onChange={(e) =>
                          updateField("splitText", {
                            ...animationData?.splitText,
                            ignore: e.target.value,
                          })
                        }
                        placeholder="sup"
                        className="h-[28px]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 justify-between items-center gap-2">
                    <div className="flex items-center gap-1">
                      <h3 className="text-xs text-text">PropIndex</h3>
                      <ToolTipWrapper text={"Select propIndex"} />
                    </div>
                    <div className="col-span-2">
                      <Select
                        value={animationData?.splitText?.propIndex}
                        onValueChange={(value) =>
                          updateField("splitText", {
                            ...animationData?.splitText,
                            propIndex: value,
                          })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select propIndex" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectItem value="true">True</SelectItem>
                            <SelectItem value="false">False</SelectItem>
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              ) : (
                ""
              )}
            </div>

            {/* properties  */}
            <div className="py-2.5 border-b border-border-2">
              <PropertiesControl
                properties={properties}
                selectedProperties={animationData?.properties}
                addProperties={addProperties}
                updateProperties={updateProperties}
                deleteProperties={deleteProperties}
              />
            </div>
            <div className="flex justify-end items-center gap-1.5 pt-2.5">
              <Button variant="secondary" onClick={() => setAccValue([""])}>
                Close
              </Button>
            </div>
          </div>
        </AccordionContent2>
      </AccordionItem2>
    </Accordion2>
  );
};

export default AnimationItems;
