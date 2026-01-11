import { ScrollArea } from "@/components/ui/scroll-area";
import AllAnimationList from "./browse/AllAnimationList";
import FreePresetAnimation from "./create/animation/FreePresetAnimation";
import PresetAnimation from "./create/animation/PresetAnimation";
import CustomAnimation from "./create/animation/CustomAnimation";

const RenderContent = (item) => {
  switch (item.step) {
    case 1:
      return (
        <ScrollArea className="h-[78vh] min-w-[280px] max-w-[450px]">
          <AllAnimationList />
        </ScrollArea>
      );
    case 2:
      return (
        <ScrollArea className="h-[83vh] min-w-[280px] max-w-[450px]">
          {item?.data?.type == "free_animation" ? (
            <FreePresetAnimation />
          ) : item?.data?.type === "preset" ? (
            <PresetAnimation />
          ) : (
            <CustomAnimation />
          )}
        </ScrollArea>
      );
    default:
      return;
  }
};

const ControllerBody = ({ contentStep }) => {
  return (
    <div className="flex flex-col divide-y text-white">
      {RenderContent(contentStep)}
    </div>
  );
};

export default ControllerBody;
