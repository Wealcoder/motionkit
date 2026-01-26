import PremiumBadge from "@/components/common/PremiumBadge";
import { AssetImage } from "../../../../../../assets/AssetImage";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useDisclosure } from "@/hooks/useDisclosure";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  AddCircleIcon,
  CancelCircleIcon,
} from "@hugeicons/core-free-icons/index";
import { cn } from "@/lib/utils";
import { isPremiumUser } from "@/lib/subscription/subscription";

// animation preset data
const animationPresetTypes = [
  {
    cardtTitle: "Free Animations",
    icon: AssetImage.classAnimationLogo,
    isPro: false,
    config: {
      title: "Animation Title",
      type: "free_animation",
      enable: true,
    },
  },
  {
    cardtTitle: "Custom Animations",
    icon: AssetImage.customAnimationLogo,
    isPro: true,
    config: {
      title: "Animation Title",
      type: "custom",
      enable: true,
      timelines: [],
      animations: [],
      ScrollTrigger: {},
    },
  },
  {
    cardtTitle: "Preset Animations",
    icon: AssetImage.presetAnimationLogo,
    isPro: true,
    config: {
      title: "Animation Title",
      type: "preset",
      enable: true,
    },
  },
];

const GlobalAnimation = ({ handleAddAnimation = () => {} }) => {
  const isPremium = isPremiumUser();
  const { isOpen, onOpen, onClose } = useDisclosure();
  return (
    <Collapsible
      open={isOpen}
      onOpenChange={onOpen}
      className="flex flex-col gap-2"
    >
      <CollapsibleTrigger asChild>
        <Button
          disabled={isOpen}
          className="wcf-ab-button-general  wcf-ab-button-action"
        >
          <HugeiconsIcon
            icon={AddCircleIcon}
            size={16}
            color="currentColor"
            strokeWidth={2}
          />
          Add New Animation
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="grid grid-cols-3 gap-2">
        {animationPresetTypes?.map((preset, index) => (
          <AnimationPresetCard
            key={index}
            preset={preset}
            isPremium={isPremium}
            handleAddAnimation={handleAddAnimation}
          />
        ))}
      </CollapsibleContent>
      <Button
        onClick={onClose}
        className={cn(
          "min-h-9 max-w-[92px] bg-button-cancel px-[6px] py-2 !text-white font-medium text-15 leading-5 tracking-normal rounded-5 border-none outline-none",
          isOpen ? "flex" : "hidden",
        )}
      >
        <HugeiconsIcon
          icon={CancelCircleIcon}
          size={16}
          color="currentColor"
          strokeWidth={1.5}
        />
        Cancel
      </Button>
    </Collapsible>
  );
};

export default GlobalAnimation;

const AnimationPresetCard = ({
  preset = {},
  isPremium = false,
  handleAddAnimation = () => {},
}) => {
  return (
    <button
      onClick={() => {
        if (preset?.config) {
          handleAddAnimation(preset);
          return;
        }
        return;
      }}
      className="h-[96px] px-[26px] py-2 relative flex flex-col justify-center items-center gap-[6.5px] bg-button hover:bg-button-hover rounded-5 border-none cursor-pointer"
    >
      {/* //TODO: need to work on premium badge modal. */}
      {preset?.isPro && isPremium && (
        <div className="absolute top-[10px] right-[10px]">
          <PremiumBadge />
        </div>
      )}
      <img src={preset?.icon} alt={preset?.title} height={"23px"} />
      <p className="m-0 text-xss text-[#FAFAFA] font-normal leading-18 tracking-normal">
        {preset?.cardtTitle ?? ""}
      </p>
    </button>
  );
};
