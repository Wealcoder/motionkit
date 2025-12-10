import { useEffect, useState } from "react";
import AnimationTimingFunc from "./Shared/AnimationTimingFunc";
import AnimationDelay from "./Shared/AnimationDelay";
import AnimationDuration from "./Shared/AnimationDuration";
import AnimationRepeat from "./Shared/AnimationRepeat";
import AnimationTriggerType from "./Shared/AnimationTriggerType";
import TextInput from "./Shared/AnimationItemClassModifier";

const ImageSwashInFreeAnim = ({ contentStep, updateContentData }) => {
  const { data } = contentStep || {};

  const [fullConfig, setFullConfig] = useState({
    triggerType: data?.triggerType || "on_scroll",
    itemClass: data?.itemClass || "",
    styles: {
      animationDelay: data?.styles?.animationDelay || "0s",
      animationDuration: data?.styles?.animationDuration || "1s",
      animationIterationCount: data?.styles?.animationIterationCount || "0s",
      animationTimingFunction: data?.styles?.animationTimingFunction || "ease",
    },
    // handle element initial states
    initElementStyle: {
      visibility: "hidden",
      opacity: 0,
    },
  });

  useEffect(() => {
    const result = { ...contentStep, data: { ...data, ...fullConfig } };
    updateContentData(result);
  }, [fullConfig]);

  return (
    <div className="flex flex-col gap-2 border-b border-border-2 w-full p-3">
      {/* trigger type  */}
      <AnimationTriggerType
        onChange={(value) => {
          setFullConfig((prev) => {
            const newState = { ...prev };
            newState["triggerType"] = value;
            return newState;
          });
        }}
        value={fullConfig?.triggerType}
      />

      {/* item class  */}
      <TextInput
        onChange={(value) => {
          setFullConfig((prev) => {
            const newState = { ...prev };
            newState["itemClass"] = value;
            return newState;
          });
        }}
        value={fullConfig?.itemClass}
        title="Item Class"
      />

      {/* delay  */}
      <AnimationDelay
        onChange={(value) => {
          setFullConfig((prev) => {
            const newState = { ...prev };
            newState.styles["animationDelay"] = value;
            return newState;
          });
        }}
        value={fullConfig?.styles?.animationDelay}
      />

      {/* duration  */}
      <AnimationDuration
        onChange={(value) => {
          setFullConfig((prev) => {
            const newState = { ...prev };
            newState.styles["animationDuration"] = value;
            return newState;
          });
        }}
        value={fullConfig?.styles?.animationDuration}
      />

      {/* easing */}
      <AnimationTimingFunc
        onChange={(value) => {
          setFullConfig((prev) => {
            const newState = { ...prev };
            newState.styles["animationTimingFunction"] = value;
            return newState;
          });
        }}
        value={fullConfig?.styles?.animationTimingFunction}
      />

      {/* repeat */}
      <AnimationRepeat
        onChange={(value) => {
          setFullConfig((prev) => {
            const newState = { ...prev };
            newState.styles["animationIterationCount"] = value;
            return newState;
          });
        }}
        value={fullConfig?.styles?.animationIterationCount}
      />
    </div>
  );
};

export default ImageSwashInFreeAnim;
