import WCFABAddAnimationElement from "@/components/animations/blocks/WCFABAddAnimationElement";
import pageTransitionElementsMappings from "@/config/pageTransitionElementsMap";

const PageTransition = () => {
  return (
    <div className="space-y-5 mb-5">
      <PageTransitionEnterSection properties={pageTransitionElementsMappings} />
      <PageTransitionExitSection properties={pageTransitionElementsMappings} />
    </div>
  );
};

export default PageTransition;

const PageTransitionEnterSection = ({ properties }) => {
  return (
    <div className="flex flex-col gap-[15px] p-3 bg-background-topbar rounded-5">
      <h2 className="text-foreground font-medium text-[13px] leading-5 tracking-normal">
        Enter
      </h2>
      <WCFABAddAnimationElement
        property={{
          title: "Add",
          fieldData: properties,
          size: "lg",
        }}
        onValueChange={(value) => console.log("Enter", { value })}
      />
    </div>
  );
};

const PageTransitionExitSection = ({ properties }) => {
  return (
    <div className="flex flex-col gap-[15px] p-3 bg-background-topbar rounded-5">
      <h2 className="text-foreground font-medium text-[13px] leading-5 tracking-normal">
        Exit
      </h2>
      <WCFABAddAnimationElement
        property={{
          title: "Add",
          fieldData: properties,
          size: "lg",
        }}
        onValueChange={(value) => console.log("Exit", { value })}
      />
    </div>
  );
};
