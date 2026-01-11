import { useContentStep, useDeviceConfig } from "@/hooks/app.hooks";
import { Input } from "@/components/ui/input";
import EditorAnimation from "../../../../../components/editor/animation/EditorAnimation";
import EditorScrollTrigger from "../../../../../components/editor/scrollTrigger/EditorScrollTrigger";
import EditorTimeline from "../../../../../components/editor/timeline/EditorTimeline";

import AllResponsiveControl from "../../../../../components/common/AllResponsiveControl";
import SingleResponsiveControl from "../../../../../components/common/SingleResponsiveControl";

const CustomAnimation = () => {
  const { contentStep, updateContentData } = useContentStep();
  const { selectedDevice } = useDeviceConfig();

  return (
    <div>
      <div className="p-3 border-b border-border flex flex-col gap-3">
        <div className="flex justify-between items-center gap-2">
          <div className="w-[56px]">
            <h3 className="text-xs text-text-2">Title</h3>
          </div>
          <div className="flex-1">
            <Input
              value={contentStep?.data?.title}
              onChange={(e) => updateContentData(e.target.value, "title")}
              placeholder="Title Animation"
              className="h-[28px]"
            />
          </div>
        </div>
      </div>
      <div>
        <div className="border-b border-border-2">
          <EditorTimeline />
        </div>
        <div className="border-b border-border-2">
          <EditorAnimation />
        </div>
        <div className={"border-b border-border-2"}>
          <EditorScrollTrigger />
        </div>
        {selectedDevice === "desktop" ? (
          <AllResponsiveControl id={contentStep?.data?.id} />
        ) : (
          <SingleResponsiveControl id={contentStep?.data?.id} />
        )}
      </div>
    </div>
  );
};

export default CustomAnimation;
