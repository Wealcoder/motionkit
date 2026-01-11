import { useAnimationControl, useContentStep } from "@/hooks/app.hooks";
import { generateUniqueId } from "../../../utils/generateUniqueId";
import ControllerBody from "./Shared/controller/ControllerBody";
import ControllerFooter from "./Shared/controller/ControllerFooter";
import ControllerHeader from "./Shared/controller/ControllerHeader";

const Controller = ({ isLoading }) => {
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
    <div className="p-[15px] bg-background-sidebar h-full flex flex-col justify-between relative rounded-l-[10px] ">
      {/* for creating new animation */}
      {contentStep?.step === 1 && (
        <ControllerHeader
          isLoading={isLoading}
          handleAddAnimation={handleAddAnimation}
          contentStep={contentStep}
          setContentStep={setContentStep}
        />
      )}
      {/* display properties of new animation or lisitng all animations */}
      {contentStep?.step === 2 && (
        <div className="flex-1">
          <ControllerBody contentStep={contentStep} />
        </div>
      )}
      {/* controlling animations */}
      <ControllerFooter
        contentStep={contentStep}
        allAnimation={allAnimation}
        setContentStep={setContentStep}
        updateAnimation={updateAnimation}
        setAllAnimation={setAllAnimation}
      />
    </div>
  );
};

export default Controller;
