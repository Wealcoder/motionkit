import { ScrollArea } from "../ui/scroll-area";
import AllAnimationList from "./AllAnimationList";
import CustomAnimation from "./CustomAnimation";
import FreePresetAnimation from "./FreePresetAnimation";
import PresetAnimation from "./PresetAnimation";

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

const EditorBody = ({ contentStep }) => {
  return (
    <div className="flex flex-col divide-y">{RenderContent(contentStep)}</div>
  );
};

export default EditorBody;
