import {
  Accordion2,
  AccordionContent2,
  AccordionItem2,
  AccordionTrigger2,
} from "@/components/ui/accordion2";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TProperties } from "@/config/timelineProperties";
import { useContentStep } from "@/hooks/app.hooks";
import { IconCopy } from "@/lib/icons";
import { useEffect, useState } from "react";
import PropertiesControl from "../PropertiesControl";
import { generateUniqueId } from "../../../../../utils/generateUniqueId";
import ToolTipWrapper from "@/components/common/ToolTipWrapper";
import DeleteConfirmDialog from "@/components/common/DeleteConfirmDialog";

const TimelineItems = ({ item }) => {
  const properties = TProperties;
  const { updateTimelineData, duplicateTimeline, deleteTimeline } =
    useContentStep();

  const [accValue, setAccValue] = useState([""]);
  const [tTitle, setTTitle] = useState(item?.title || "");
  const [tProperties, setTProperties] = useState(item?.properties || []);

  useEffect(() => {
    updateTimelineData({
      title: tTitle,
      properties: tProperties,
      id: item.id,
    });
  }, [tTitle, tProperties]);

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

    setTProperties((prev) => [...prev, sampleData]);
  };

  const updateProperties = (data, propertyItem) => {
    if (propertyItem?.id) {
      const result = tProperties.map((el) => {
        if (el.id === propertyItem?.id) {
          el.value = data;
          return el;
        } else {
          return el;
        }
      });
      setTProperties(result);
    }
  };

  const deleteProperties = (id) => {
    if (id) {
      const result = tProperties.filter((el) => el.id !== id);
      setTProperties(result);
    }
  };

  return (
    <Accordion2
      type="multiple"
      collapsible
      value={accValue}
      onValueChange={setAccValue}
      className="w-full bg-background-hover border border-border-2 rounded"
    >
      <AccordionItem2 value="timeline" className="group">
        <div className="flex justify-between items-center [&>h3]:w-full">
          <AccordionTrigger2>
            <p>{tTitle}</p>
          </AccordionTrigger2>
          <div className="w-[54px]">
            <div className="hidden group-hover:flex justify-center items-center">
              <div
                className="py-2.5 ps-2 pe-[7px] flex justify-center items-center cursor-pointer"
                onClick={() => duplicateTimeline(item.id)}
              >
                <IconCopy />
              </div>

              <DeleteConfirmDialog
                className="py-2.5 pe-2 ps-[7px] flex justify-center items-center cursor-pointer"
                deleteFn={deleteTimeline}
                id={item.id}
              />
            </div>
          </div>
        </div>
        <AccordionContent2 className="px-2 py-2.5 border-t border-border-2">
          <div>
            <div className="pb-2.5 border-b border-border-2 grid grid-cols-2 justify-between items-center gap-2">
              <div className="flex items-center gap-1">
                <h3 className="text-xs text-text">Title</h3>
                <ToolTipWrapper text={"Timeline title"} />
              </div>
              <div>
                <Input
                  value={tTitle}
                  onChange={(e) => setTTitle(e.target.value)}
                  placeholder="Timeline _1"
                  className="h-[28px]"
                />
              </div>
            </div>
            <div className="py-2.5 border-b border-border-2">
              <PropertiesControl
                properties={properties}
                selectedProperties={tProperties}
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

export default TimelineItems;
