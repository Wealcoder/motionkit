import {
  useAnimationControl,
  useContentStep,
  useDeviceConfig,
} from "@/hooks/app.hooks";
import { IconCopy, IconDrag } from "@/lib/icons";
import DeleteConfirmDialog from "../common/DeleteConfirmDialog";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

const AnimationCard = ({ animation }) => {
  const { duplicateAnimation, deleteAnimation } = useAnimationControl();
  const { setContentStep } = useContentStep();
  const { selectedDevice } = useDeviceConfig();

  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: animation.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      className="group flex justify-between items-center gap-2 p-2 pe-0 border border-border-2 rounded hover:bg-background-hover"
    >
      <div
        className="flex flex-1 flex-col gap-1.5 cursor-pointer"
        onClick={() => setContentStep({ step: 2, data: animation })}
      >
        <h3 className="text-xs text-text-2 group-hover:text-text font-medium">
          {animation.title}
        </h3>
        <p className="text-[11.5px] text-text-3 group-hover:text-text-2 leading-[1.13] line-clamp-1">
          Applied on element
        </p>
      </div>
      <div className="w-[80px] pe-2">
        <div className="hidden group-hover:flex justify-center items-center gap-1">
          {selectedDevice === "desktop" ? (
            <>
              <div
                className="py-2.5 px-1 flex justify-center items-center cursor-grab"
                {...listeners}
              >
                <IconDrag />
              </div>
              <div
                className="py-2.5 px-1 flex justify-center items-center cursor-pointer"
                onClick={() => duplicateAnimation(animation.id)}
              >
                <IconCopy />
              </div>
              <DeleteConfirmDialog
                className="py-2.5 px-1 flex justify-center items-center cursor-pointer"
                deleteFn={deleteAnimation}
                id={animation.id}
                text="Are you sure you want to delete this? This action will remove the animation across all devices."
              />
            </>
          ) : (
            ""
          )}
        </div>
      </div>
    </div>
  );
};

export default AnimationCard;
