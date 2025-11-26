import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useEffect, useReducer, useState } from "react";
import { Input } from "@/components/ui/input";
import { SProperties } from "@/config/timelineProperties";
import PropertiesControl from "../PropertiesControl";
import { useContentStep } from "@/hooks/app.hooks";
import { generateUniqueId } from "../../../../../utils/generateUniqueId";
import { validateStringFormat } from "@/lib/utils";
import ToolTipWrapper from "@/components/common/ToolTipWrapper";

const EditorScrollTrigger = () => {
  const properties = SProperties;
  const { contentStep, updateContentData } = useContentStep();
  const { timelines, ScrollTrigger } = contentStep?.data;
  const [enableTrigger, setEnableTrigger] = useState(
    ScrollTrigger.enable || false
  );

  const initialState = {
    timeline: ScrollTrigger.timeline || "",
    trigger: ScrollTrigger.trigger || "",
    endTrigger: ScrollTrigger.endTrigger || "",
    start: ScrollTrigger.start || "",
    customStart: ScrollTrigger.customStart || "",
    end: ScrollTrigger.end || "",
    customEnd: ScrollTrigger.customEnd || "",
    scrub: ScrollTrigger.scrub || "",
    customScrub: ScrollTrigger.customScrub || "",
    pin: ScrollTrigger.pin || "",
    customPin: ScrollTrigger.customPin || "",
    pinSpacing: ScrollTrigger.pinSpacing || "",
    customPinSpacing: ScrollTrigger.customPinSpacing || "",
    properties: ScrollTrigger.properties || [],
  };

  function reducer(state, action) {
    switch (action.type) {
      case "setConfig":
        return { ...state, [action.payload.key]: action.payload.value };
      case "setProperties":
        return { ...state, properties: action.payload };
      default:
        throw new Error("Unknown action type");
    }
  }
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    updateContentData({ ...state, enable: enableTrigger }, "ScrollTrigger");
  }, [state, enableTrigger]);

  const updatePState = (value) => {
    dispatch({
      type: "setProperties",
      payload: value,
    });
  };

  const addProperties = (data) => {
    const sampleData = {
      id: generateUniqueId(),
      name: data.name,
      value: data.value || data?.default,
      type: data.type,
      unit: data?.unit || "",
      info: data?.info,
      isError: false,
      errorMessage: "",
    };

    const findCustom = state.properties?.find((el) => el.type === "custom");

    if (findCustom) {
      const withoutCustom = state.properties?.filter(
        (el) => el.type !== "custom"
      );

      updatePState([...withoutCustom, sampleData, findCustom]);
    } else {
      updatePState([...state.properties, sampleData]);
    }
  };

  const updateProperties = (data, item, custom = false) => {
    if (item?.id) {
      const result = state.properties.map((el) => {
        if (el.id === item?.id) {
          el.value = data;

          if (data) {
            el.isError = false;
            el.errorMessage = "";
          } else {
            el.isError = true;
            el.errorMessage = "*required";
          }

          if (custom) {
            const validation = validateStringFormat(data);
            if (validation) {
              el.isError = false;
              el.errorMessage = "";
            } else {
              el.isError = true;
              el.errorMessage = "*required";
            }
          }

          return el;
        } else {
          return el;
        }
      });

      updatePState(result);
    }
  };

  const deleteProperties = (id) => {
    if (id) {
      const result = state.properties.filter((el) => el.id !== id);
      updatePState(result);
    }
  };

  return (
    <Accordion type="single" collapsible className="w-full p-3">
      <AccordionItem value="item-1">
        <AccordionTrigger>ScrollTrigger</AccordionTrigger>
        <AccordionContent className="pb-0 mt-5 flex flex-col gap-4">
          <div className="flex items-center justify-between gap-2 mt-2">
            <Label htmlFor="ScrollTrigger-enable">Enable ScrollTrigger</Label>
            <Switch
              id="ScrollTrigger-enable"
              checked={enableTrigger}
              onCheckedChange={setEnableTrigger}
            />
          </div>
          {enableTrigger ? (
            <>
              <div>
                {/* select timeline */}
                <div className="grid grid-cols-3 justify-between items-center gap-2 pb-2.5 border-b border-border-2">
                  <div className="flex items-center gap-1">
                    <h3 className="text-xs text-text">Timeline</h3>
                    <ToolTipWrapper text={"Select timeline"} />
                  </div>
                  <div className="col-span-2">
                    <Select
                      value={state.timeline}
                      onValueChange={(value) =>
                        dispatch({
                          type: "setConfig",
                          payload: { key: "timeline", value },
                        })
                      }
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
                {/* trigger and endTrigger */}
                <div className="flex flex-col gap-2.5 py-2.5 border-b border-border-2">
                  <div className="grid grid-cols-3 justify-between items-center gap-2">
                    <div className="flex items-center gap-1">
                      <h3 className="text-xs text-text">Trigger</h3>
                      <ToolTipWrapper text="Start Trigger defines the element that triggers the animation, e.g., '.trigger' triggers the animation when the trigger element enters the viewport" />
                    </div>
                    <div className="col-span-2">
                      <Input
                        placeholder=".start_trigger"
                        value={state.trigger}
                        onChange={(e) =>
                          dispatch({
                            type: "setConfig",
                            payload: { key: "trigger", value: e.target.value },
                          })
                        }
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 justify-between items-center gap-2">
                    <div className="flex items-center gap-1">
                      <h3 className="text-xs text-text">End Trigger</h3>
                      <ToolTipWrapper text="End Trigger defines the element where the animation ends, e.g., '.end' ends the animation when the end element reaches the viewport" />
                    </div>
                    <div className="col-span-2">
                      <Input
                        placeholder=".end_trigger"
                        value={state.endTrigger}
                        onChange={(e) =>
                          dispatch({
                            type: "setConfig",
                            payload: {
                              key: "endTrigger",
                              value: e.target.value,
                            },
                          })
                        }
                      />
                    </div>
                  </div>
                </div>
                {/* start and end */}
                <div className="py-2.5 border-b border-border-2 flex flex-col gap-2.5">
                  <div className="grid grid-cols-3 justify-between items-start gap-2">
                    <div className="flex items-center gap-1 h-[26px]">
                      <h3 className="text-xs text-text">Start</h3>
                      <ToolTipWrapper
                        text={
                          "Start defines when the animation starts relative to the container, e.g., 'top center' triggers the animation when the top of the element hits the center of the viewport"
                        }
                      />
                    </div>
                    <div className="col-span-2 flex flex-col gap-2">
                      <Select
                        value={state.start}
                        onValueChange={(value) =>
                          dispatch({
                            type: "setConfig",
                            payload: { key: "start", value },
                          })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select Start" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="top top">Top Top</SelectItem>
                          <SelectItem value="top center">Top Center</SelectItem>
                          <SelectItem value="top bottom">Top Bottom</SelectItem>
                          <SelectItem value="bottom top">Bottom Top</SelectItem>
                          <SelectItem value="bottom center">
                            Bottom Center
                          </SelectItem>
                          <SelectItem value="bottom bottom">
                            Bottom Bottom
                          </SelectItem>
                          <SelectItem value="custom">Custom</SelectItem>
                        </SelectContent>
                      </Select>
                      {state.start === "custom" ? (
                        <Input
                          placeholder="top top+=100"
                          value={state.customStart}
                          onChange={(e) =>
                            dispatch({
                              type: "setConfig",
                              payload: {
                                key: "customStart",
                                value: e.target.value,
                              },
                            })
                          }
                        />
                      ) : (
                        ""
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-3 justify-between items-start gap-2">
                    <div className="flex items-center gap-1 h-[26px]">
                      <h3 className="text-xs text-text">End</h3>
                      <ToolTipWrapper
                        text={
                          "End defines when the animation ends relative to the container, e.g., 'bottom top' triggers the animation to end when the bottom of the element reaches the top of the viewport"
                        }
                      />
                    </div>
                    <div className="col-span-2 flex flex-col gap-2">
                      <Select
                        value={state.end}
                        onValueChange={(value) =>
                          dispatch({
                            type: "setConfig",
                            payload: { key: "end", value },
                          })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select End" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="top top">Top Top</SelectItem>
                          <SelectItem value="top center">Top Center</SelectItem>
                          <SelectItem value="top bottom">Top Bottom</SelectItem>
                          <SelectItem value="bottom top">Bottom Top</SelectItem>
                          <SelectItem value="bottom center">
                            Bottom Center
                          </SelectItem>
                          <SelectItem value="bottom bottom">
                            Bottom Bottom
                          </SelectItem>
                          <SelectItem value="custom">Custom</SelectItem>
                        </SelectContent>
                      </Select>
                      {state.end === "custom" ? (
                        <Input
                          placeholder="top top+=100"
                          value={state.customEnd}
                          onChange={(e) =>
                            dispatch({
                              type: "setConfig",
                              payload: {
                                key: "customEnd",
                                value: e.target.value,
                              },
                            })
                          }
                        />
                      ) : (
                        ""
                      )}
                    </div>
                  </div>
                </div>

                {/* scrub, pin and pin spacing  */}
                <div className="py-2.5 border-b border-border-2 flex flex-col gap-2.5">
                  <div className="grid grid-cols-3 justify-between items-start gap-2">
                    <div className="flex items-center gap-1 h-[26px]">
                      <h3 className="text-xs text-text">Scrub</h3>
                      <ToolTipWrapper
                        text={
                          "Scrub syncs animation with scroll position, e.g., 1 makes the animation progress smoothly as you scroll, true links animation directly to scrolling, false disables it"
                        }
                      />
                    </div>
                    <div className="col-span-2 flex flex-col gap-2">
                      <Select
                        value={state.scrub}
                        onValueChange={(value) =>
                          dispatch({
                            type: "setConfig",
                            payload: { key: "scrub", value },
                          })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select Scrub" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectItem value="true">True</SelectItem>
                            <SelectItem value="false">False</SelectItem>
                            <SelectItem value="custom">Custom</SelectItem>
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                      {state.scrub === "custom" ? (
                        <Input
                          placeholder="1"
                          value={state.customScrub}
                          type="number"
                          className="no-spinner"
                          onChange={(e) =>
                            dispatch({
                              type: "setConfig",
                              payload: {
                                key: "customScrub",
                                value: e.target.value,
                              },
                            })
                          }
                        />
                      ) : (
                        ""
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-3 justify-between items-start gap-2">
                    <div className="flex items-center gap-1 h-[26px]">
                      <h3 className="text-xs text-text">Pin</h3>
                      <ToolTipWrapper
                        text={
                          "Pin keeps an element fixed during scroll, e.g., true pins the element in place while scrolling"
                        }
                      />
                    </div>
                    <div className="col-span-2 flex flex-col gap-2">
                      <Select
                        value={state.pin}
                        onValueChange={(value) =>
                          dispatch({
                            type: "setConfig",
                            payload: { key: "pin", value },
                          })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select Pin" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectItem value="true">True</SelectItem>
                            <SelectItem value="false">False</SelectItem>
                            <SelectItem value="custom">Custom</SelectItem>
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                      {state.pin === "custom" ? (
                        <Input
                          placeholder="1"
                          value={state.customPin}
                          type="number"
                          className="no-spinner"
                          onChange={(e) =>
                            dispatch({
                              type: "setConfig",
                              payload: {
                                key: "customPin",
                                value: e.target.value,
                              },
                            })
                          }
                        />
                      ) : (
                        ""
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-3 justify-between items-start gap-2">
                    <div className="flex items-center gap-1 h-[26px]">
                      <h3 className="text-xs text-text">Pin Spacing</h3>
                      <ToolTipWrapper
                        text={
                          "Pin spacing controls spacing when pinning, e.g., false removes extra space after pinning element"
                        }
                      />
                    </div>
                    <div className="col-span-2 flex flex-col gap-2">
                      <Select
                        value={state.pinSpacing}
                        onValueChange={(value) =>
                          dispatch({
                            type: "setConfig",
                            payload: { key: "pinSpacing", value },
                          })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Pin Spacing" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectItem value="true">True</SelectItem>
                            <SelectItem value="false">False</SelectItem>
                            <SelectItem value="custom">Custom</SelectItem>
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                      {state.pinSpacing === "custom" ? (
                        <Input
                          placeholder="1"
                          value={state.customPinSpacing}
                          type="number"
                          className="no-spinner"
                          onChange={(e) =>
                            dispatch({
                              type: "setConfig",
                              payload: {
                                key: "customPinSpacing",
                                value: e.target.value,
                              },
                            })
                          }
                        />
                      ) : (
                        ""
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* properties  */}
              <div className="pb-2.5">
                <PropertiesControl
                  properties={properties}
                  selectedProperties={state.properties}
                  addProperties={addProperties}
                  updateProperties={updateProperties}
                  deleteProperties={deleteProperties}
                />
              </div>
            </>
          ) : (
            ""
          )}
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};

export default EditorScrollTrigger;
