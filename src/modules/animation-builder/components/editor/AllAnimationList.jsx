import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  useAnimationControl,
  useContentStep,
  useDeviceConfig,
} from "@/hooks/app.hooks";
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
import AnimationCard from "./AnimationCard";

const AllAnimationList = () => {
  const { allAnimation, updateAnimation, setAllAnimation } =
    useAnimationControl();
  const { selectedDevice } = useDeviceConfig();
  const { setContentStep } = useContentStep();

  const handleMessage = (event) => {
    if (event.data?.type === "PANEL_ANIMATION_LIST_BUILDER") {
      if (event.data?.payload?.id) {
        const findAnimation = allAnimation?.[selectedDevice]?.find(
          (el) => el.id === event.data?.payload?.id
        );
        if (findAnimation?.id) {
          setContentStep({ step: 2, data: findAnimation });
        }
      }
    }
  };

  window.addEventListener("message", handleMessage);

  if (!allAnimation[selectedDevice]) return;

  const sensors = useSensors(useSensor(PointerSensor));

  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = allAnimation[selectedDevice]?.findIndex(
        (item) => item.id === active.id
      );
      const newIndex = allAnimation[selectedDevice]?.findIndex(
        (item) => item.id === over.id
      );

      const result = arrayMove(
        allAnimation[selectedDevice],
        oldIndex,
        newIndex
      );

      const updated = {};

      for (const device in allAnimation) {
        updated[device] = result;
      }

      setAllAnimation(updated);
      updateAnimation(updated);
    }
  };

  return (
    <Accordion
      type="single"
      defaultValue="allAnimation"
      collapsible
      className="w-full p-3"
    >
      <AccordionItem value="allAnimation">
        <AccordionTrigger>Animations</AccordionTrigger>
        <AccordionContent className="mt-3">
          <div className="flex flex-col gap-[7px]">
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={allAnimation[selectedDevice]}
                strategy={verticalListSortingStrategy}
              >
                {allAnimation[selectedDevice]?.map((animation) => (
                  <AnimationCard key={animation.id} animation={animation} />
                ))}
              </SortableContext>
            </DndContext>
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};

export default AllAnimationList;
