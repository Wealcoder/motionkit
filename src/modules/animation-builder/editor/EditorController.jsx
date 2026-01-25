import Logo from "@/components/common/Logo";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";

import { useAnimationControl, useContentStep } from "@/hooks/app.hooks";
import { generateUniqueId } from "../../../utils/generateUniqueId";
import ControllerBody from "./Shared/controller/ControllerBody";
import ControllerFooter from "./Shared/controller/ControllerFooter";
import ControllerHeader from "./Shared/controller/ControllerHeader";

export default function EditorController() {
  const { contentStep, setContentStep } = useContentStep();
  const { allAnimation, createAnimation, updateAnimation, setAllAnimation } =
    useAnimationControl();

  // creating new animation
  const handleAddAnimation = (preset) => {
    if (!preset?.config || !preset?.config?.type) return;
    const { config } = preset || {};
    const uniqueId = generateUniqueId();
    config.id = uniqueId;
    setContentStep({
      step: 2,
      data: config,
    });
    createAnimation(config);
  };

  return (
    <Sidebar
      side="right"
      collapsible="icon"
      className="outline-l-4 outline-red-dev"
    >
      <SidebarHeader>
        {/* for creating new animation */}
        {contentStep?.step === 1 && (
          <ControllerHeader
            handleAddAnimation={handleAddAnimation}
            contentStep={contentStep}
            setContentStep={setContentStep}
          />
        )}
      </SidebarHeader>
      <SidebarContent>
        {/* display properties of new animation or lisitng all animations */}
        {contentStep?.step === 2 && (
          <div className="flex-1">
            <ControllerBody contentStep={contentStep} />
          </div>
        )}
      </SidebarContent>
      <SidebarFooter>
        <ControllerFooter
          contentStep={contentStep}
          allAnimation={allAnimation}
          setContentStep={setContentStep}
          updateAnimation={updateAnimation}
          setAllAnimation={setAllAnimation}
        />
      </SidebarFooter>
      {/* toggle sidebar */}
      <SidebarRail className="h-[48px] w-[48px] p-3 bg-button hover:bg-button-hover border-none outline-none focus-within:ring-0 rounded-full">
        <Logo />
      </SidebarRail>
    </Sidebar>
  );
}
