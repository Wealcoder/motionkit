import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

import { IconPlus } from "@/lib/icons";
import AnimationItems from "./AnimationItems";
import { useContentStep } from "@/hooks/app.hooks";
import { generateUniqueId } from "../../../../../utils/generateUniqueId";
import { ABCustomAnimationData } from "@/config/animationPresetData";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

const EditorAnimation = () => {
  const { contentStep, updateContentData } = useContentStep();
  const { timelines, animations } = contentStep?.data;

  const createAnimation = () => {
    const defaultProperties = [
      // {
      //   id: generateUniqueId(),
      //   name: "delay",
      //   value: 0.15,
      //   type: "number",
      //   info: "Delays the timeline start by the specified value (in seconds)",
      //   isError: false,
      //   errorMessage: "",
      // },
      // {
      //   id: generateUniqueId(),
      //   name: "duration",
      //   value: 1,
      //   type: "number",
      //   info: "Specifies how long the animation should run, receiving a numeric value in seconds for the duration",
      //   isError: false,
      //   errorMessage: "",
      // },
      {
        id: generateUniqueId(),
        name: "ease",
        value: "power2.out",
        type: "ease",
        info: `Defines the timing function for the animation, receiving a string value like "bounce", "power4.out", etc., to control the animation's speed curve`,
        isError: false,
        errorMessage: "",
      },
      {
        id: generateUniqueId(),
        name: "overwrite",
        value: "true",
        type: "boolean",
        info: `Determines whether this animation should cancel and replace existing tweens of the same targets and properties. Useful for preventing animation conflicts.`,
        isError: false,
        errorMessage: "",
      },
    ];
    updateContentData(
      [
        ...animations,
        {
          ...ABCustomAnimationData,
          title: `Animation_${animations.length + 1}`,
          id: generateUniqueId(),
          properties: defaultProperties,
        },
      ],
      "animations"
    );
  };

  const sensors = useSensors(useSensor(PointerSensor));

  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = animations.findIndex((item) => item.id === active.id);
      const newIndex = animations.findIndex((item) => item.id === over.id);

      const result = arrayMove(animations, oldIndex, newIndex);
      updateContentData(result, "animations");
    }
  };


  return (
    <Accordion
      defaultValue="animation"
      type="single"
      collapsible
      className="w-full p-3"
    >
      <AccordionItem value="animation">
        <AccordionTrigger>Animation</AccordionTrigger>
        <AccordionContent className="mt-5">
          <div className="flex flex-col gap-1.5">
            <div className="flex flex-col gap-2.5">
              <div className="flex justify-between items-center gap-1.5">
                <h3 className="text-text-2">Add animation</h3>
                <div
                  className="cursor-pointer"
                  onClick={() => createAnimation()}
                >
                  <IconPlus size="12" />
                </div>
              </div>
              {animations?.length ? (
                <div className="flex flex-col gap-1.5">
                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                  >
                    <SortableContext
                      items={animations}
                      strategy={verticalListSortingStrategy}
                    >
                      {animations.map((item) => (
                        <AnimationItems
                          key={item.id}
                          item={item}
                          timelines={timelines}
                        />
                      ))}
                    </SortableContext>
                  </DndContext>
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

export default EditorAnimation;
