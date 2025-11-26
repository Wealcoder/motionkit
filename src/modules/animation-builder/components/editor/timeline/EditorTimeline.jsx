import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

import { IconPlus } from "@/lib/icons";
import TimelineItems from "./TimelineItems";
import { useContentStep } from "@/hooks/app.hooks";
import { generateUniqueId } from "../../../../../utils/generateUniqueId";

const EditorTimeline = () => {
  const { contentStep, updateContentData } = useContentStep();
  const { timelines } = contentStep?.data;

  return (
    <Accordion
      defaultValue="timeline"
      type="single"
      collapsible
      className="w-full p-3"
    >
      <AccordionItem value="timeline">
        <AccordionTrigger>Timeline</AccordionTrigger>
        <AccordionContent className="pb-0 mt-5">
          <div className="flex flex-col gap-1.5">
            <div className="flex flex-col gap-2.5">
              <div className="flex justify-between items-center gap-1.5">
                <h3 className="text-text-2">Add timeline</h3>
                <div
                  className="cursor-pointer"
                  onClick={() =>
                    updateContentData(
                      [
                        ...timelines,
                        {
                          title: `Timeline_${timelines.length + 1}`,
                          id: generateUniqueId(),
                          properties: [],
                        },
                      ],
                      "timelines"
                    )
                  }
                >
                  <IconPlus size="12" />
                </div>
              </div>
              {timelines?.length ? (
                <div className="flex flex-col gap-1.5">
                  {timelines.map((item) => (
                    <TimelineItems key={item.id} item={item} />
                  ))}
                </div>
              ) : (
                <div className="p-2 rounded bg-background-disable">
                  <p className="text-center text-text-3">Empty Section</p>
                </div>
              )}
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};

export default EditorTimeline;
